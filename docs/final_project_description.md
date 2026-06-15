# 基于 ROS + Gazebo 的山地-城市融合多机器人协同仿真系统

## 项目最终效果

本项目在原有“山地小车 Gazebo 仿真”的基础上，扩展为一个综合仿真展示系统：

- Gazebo 中保留原有山地地形、蛇形山路、岩石障碍物和红旗检查点；
- 山地道路旁新增城市街景区域，包含主道路、支路、十字路口、人行道、建筑群、路灯、树木、路牌和障碍物；
- 原有四轮小车继续作为地面运动机器人，可通过 `/cmd_vel` 控制；
- 天空中新增简化四旋翼无人机，无人机在山地与城市上方循环巡航；
- 通过一个 launch 文件启动完整场景，适合课程大作业答辩演示。

## 当前新增内容

新增内容集中在 `src/mountain_car_sim` 包中：

```text
src/mountain_car_sim/
├── launch/
│   └── mountain_city_air_demo.launch
├── models/
│   ├── simple_city/
│   │   ├── model.config
│   │   └── model.sdf
│   ├── showcase_city_details/
│   │   ├── model.config
│   │   └── model.sdf
│   ├── mountain_showcase_details/
│   │   ├── model.config
│   │   └── model.sdf
│   ├── mountain_city_transition/
│   │   ├── model.config
│   │   └── model.sdf
│   ├── simple_drone/
│       ├── model.config
│       └── model.sdf
│   └── simple_airplane/
│       ├── model.config
│       └── model.sdf
├── scripts/
│   └── uav_patrol_demo.py
└── worlds/
    └── mountain_city_air_demo.world
```

## 原有山地小车项目

原有大作业包是 `mountain_car_sim`：

- `worlds/mountain_scene.world`：原山地场景；
- `models/mountain_terrain`：山地 mesh 模型；
- `models/rock_obstacle`：山路障碍物；
- `models/checkpoint_flag`：终点红旗；
- `urdf/mountain_car.xacro`：四轮小车模型；
- `launch/demo.launch`：原山地小车一键演示；
- `scripts/autonomous_flag_nav.py`：沿山路自动寻旗；
- `scripts/simple_car_controller.py`：自动巡航或 WASD 控制。

小车模型采用 Xacro/URDF 描述，通过 `spawn_mountain_car.launch` 生成到 Gazebo 中。车体使用 `libgazebo_ros_planar_move.so` 插件订阅 `/cmd_vel`，因此可以用 ROS 话题控制线速度和角速度。

## 城市场景实现方式

城市场景没有使用 CARLA、OpenStreetMap 或复杂 city generator，而是使用轻量 SDF 基础几何体手写，保证 ROS Noetic + Gazebo Classic 兼容和启动稳定。

- 主道路：深灰色薄 box；
- 支路和十字路口：薄 box 交叉组合；
- 城市连接道路：从山地出口延伸到城市主路；
- 道路标线：黄色和白色细长 box；
- 人行道：浅灰色薄 box；
- 建筑物群：不同高度、颜色和尺寸的 box；
- 路灯：cylinder 灯杆 + box 灯头；
- 树木：cylinder 树干 + sphere 树冠；
- 路牌：cylinder 杆 + box 标志牌；
- 障碍物：橙色 box，放置在城市道路边缘。

城市模型位于：

```bash
src/mountain_car_sim/models/simple_city/model.sdf
```

为了让默认视角下更像街区，还额外加入了展示细节层：

```bash
src/mountain_car_sim/models/showcase_city_details/model.sdf
```

该模型包含店铺立面、广告牌、交通龙门架、停车位、施工区和低空航迹标记。

综合 world 通过以下方式导入城市：

```xml
<include>
  <name>simple_city</name>
  <uri>model://simple_city</uri>
</include>
```

## 山地和城市融合方式

综合 world 文件是：

```bash
src/mountain_car_sim/worlds/mountain_city_air_demo.world
```

该 world 保留原有 `mountain_terrain`、岩石障碍物和红旗，同时在山地右侧加入 `simple_city`。城市主路从山地区域向右延伸，使用连接道路把山地出口和城市道路接在同一 Gazebo world 中。默认小车出生点放在连接道路附近，启动后可以看到山地、城市和小车处在同一连续场景内。

