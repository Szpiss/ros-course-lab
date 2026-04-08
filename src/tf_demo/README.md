# `tf_demo` 实验说明

## 1. 这个 demo 做了什么

这个 demo 对应实验四，演示的是 ROS 中 `tf` 坐标变换的基本用法。它围绕 `turtlesim` 中的小海龟做了一条完整的数据链路：

1. `turtlesim_node` 持续发布海龟当前位姿 `/turtle1/pose`
2. `tf_broadcaster.py` 订阅这个位姿，并把它转换成 `world -> turtle1` 的 TF 变换
3. `tf_listener.py` 监听 TF 树，读取 `world` 到 `turtle1` 的最新坐标变换并打印出来

换句话说，这个 demo 的核心不是控制海龟运动，而是让我们理解：

- 坐标系是怎么建立的
- 位姿数据是怎么转换成 TF 的
- 其他节点又是怎么从 TF 树中取回坐标关系的

## 2. 包内文件说明

```text
tf_demo/
├── CMakeLists.txt
├── package.xml
├── README.md
├── launch/
│   └── tf_demo.launch
└── scripts/
    ├── tf_broadcaster.py
    └── tf_listener.py
```

- `scripts/tf_broadcaster.py`：TF 广播节点，把海龟位姿转换成 TF 变换
- `scripts/tf_listener.py`：TF 监听节点，从 TF 树中读取坐标变换
- `launch/tf_demo.launch`：一次性启动 `turtlesim`、广播端和监听端
- `package.xml`：声明 `rospy`、`tf`、`turtlesim` 等依赖
- `CMakeLists.txt`：声明该包为 catkin 包，并配置编译依赖

## 3. 这个 demo 的整体通信关系

```text
/turtle1/pose (turtlesim/Pose)
        |
        v
tf_broadcaster.py
        |
        v
TF: world -> turtle1
        |
        v
tf_listener.py
```

### 每一层的作用

- `/turtle1/pose`
  - 由 `turtlesim_node` 发布
  - 包含海龟当前位置 `x、y` 和朝向 `theta`
- `tf_broadcaster.py`
  - 负责把普通消息转换成 TF 坐标变换
- `TF: world -> turtle1`
  - 表示“海龟坐标系相对于世界坐标系”的位置和姿态
- `tf_listener.py`
  - 不直接订阅 `/turtle1/pose`
  - 而是通过 TF 系统统一获取坐标关系

## 4. 运行步骤

先在工作空间根目录编译并加载环境：

```bash
cd /Users/cuing/ros/ros-course-lab
catkin_make
source devel/setup.bash
```

### 4.1 启动 ROS Master

```bash
roscore
```

### 4.2 推荐方式：直接使用 launch 文件启动

新开终端并执行：

```bash
cd /Users/cuing/ros/ros-course-lab
source devel/setup.bash
roslaunch tf_demo tf_demo.launch
```

这个命令会同时启动：

- `turtlesim_node`
- `tf_broadcaster.py`
- `tf_listener.py`

运行后你会看到：

- 弹出 `turtlesim` 窗口
- 终端持续输出海龟相对于 `world` 的平移和旋转四元数

### 4.3 手动分步启动

如果想更清楚地观察每个节点，也可以分开启动。

#### 第一步：启动海龟仿真器

```bash
cd /Users/cuing/ros/ros-course-lab
source devel/setup.bash
rosrun turtlesim turtlesim_node
```

#### 第二步：启动 TF 广播节点

```bash
cd /Users/cuing/ros/ros-course-lab
source devel/setup.bash
rosrun tf_demo tf_broadcaster.py
```

#### 第三步：启动 TF 监听节点

```bash
cd /Users/cuing/ros/ros-course-lab
source devel/setup.bash
rosrun tf_demo tf_listener.py
```

## 5. `tf_broadcaster.py` 是怎么工作的

这个脚本的职责是：把 `turtlesim` 的位姿消息转换成标准 TF 变换。

### 5.1 节点主流程

1. `rospy.init_node("tf_broadcaster")`
   作用：初始化广播节点。
2. `rospy.Subscriber("/turtle1/pose", turtlesim.msg.Pose, pose_callback)`
   作用：订阅海龟位姿话题，只要海龟位置变化，回调函数就会收到最新位姿。
3. `rospy.spin()`
   作用：让节点持续运行，等待消息触发回调。

### 5.2 `pose_callback(msg)` 做了什么

#### 第一步：创建广播器

```python
br = tf.TransformBroadcaster()
```

作用：创建一个 TF 广播对象，用来向 TF 树发布坐标变换。

#### 第二步：发送坐标变换

```python
br.sendTransform(
    (msg.x, msg.y, 0.0),
    tf.transformations.quaternion_from_euler(0, 0, msg.theta),
    rospy.Time.now(),
    "turtle1",
    "world"
)
```

这是这个 demo 最关键的一段代码。

### `sendTransform()` 的每个参数分别表示什么

1. `(msg.x, msg.y, 0.0)`
   作用：平移量，也就是 `turtle1` 相对于 `world` 的位置。
   - `msg.x`：海龟当前 x 坐标
   - `msg.y`：海龟当前 y 坐标
   - `0.0`：二维平面里 z 坐标固定为 0
2. `tf.transformations.quaternion_from_euler(0, 0, msg.theta)`
   作用：把欧拉角转换成四元数。
   - `msg.theta` 是海龟在平面内的朝向角
   - TF 里旋转通常用四元数表达，所以这里必须先做转换
3. `rospy.Time.now()`
   作用：给这次变换打上当前时间戳
4. `"turtle1"`
   作用：子坐标系名称
5. `"world"`
   作用：父坐标系名称

