# `sensor_robot_sim` 实验说明

## 1. 这个 demo 做了什么

这个 demo 对应《嵌入式系统原理》实验五“ROS 机器人运动仿真”。它完成了 3 个核心目标：

- 使用 `URDF` 描述一个简化移动机器人模型
- 在 `Gazebo` 中添加激光雷达传感器和障碍物环境
- 根据 `/scan` 激光数据实现基于传感器的闭环避障控制

整个实验由 4 部分组成：

- `urdf/robot.urdf`：定义机器人底盘、车轮、激光雷达和 Gazebo 插件
- `worlds/simple.world`：定义仿真世界和 3 个障碍物
- `launch/gazebo.launch`：一键启动 Gazebo、模型生成、状态发布和控制节点
- `scripts/obstacle_avoid.py`：订阅激光雷达并发布速度命令

和前面的 Topic、Service 实验不同，这个实验把“机器人模型 + 仿真环境 + 传感器 + 控制逻辑”串联起来了，已经是一个完整的小型 ROS 仿真项目。

## 2. 包内文件说明

```text
sensor_robot_sim/
├── CMakeLists.txt
├── package.xml
├── README.md
├── launch/
│   └── gazebo.launch
├── scripts/
│   └── obstacle_avoid.py
├── urdf/
│   └── robot.urdf
└── worlds/
    └── simple.world
```

- `launch/gazebo.launch`：启动 Gazebo 世界、加载机器人模型、运行状态发布节点和避障节点
- `scripts/obstacle_avoid.py`：读取 `/scan` 激光数据并输出 `/cmd_vel` 控制指令
- `urdf/robot.urdf`：定义机器人本体、差速驱动插件和激光雷达插件
- `worlds/simple.world`：定义地面、光照和 3 个障碍物
- `package.xml`：声明 `rospy`、`sensor_msgs`、`gazebo_ros` 等运行依赖
- `CMakeLists.txt`：让 `catkin` 正确安装 Python 节点

## 3. 运行步骤

先在工作空间根目录编译并加载环境：

```bash
cd ~/catkin_ws
catkin_make
source devel/setup.bash
```

### 3.1 启动仿真

```bash
roslaunch sensor_robot_sim gazebo.launch
```

这个 launch 默认做了几件事：

- 启动 Gazebo 世界
- 读取 `robot.urdf` 到 `robot_description`
- 在 Gazebo 中生成机器人模型
- 启动 `robot_state_publisher`
- 启动避障节点 `obstacle_avoid.py`

### 3.2 无界面验证模式

如果只想验证节点是否正常启动，可以关闭 Gazebo 图形界面：

```bash
roslaunch sensor_robot_sim gazebo.launch gui:=false headless:=true
```

### 3.3 机器人初始位置调节

这个 launch 支持用参数控制机器人出生点：

```bash
roslaunch sensor_robot_sim gazebo.launch x:=1.0 y:=0.4 z:=0.1
```

常用场景如下：

- `x:=0.0 y:=0.0`：更容易观察前方无障碍直行
- `x:=1.0 y:=0.4`：更容易触发向右避障
- `x:=1.0 y:=-0.4`：更容易触发向左避障

### 3.4 Gazebo 端口说明

为了避免和实验机上其他 Gazebo 实例冲突，当前 launch 默认使用：

```text
GAZEBO_MASTER_URI=http://127.0.0.1:11346
```

如果确实需要切换端口，可以这样指定：

```bash
roslaunch sensor_robot_sim gazebo.launch gazebo_master_uri:=http://127.0.0.1:11347
```

## 4. 运行时的三种情况

这个实验当前把避障逻辑明确分成 3 种情况，便于观察和截图。

### 情况 1：前方安全，继续直行

触发条件：

- `front_distance > safe_distance`

程序行为：

- 设置线速度为正值
- 角速度为 `0`
- 机器人持续向前运动

终端日志示例：

```text
Case 1: path clear, move forward.
```

### 情况 2：左侧更拥挤，向右转

触发条件：

- 前方已经接近障碍物
- `left_distance < right_distance`

程序行为：

- 小幅前进
- 角速度为负，机器人向右转

终端日志示例：

```text
Case 2: obstacle closer on left, turn right.
```

### 情况 3：右侧更拥挤，向左转

触发条件：

- 前方已经接近障碍物
- `left_distance >= right_distance`

程序行为：

- 小幅前进
- 角速度为正，机器人向左转

终端日志示例：

```text
Case 3: obstacle closer on right, turn left.
```

## 5. 每个文件是怎么实现的

### 5.1 `robot.urdf`

这个文件负责定义机器人本体和 Gazebo 插件。

#### 机器人结构

