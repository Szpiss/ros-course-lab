# `turtle_topic_demo` 实验说明

## 1. 这个 demo 做了什么

这个 demo 演示了 ROS Topic 的典型发布/订阅模型，目标是控制 `turtlesim` 中的小海龟运动，并观察速度消息是如何在节点之间流动的。

包里一共实现了 3 个 Python 节点：

- `pub_circle.py`：持续发布速度，让海龟画圆
- `pub_square.py`：按时间片依次“直行 + 转向”，让海龟画方形
- `sub_vel.py`：订阅速度话题，把接收到的速度打印出来

它们围绕同一个话题工作：

```text
/turtle1/cmd_vel   geometry_msgs/Twist
```

`turtlesim_node` 会订阅这个话题，并把收到的线速度与角速度转换成画面中的海龟运动。

## 2. 包内文件说明

```text
turtle_topic_demo/
├── CMakeLists.txt
├── package.xml
├── README.md
└── scripts/
    ├── pub_circle.py
    ├── pub_square.py
    └── sub_vel.py
```

- `scripts/pub_circle.py`：圆周运动发布节点
- `scripts/pub_square.py`：方形轨迹发布节点
- `scripts/sub_vel.py`：速度消息订阅节点
- `package.xml`：声明 `rospy`、`geometry_msgs`、`turtlesim` 运行依赖
- `CMakeLists.txt`：让 `catkin` 正确识别这个 ROS 包

## 3. 运行步骤

先在工作空间根目录编译并加载环境：

```bash
cd /Users/cuing/ros/ros-course-lab
catkin_make
source devel/setup.bash
```

### 3.1 启动 ROS Master

```bash
roscore
```

### 3.2 启动海龟仿真器

新开终端并执行：

```bash
cd /Users/cuing/ros/ros-course-lab
source devel/setup.bash
rosrun turtlesim turtlesim_node
```

### 3.3 观察速度话题

再开一个终端执行：

```bash
cd /Users/cuing/ros/ros-course-lab
source devel/setup.bash
rosrun turtle_topic_demo sub_vel.py
```

### 3.4 运行圆形轨迹 demo

```bash
cd /Users/cuing/ros/ros-course-lab
source devel/setup.bash
rosrun turtle_topic_demo pub_circle.py
```

运行后会看到海龟持续画圆，`sub_vel.py` 会不断打印类似下面的日志：

```text
linear.x = 0.100, angular.z = 0.200
```

### 3.5 运行方形轨迹 demo

停止圆形节点后，再运行：

```bash
cd /Users/cuing/ros/ros-course-lab
source devel/setup.bash
rosrun turtle_topic_demo pub_square.py
```

运行后海龟会依次完成 4 次“直行 + 左转”，最终画出近似方形的轨迹。

## 4. 每个脚本是怎么实现的

### 4.1 `pub_circle.py`

这个脚本的逻辑非常直接：创建一个发布者，然后循环发送固定速度。

#### 执行流程

1. `rospy.init_node('pub_circle')`
   作用：初始化当前 ROS 节点，节点名是 `pub_circle`。
2. `rospy.Publisher('/turtle1/cmd_vel', Twist, queue_size=10)`
   作用：创建一个 Topic 发布者，向 `/turtle1/cmd_vel` 发送 `Twist` 消息。
3. `rate = rospy.Rate(10)`
   作用：把循环频率限制为 10Hz，避免无限快发送。
4. `vel_msg = Twist()`
   作用：创建速度消息对象。
5. `vel_msg.linear.x = 0.1`
   作用：设置前进线速度。
6. `vel_msg.angular.z = 0.2`
   作用：设置绕 z 轴的角速度。
7. `while not rospy.is_shutdown():`
   作用：只要 ROS 没关闭就持续运行。
8. `pub.publish(vel_msg)`
   作用：把速度消息发布到话题上。
9. `rate.sleep()`
   作用：让循环按 10Hz 节奏执行。

#### 为什么会画圆

因为它同时设置了：

- `linear.x > 0`：向前走
- `angular.z > 0`：持续左转

线速度和角速度同时存在时，海龟就会沿圆弧运动，持续发布时就形成圆轨迹。

### 4.2 `pub_square.py`

这个脚本的核心思路不是一次性算出方形坐标，而是把运动拆成多个阶段，通过“定速运动持续一段时间”来拼出轨迹。

#### 关键函数：`move(pub, linear_x, angular_z, duration)`

这个函数负责执行一个运动片段。

1. `vel_msg = Twist()`
   作用：构造当前片段的速度命令。
2. `vel_msg.linear.x = linear_x`
   作用：设置当前片段的线速度。
3. `vel_msg.angular.z = angular_z`
   作用：设置当前片段的角速度。
4. `start_time = rospy.Time.now().to_sec()`
   作用：记录片段开始时间。