### 为什么要从欧拉角转成四元数

因为 `turtlesim/Pose` 中的方向是单个角度 `theta`，而 TF 在表示旋转时更常用四元数。`tf.transformations.quaternion_from_euler()` 就完成了这一步转换，让位姿可以被标准 TF 系统使用。

## 6. `tf_listener.py` 是怎么工作的

这个脚本的职责是：从 TF 系统里读取当前坐标关系，而不是直接处理原始位姿话题。

### 6.1 节点主流程

1. `rospy.init_node("tf_listener")`
   作用：初始化监听节点。
2. `listener = tf.TransformListener()`
   作用：创建 TF 监听器，用于查询 TF 树中的坐标变换。
3. `rate = rospy.Rate(10.0)`
   作用：把查询频率控制在 10Hz。
4. `while not rospy.is_shutdown():`
   作用：只要 ROS 没关闭就持续查询。

### 6.2 最关键的函数：`lookupTransform()`

```python
(trans, rot) = listener.lookupTransform('/world', '/turtle1', rospy.Time(0))
```

这行代码表示：

- 查询目标坐标系：`/world`
- 查询源坐标系：`/turtle1`
- 查询时间：`rospy.Time(0)`，表示取最新可用变换

返回值分成两部分：

- `trans`
  - 平移向量 `(x, y, z)`
- `rot`
  - 旋转四元数 `(x, y, z, w)`

### 6.3 查询成功后做了什么

#### 打印平移信息

```python
rospy.loginfo("平移: x=%.3f, y=%.3f, z=%.3f", trans[0], trans[1], trans[2])
```

作用：输出当前海龟在 `world` 坐标系下的位置。

#### 打印旋转四元数

```python
rospy.loginfo("旋转四元数: x=%.3f, y=%.3f, z=%.3f, w=%.3f", rot[0], rot[1], rot[2], rot[3])
```

作用：输出当前海龟朝向对应的四元数表示。

### 6.4 为什么要捕获异常

```python
except (tf.LookupException, tf.ConnectivityException, tf.ExtrapolationException):
    pass
```

这是为了处理 TF 系统刚启动时常见的情况，例如：

- 还没有收到任何变换数据
- 坐标系之间暂时还没连通
- 请求的时间点没有可用数据

如果不捕获这些异常，节点在启动初期可能会直接报错退出。

## 7. `tf_demo.launch` 做了什么

`launch/tf_demo.launch` 的内容很简单，但很适合实验演示：

```xml
<launch>
    <node pkg="turtlesim" type="turtlesim_node" name="sim"/>
    <node pkg="tf_demo" type="tf_broadcaster.py" name="tf_broadcaster" output="screen"/>
    <node pkg="tf_demo" type="tf_listener.py" name="tf_listener" output="screen"/>
</launch>
```

### 每个节点的作用

- `turtlesim_node`
  - 提供海龟仿真环境
  - 发布 `/turtle1/pose`
- `tf_broadcaster.py`
  - 把 `/turtle1/pose` 转成 TF 变换
- `tf_listener.py`
  - 从 TF 树读取 `world -> turtle1` 的位置和姿态

`output="screen"` 的作用是把节点日志直接打印到终端，便于实验观察。

## 8. 构建配置做了什么

### `package.xml`

这个文件声明了该包的核心依赖：

- `rospy`：编写 Python ROS 节点
- `tf`：使用 TF 广播和监听功能
- `turtlesim`：提供海龟仿真器和 `Pose` 消息类型
- `geometry_msgs`、`roscpp`
  - 当前脚本里没有直接大量使用，但作为包依赖已经被声明

### `CMakeLists.txt`

这个包没有自定义消息，也没有 C++ 可执行文件，但依然通过下面这行让 catkin 知道它依赖哪些组件：

```cmake
find_package(catkin REQUIRED COMPONENTS
  geometry_msgs
  roscpp
  rospy
  tf
  turtlesim
)
```

同时通过：

```cmake
catkin_package()
```

把它注册成标准 catkin 包，纳入工作空间统一构建。

## 9. 运行时你会观察到什么

当海龟移动时，`/turtle1/pose` 中的 `x、y、theta` 会变化，于是：

1. `tf_broadcaster.py` 会广播新的 TF 变换
2. `tf_listener.py` 会读取最新变换
3. 终端输出的平移和旋转四元数会不断更新

如果此时再用键盘控制海龟移动，日志中的位置和姿态也会实时变化，这能直观看到 TF 树中的坐标关系是动态更新的。

## 10. 关键 ROS / TF API 总结

- `rospy.init_node()`：初始化 ROS 节点
- `rospy.Subscriber()`：订阅 `/turtle1/pose`
- `rospy.spin()`：保持节点运行，等待消息
- `tf.TransformBroadcaster()`：创建 TF 广播器
- `sendTransform()`：向 TF 树发送变换
- `tf.transformations.quaternion_from_euler()`：把欧拉角转换成四元数
- `tf.TransformListener()`：创建 TF 监听器
- `lookupTransform()`：查询两个坐标系之间的变换
- `rospy.Rate()`：控制循环查询频率
- `rospy.Time.now()`：获取当前时间戳
- `rospy.Time(0)`：获取最新可用 TF 变换

## 11. 实验结论

这个 demo 展示了 ROS TF 的基本工作方式：

1. 先从普通消息中获得位置与姿态
2. 再通过 TF 广播节点把这些信息组织成坐标系关系
3. 最后通过 TF 监听节点按需查询坐标变换

它非常适合用来理解“数据发布”和“坐标关系管理”之间的区别。普通 Topic 更像是在传原始数据，而 TF 更像是在维护整个系统里的空间关系。