山地部分也新增了展示细节层：

```bash
src/mountain_car_sim/models/mountain_showcase_details/model.sdf
```

该模型包含山路护栏、入口门架、落石警示牌、城市方向牌、观景平台、帐篷营地、松树、灌木、碎石和风向袋；原始山地 mesh 保持不动，细节层通过 world 中的 `model://mountain_showcase_details` 叠加显示。

山地与城市连接处使用独立过渡模型：

```bash
src/mountain_car_sim/models/mountain_city_transition/model.sdf
```

它叠加在山路出口和城市入口之间，使用“土路 - 砂石 - 柏油路”的分层路面、挡墙、土肩、路缘石、木护栏过渡到金属护栏、入口门架、方向牌、路灯、树和灌木，让山地到城市不是突然硬切。

## 飞机/无人机模型实现方式

最终演示优先展示一个更醒目的固定翼飞机：

```bash
src/mountain_car_sim/models/simple_airplane/model.sdf
```

它包含机身、主翼、尾翼、垂尾、螺旋桨圆盘和驾驶舱，尺寸更大，高度更低，打开 Gazebo 后更容易一眼看到。

简化四旋翼无人机模型仍保留在：

```bash
src/mountain_car_sim/models/simple_drone/model.sdf
```

该模型是简化四旋翼结构：

- 中心机身：box；
- 前后左右机臂：thin box；
- 四个旋翼盘：cylinder；
- 前向标记：红色 sphere，用于观察飞行方向。

模型没有依赖 PX4、MAVROS 或复杂飞控环境，目的是稳定展示空中机器人与地面小车在同一 Gazebo 场景中的协同仿真效果。

## 飞行控制脚本

飞行脚本位于：

```bash
src/mountain_car_sim/scripts/uav_patrol_demo.py
```

该节点通过 Gazebo 服务控制无人机：

```text
/gazebo/set_model_state
```

脚本会等待 Gazebo 服务和模型出现，然后按椭圆轨迹持续设置无人机位置和朝向。默认轨迹覆盖山地出口、城市主路和建筑群上空：

- 默认模型名：`patrol_airplane`
- 默认高度：`6.2 m`
- 默认速度：`2.2 m/s`
- 姿态：yaw 跟随飞行方向，roll/pitch 保持 0

这种方式不是为了模拟真实空气动力学，而是为了课程演示中的稳定性、可解释性和可复现性。

## 编译方法

如果仓库已经在 catkin 工作空间根目录：

```bash
cd ~/catkin_ws
catkin_make
source devel/setup.bash
```

如果从 GitHub 重新克隆：

```bash
cd ~/catkin_ws/src
git clone git@github.com:Szpiss/ros-course-lab.git
cd ..
catkin_make
source devel/setup.bash
```

## 启动完整综合场景

```bash
roslaunch mountain_car_sim mountain_city_air_demo.launch
```

启动后 Gazebo 会加载：

- 山地地形；
- 城市街景；
- 原有小车；
- 低空巡航飞机；
- 简化无人机；
- 小车自动演示节点；
- 无人机巡航节点。

可选参数示例：

```bash
roslaunch mountain_car_sim mountain_city_air_demo.launch start_car_controller:=false
roslaunch mountain_car_sim mountain_city_air_demo.launch air_altitude:=7.0 air_speed:=2.5
roslaunch mountain_car_sim mountain_city_air_demo.launch paused:=true
```

## 控制小车

最终演示 launch 默认会启动 `simple_car_controller.py` 的 auto 模式，让小车自动向城市道路行驶并转向，便于录屏和答辩展示。

如果需要手动控制，建议先关闭自动控制：

```bash
roslaunch mountain_car_sim mountain_city_air_demo.launch start_car_controller:=false
```

然后打开另一个终端：

```bash
cd ~/catkin_ws
source devel/setup.bash
rosrun mountain_car_sim simple_car_controller.py _mode:=keyboard
```

按键：

- `w`：前进
- `s`：后退
- `a`：左转
- `d`：右转
- 空格：停止
- `q`：退出

## 观察飞机飞行

启动综合 launch 后，固定翼飞机会在城市与山地上方低空自动巡航。可以在 Gazebo 中切换视角，观察：