- `base_footprint`：虚拟根链接，用来避免根链接惯量引起的 KDL 警告
- `base_link`：矩形底盘
- `left_wheel` / `right_wheel`：左右车轮
- `laser_link`：安装在前方的小型激光雷达

#### 差速驱动插件

使用：

```xml
<plugin name="diff_drive_controller" filename="libgazebo_ros_diff_drive.so">
```

它的作用是：

- 订阅 `/cmd_vel`
- 驱动车轮关节旋转
- 发布 `odom` 和关节状态

#### 激光雷达插件

使用：

```xml
<plugin name="gazebo_ros_laser_controller" filename="libgazebo_ros_laser.so">
```

它的作用是：

- 在 Gazebo 中模拟激光测距
- 发布 `/scan` 话题
- 为避障节点提供输入数据

### 5.2 `simple.world`

这个文件定义仿真环境。

包含内容：

- `sun`：光照
- `ground_plane`：地面
- `box1`、`box2`、`box3`：三个静态障碍物

这三个障碍物被放在机器人前进方向附近，便于观察不同避障动作。

### 5.3 `gazebo.launch`

这个 launch 文件是整个实验的启动入口。

它主要完成以下工作：

1. 设置 Gazebo 端口和插件依赖环境变量
2. 加载 `robot.urdf` 到参数服务器
3. 启动 `empty_world.launch` 并指定 `simple.world`
4. 调用 `spawn_model` 把机器人实体生成到 Gazebo 中
5. 启动 `robot_state_publisher`
6. 启动 `obstacle_avoid.py`

### 5.4 `obstacle_avoid.py`

这个脚本实现了基于激光雷达的闭环控制。

#### 输入

- 订阅 `/scan`
- 消息类型：`sensor_msgs/LaserScan`

#### 输出

- 发布 `/cmd_vel`
- 消息类型：`geometry_msgs/Twist`

#### 处理流程

1. 从激光数据中提取前方、左侧、右侧三个区域
2. 过滤 `inf` 和 `nan`
3. 取每个区域的最小有效距离
4. 根据距离关系进入三种控制情况之一
5. 发布速度命令到 `/cmd_vel`

## 6. 控制逻辑是怎么工作的

### 6.1 前方区域提取

程序把激光扫描分成三个方向区域：

- 前方：机器人正前方一小段角度范围
- 左侧：前左方向一段角度
- 右侧：前右方向一段角度

这样做的目的，是让机器人不仅知道“前面有没有东西”，还知道“左右哪边更空旷”。

### 6.2 为什么这是闭环控制

这个实验不是提前写死轨迹，而是：

- 先读取传感器数据
- 再根据当前环境决定动作
- 运动后继续读取新的传感器数据
- 再次更新动作

因此它属于典型的“传感器反馈闭环控制”。

## 7. 关键 ROS API 总结

### Python 节点相关

- `rospy.init_node()`：初始化节点
- `rospy.Publisher()`：创建 `/cmd_vel` 发布者
- `rospy.Subscriber()`：创建 `/scan` 订阅者
- `rospy.get_param()`：读取控制参数
- `rospy.Rate()`：控制循环频率
- `rospy.loginfo_throttle()`：按固定频率输出日志

### 消息类型

- `sensor_msgs/LaserScan`
  - `ranges`：激光距离数组
- `geometry_msgs/Twist`
  - `linear.x`：线速度
  - `angular.z`：角速度

## 8. 构建配置做了什么

### `package.xml`

声明了实验需要的运行依赖：

- `rospy`
- `roscpp`
- `std_msgs`
- `geometry_msgs`
- `sensor_msgs`
- `gazebo_ros`
- `robot_state_publisher`

### `CMakeLists.txt`

这里没有自定义 C++ 可执行文件，主要做了两件事：

1. 让 `catkin` 找到依赖包
2. 使用 `catkin_install_python()` 安装 `obstacle_avoid.py`

## 9. 结果验证与截图建议

实验提交时，建议至少保留以下截图：

- Gazebo 成功启动，机器人和障碍物都加载完成
- 情况 1：机器人前方无障碍时直行
- 情况 2：机器人向右转避障
- 情况 3：机器人向左转避障
- 启动终端中出现三类 `Case 1 / Case 2 / Case 3` 日志

## 10. 小结

这个实验把 ROS 中几个很重要的知识点串起来了：

- 用 `URDF` 建模机器人
- 用 Gazebo 插件模拟传感器和驱动
- 用 `/scan` 做环境感知
- 用 `/cmd_vel` 做运动控制
- 用闭环逻辑实现基础避障

如果前面几个实验更像“单一通信机制练习”，那么这个实验已经是一个完整的机器人仿真小系统。