5. `rate = rospy.Rate(10)`
   作用：让该片段以 10Hz 连续发命令。
6. `current_time = rospy.Time.now().to_sec()`
   作用：每轮循环重新读取当前时间。
7. `if current_time - start_time >= duration: break`
   作用：到达目标持续时长后结束当前片段。
8. `pub.publish(vel_msg)`
   作用：持续给海龟发送当前片段的速度指令。
9. `pub.publish(Twist())`
   作用：片段结束后发送零速度，让海龟停下来。
10. `rospy.sleep(0.5)`
   作用：在两个动作片段之间短暂停顿，使轨迹切换更稳定。

#### `main()` 是怎么把方形拼出来的

1. `rospy.init_node('pub_square')`
   作用：初始化节点。
2. `pub = rospy.Publisher('/turtle1/cmd_vel', Twist, queue_size=10)`
   作用：创建速度发布者。
3. `rospy.sleep(1)`
   作用：等待发布者与订阅者建立连接，避免程序一启动就发消息导致前几条指令丢失。
4. `side_time = 20.0`
   作用：定义“直行”持续时间。
5. `turn_time = 7.85`
   作用：定义“转向”持续时间。
6. `for _ in range(4):`
   作用：循环 4 次，形成 4 条边和 4 个拐角。
7. `move(pub, 0.1, 0.0, side_time)`
   作用：只给线速度，不给角速度，让海龟走直线。
8. `move(pub, 0.0, 0.2, turn_time)`
   作用：只给角速度，不给线速度，让海龟原地左转。

#### 为什么能画出方形

因为每次循环都执行：

- 一段直线运动
- 一段定角速度转向

这样连续执行 4 次，就能得到 4 条边和 4 个拐角。这里的 `20.0` 和 `7.85` 是通过时间近似控制边长和转角，因此轨迹是“近似方形”，不是严格几何计算得到的完美方形。

### 4.3 `sub_vel.py`

这个脚本用于观察 Topic 通信是否真的发生了。

#### 执行流程

1. `rospy.init_node('sub_vel')`
   作用：初始化订阅节点。
2. `rospy.Subscriber('/turtle1/cmd_vel', Twist, callback)`
   作用：订阅 `/turtle1/cmd_vel` 话题，只要收到 `Twist` 消息就触发 `callback`。
3. `callback(msg)`
   作用：处理收到的消息。
4. `rospy.loginfo("linear.x = %.3f, angular.z = %.3f", ...)`
   作用：把消息中的线速度和角速度打印到终端。
5. `rospy.spin()`
   作用：让节点保持运行状态，持续等待回调触发。

#### 它验证了什么

它验证了发布节点确实把 `Twist` 消息发到了 `/turtle1/cmd_vel`，并且订阅者可以收到相同的数据。也就是说，这个脚本不是控制海龟本身，而是负责观察 Topic 链路。

## 5. 关键 ROS API 总结

### Python 节点相关

- `rospy.init_node()`：初始化 ROS 节点
- `rospy.Publisher()`：创建发布者
- `rospy.Subscriber()`：创建订阅者
- `publish()`：向 Topic 发送消息
- `rospy.Rate()`：控制循环频率
- `rospy.is_shutdown()`：判断 ROS 是否正在退出
- `rospy.spin()`：让订阅节点持续等待消息
- `rospy.Time.now().to_sec()`：获取当前 ROS 时间并转为秒
- `rospy.sleep()`：延时等待

### 消息类型

- `geometry_msgs/Twist`
  - `linear.x`：前进/后退速度
  - `angular.z`：绕 z 轴旋转速度

## 6. 构建配置做了什么

### `package.xml`

这个文件声明了该包依赖：

- `rospy`：运行 Python ROS 节点
- `geometry_msgs`：提供 `Twist` 消息类型
- `turtlesim`：提供海龟仿真环境

### `CMakeLists.txt`

虽然这个包没有 C++ 可执行文件，也没有自定义消息，但这里的配置仍然完成了两件事：

1. `find_package(catkin REQUIRED COMPONENTS geometry_msgs rospy turtlesim)`
   作用：告诉 `catkin` 该包依赖哪些 ROS 组件。
2. `catkin_package()`
   作用：把这个包注册为标准 catkin 包，供工作空间统一构建。

## 7. 实验结论

这个 demo 展示了 ROS Topic 通信最常见的使用方式：

- 发布者节点通过 `Publisher` 向 Topic 发送消息
- 订阅者节点通过 `Subscriber` 接收消息
- `turtlesim_node` 作为实际执行者，根据速度消息驱动海龟运动

通过这组脚本，可以直观看到“发送速度指令 -> 话题传输 -> 海龟运动 -> 订阅者输出日志”的完整链路。