- 飞机是否围绕城市街区上空飞行；
- 红色前向标记是否跟随运动方向转动；
- 飞机是否从山地上空飞向城市上空，再循环返回；
- 地面小车和空中飞机是否同时出现在同一个 world 中。

也可以查看节点日志：

```bash
rostopic echo /gazebo/model_states
```

或搜索 `patrol_airplane` 的位姿变化。

## 使用的 ROS/Gazebo 技术

- ROS package 管理；
- roslaunch 一键启动；
- Gazebo Classic world 文件；
- SDF 模型描述；
- Xacro/URDF 小车模型；
- `gazebo_ros` 启动 Gazebo；
- `gazebo_msgs/SetModelState` 控制无人机巡航；
- `/cmd_vel` 控制地面小车；
- `robot_state_publisher` 发布小车 TF。

## 开源资源说明

本次新增的城市和无人机没有下载外部模型，全部使用 Gazebo SDF 基础几何体搭建。原项目继续使用 Gazebo 自带模型：

- `model://sun`
- `model://ground_plane`

以及本包已有模型：

- `model://mountain_terrain`
- `model://rock_obstacle`
- `model://checkpoint_flag`

因此别人 clone 仓库后，只要本机安装 ROS Noetic、Gazebo 11 和 `gazebo_ros`，就不需要额外下载城市或无人机资源。

## 常见问题与解决方法

1. Gazebo 打开后找不到 `simple_city` 或 `simple_drone`

   确认使用的是本项目的 launch，它已经设置：

   ```xml
   GAZEBO_MODEL_PATH=$(find mountain_car_sim)/models
   ```

   如果手动运行 Gazebo，需要设置：

   ```bash
   export GAZEBO_MODEL_PATH=$GAZEBO_MODEL_PATH:$(rospack find mountain_car_sim)/models
   ```

2. 小车不动

   先检查是否启动了控制节点：

   ```bash
   rostopic echo /cmd_vel
   ```

   如果没有速度消息，可以手动运行：

   ```bash
   rosrun mountain_car_sim simple_car_controller.py _mode:=keyboard
   ```

3. 无人机不飞

   检查模型名是否存在：

   ```bash
   rostopic echo /gazebo/model_states
   ```

   默认模型名应为 `patrol_airplane`。也可以查看节点日志是否提示等待模型或调用 `/gazebo/set_model_state` 失败。

4. Gazebo 启动较慢

   该场景已经尽量使用轻量几何体。如果电脑较慢，可以关闭自动控制或降低 GUI 负载：

   ```bash
   roslaunch mountain_car_sim mountain_city_air_demo.launch start_car_controller:=false
   ```

5. `catkin_make` 找不到包

   确认是在工作空间根目录执行，并且执行过：

   ```bash
   source devel/setup.bash
   ```

## 答辩展示流程

建议答辩时按下面顺序演示：

1. 先介绍原项目：山地地形、小车模型、红旗目标和自动寻迹；
2. 启动最终综合场景：

   ```bash
   roslaunch mountain_car_sim mountain_city_air_demo.launch
   ```

3. 在 Gazebo 中展示山地地形和原有小车；
4. 将视角转向右侧城市区域，展示道路、路口、建筑、人行道、路灯、树、路牌和障碍物；
5. 说明城市不是另一个 world，而是和山地融合在同一个 `mountain_city_air_demo.world` 中；
6. 展示地面小车在连接道路或城市道路附近运动；
7. 抬高视角，展示无人机在山地和城市上空巡航；
8. 解释无人机使用 ROS 节点调用 `/gazebo/set_model_state`，实现稳定的演示级轨迹控制；
9. 总结项目体现了 ROS + Gazebo 在场景搭建、模型描述、多机器人协同仿真和一键启动管理方面的综合应用。

## 后续优化方向

- 给城市增加更多道路标志和建筑窗户贴图；
- 为小车增加摄像头或雷达，在城市道路中做避障；
- 增加地面巡逻路线，让小车从山地入口开到城市路口；
- 为无人机增加不同巡航模式，例如矩形巡逻、定点盘旋、山地到城市往返；
- 增加 RViz 可视化，展示小车 TF、轨迹和无人机路径；
- 将答辩演示流程做成录屏脚本或分阶段 launch。
