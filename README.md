# ROS 课程实验仓库

本仓库是一个 `catkin` 工作空间，用来保存《嵌入式系统原理》课程中的 ROS 实验代码与实验报告。当前已经包含实验 1 到实验 8 的报告，以及实验 2 到实验 6 的 ROS 代码整理。其中前 4 个是独立 demo，实验六额外整理成了一个导航补充包：

- `turtle_topic_demo`：实验二，基于 Topic 的发布/订阅通信
- `service_demo`：实验三，基于 Service 的请求/响应通信
- `tf_demo`：实验四，基于 TF 的坐标变换广播与监听
- `sensor_robot_sim`：实验五，基于传感器的机器人运动仿真
- `lab6_navigation_demo`：实验六，基于建图、命名航点和语音结果触发的自主导航补充代码

## 实验环境

- Ubuntu 20.04.5 LTS
- ROS Noetic
- Python 3
- `catkin_make`
- `turtlesim`
- Gazebo 11

## 仓库结构

```text
ros-course-lab/
├── README.md
├── docs/
│   └── reports/
│       ├── 2315302125 崔子霖1.docx
│       ├── 2315302125 崔子霖2.docx
│       ├── 2315302125 崔子霖3.docx
│       ├── 2315302125 崔子霖4.docx
│       ├── 2315302125 崔子霖5.docx
│       ├── 2315302125 崔子霖6.docx
│       ├── 2315302125 崔子霖7.docx
│       ├── 2315302125 崔子霖8.docx
│       ├── README.md
│       └── 03069011 嵌入式系统原理_实验报告-模板.docx
└── src/
    ├── lab6_navigation_demo/
    │   ├── CMakeLists.txt
    │   ├── package.xml
    │   ├── README.md
    │   ├── launch/
    │   │   └── lab6_voice_navigation.launch
    │   ├── maps/
    │   │   ├── map.pgm
    │   │   └── map.yaml
    │   └── scripts/
    │       ├── lab6_voice_bridge.py
    │       └── setup_lab6_navigation.py
    ├── tf_demo/
    │   ├── CMakeLists.txt
    │   ├── package.xml
    │   ├── README.md
    │   ├── launch/
    │   │   └── tf_demo.launch
    │   └── scripts/
    │       ├── tf_broadcaster.py
    │       └── tf_listener.py
    ├── turtle_topic_demo/
    │   ├── CMakeLists.txt
    │   ├── package.xml
    │   ├── README.md
    │   └── scripts/
    │       ├── pub_circle.py
    │       ├── pub_square.py
    │       └── sub_vel.py
    ├── service_demo/
    │   ├── CMakeLists.txt
    │   ├── package.xml
    │   ├── README.md
    │   ├── src/
    │   │   ├── client.cpp
    │   │   └── server.cpp
    │   └── srv/
    │       └── AddTwoInts.srv
    └── sensor_robot_sim/
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

## Demo 导航

- [实验二：Topic 通信 Demo](src/turtle_topic_demo/README.md)
- [实验三：Service 通信 Demo](src/service_demo/README.md)
- [实验四：TF 坐标变换 Demo](src/tf_demo/README.md)
- [实验五：传感器仿真与机器人运动 Demo](src/sensor_robot_sim/README.md)
- [实验六：语音识别与自主导航补充代码](src/lab6_navigation_demo/README.md)
- [实验七、八：实验报告目录](docs/reports/README.md)

## 快速开始

### 1. 编译工作空间

在仓库根目录执行：

```bash
cd /Users/cuing/ros/ros-course-lab
catkin_make
source devel/setup.bash
```

### 2. 启动 ROS Master

```bash
roscore
```

### 3. 按需运行具体实验

- Topic 实验说明见 [src/turtle_topic_demo/README.md](src/turtle_topic_demo/README.md)
- Service 实验说明见 [src/service_demo/README.md](src/service_demo/README.md)
- TF 实验说明见 [src/tf_demo/README.md](src/tf_demo/README.md)
- 传感器仿真实验说明见 [src/sensor_robot_sim/README.md](src/sensor_robot_sim/README.md)
- 语音导航实验说明见 [src/lab6_navigation_demo/README.md](src/lab6_navigation_demo/README.md)
- 实验七、八的报告说明见 [docs/reports/README.md](docs/reports/README.md)

## 实验清单

| 实验 | 主题 | 目录 | 关键能力 |
| --- | --- | --- | --- |
| 实验一 | 环境搭建与工具链配置 | `docs/reports/` | Ubuntu、ROS Noetic、VS Code、虚拟机 |
| 实验二 | Topic 通信 | `src/turtle_topic_demo` | `Publisher`、`Subscriber`、`Twist` |
| 实验三 | Service 通信 | `src/service_demo` | `.srv`、`advertiseService()`、`call()` |
| 实验四 | TF 坐标变换 | `src/tf_demo` | `TransformBroadcaster`、`TransformListener`、`lookupTransform()` |
| 实验五 | 传感器仿真与机器人运动 | `src/sensor_robot_sim` | `URDF`、Gazebo、`LaserScan`、闭环避障 |
| 实验六 | 机器人语音识别和自主导航综合实例 | `src/lab6_navigation_demo` | `map_server`、`amcl`、`move_base`、命名航点、语音结果映射 |
| 实验七 | OpenCV 平面视觉检测仿真 | `docs/reports/2315302125 崔子霖7.docx` | `OpenCV`、`CvBridge`、HSV 阈值分割、颜色目标跟随、人脸检测 |
| 实验八 | 机器人三维视觉仿真 | `docs/reports/2315302125 崔子霖8.docx` | 点云检测、`/wpb_home/objects_3d`、目标坐标、机械臂抓取 |

## 当前实验说明

### 1. `turtle_topic_demo`

这个包使用 `rospy` 和 `geometry_msgs/Twist`，向 `turtlesim` 的 `/turtle1/cmd_vel` 话题发布速度指令，并订阅同一话题观察速度消息。

- `pub_circle.py`：持续发布线速度和角速度，让海龟画圆
- `pub_square.py`：通过“直行 + 转弯”的时间控制组合，让海龟画方形
- `sub_vel.py`：订阅速度指令并输出日志，验证 Topic 数据流

### 2. `service_demo`

这个包自定义了 `AddTwoInts.srv` 服务类型，并分别实现了服务端与客户端。

- `server.cpp`：注册 `add_two_ints` 服务，收到请求后计算 `a + b`
- `client.cpp`：向服务端发送两个整数并打印返回结果
- `AddTwoInts.srv`：定义请求字段 `a`、`b` 和响应字段 `sum`

### 3. `tf_demo`

这个包演示 `tf` 坐标变换的广播与监听，围绕 `turtlesim` 建立 `world -> turtle1` 的动态坐标关系。

- `tf_broadcaster.py`：订阅 `/turtle1/pose`，并用 `sendTransform()` 广播 TF 变换
- `tf_listener.py`：通过 `lookupTransform()` 读取 `world` 到 `turtle1` 的最新变换
- `tf_demo.launch`：一次性启动 `turtlesim`、TF 广播端和监听端

### 4. `sensor_robot_sim`

这个包使用 `URDF`、`Gazebo` 和 `LaserScan` 完成一个基础移动机器人仿真，并基于传感器反馈实现闭环避障。

- `robot.urdf`：定义底盘、车轮、激光雷达以及 Gazebo 驱动/传感器插件
- `simple.world`：定义带障碍物的仿真世界
- `gazebo.launch`：一键启动 Gazebo、生成机器人并运行控制节点
- `obstacle_avoid.py`：订阅 `/scan` 并发布 `/cmd_vel`，区分三种情况实现直行、左转、右转

### 5. `lab6_navigation_demo`

这个包整理了实验六在 Ubuntu 中真正新增的实验专用代码和地图成果，配合现成的导航仿真环境完成“建图 + 航点 + 语音触发导航”。

- `maps/map.pgm`、`maps/map.yaml`：实验六实际建图后保存回仓库的地图文件
- `setup_lab6_navigation.py`：发布 `/initialpose`、写入 4 个房间航点，并发送示例导航目标
- `lab6_voice_bridge.py`：订阅 `/xfyun/iat`，把英文房间名映射为 `/waterplus/navi_waypoint`
- `lab6_voice_navigation.launch`：一键启动实验六辅助节点

说明：实验六目录保存的是“本次实验新增与整理出的代码、地图和说明”，默认依赖 Ubuntu 实验环境中已安装的 `wpr_simulation`、`waterplus_map_tools`、`wpb_home_tutorials` 等导航仿真包。

## 课程实验报告

实验报告模板和已完成报告保存在 `docs/reports/` 目录中，可用于课程提交或后续整理。当前已经包含实验 1 到实验 8 的报告，其中实验七、实验八为 Ubuntu ROS 仿真环境中完成后整理出的报告材料：

- 实验七：使用 OpenCV 来进行平面视觉检测仿真，包含绿色球跟随和人脸检测。
- 实验八：机器人三维视觉仿真，包含三维点云目标检测、坐标读取和机械臂抓取验证。

报告目录说明见 [docs/reports/README.md](docs/reports/README.md)。
