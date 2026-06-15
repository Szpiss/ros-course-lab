# 山地-城市融合多机器人仿真系统技术文档

## 1. 项目定位

本项目是基于 ROS Noetic 和 Gazebo Classic 11 的课程大作业，目标是把原来的“山地小车仿真”扩展成一个综合展示系统：

- 地面有山地地形、山路、障碍物和城市街景；
- 山地和城市通过过渡道路融合到同一个 Gazebo world 中；
- 地面小车可以在场景中运动；
- 空中飞机/无人机可以在场景上方巡航；
- 所有内容通过一个 roslaunch 文件一键启动。

最终演示入口是：

```bash
roslaunch mountain_car_sim mountain_city_air_demo.launch
```

核心 package 是：

```text
src/mountain_car_sim
```

## 2. 总体架构

项目采用“一个综合 world + 多个独立 SDF 模型 + 一个 URDF/Xacro 小车 + ROS 节点控制”的结构。

```text
mountain_car_sim/
├── launch/
│   ├── demo.launch
│   ├── mountain_world.launch
│   ├── spawn_mountain_car.launch
│   └── mountain_city_air_demo.launch
├── worlds/
│   ├── mountain_scene.world
│   └── mountain_city_air_demo.world
├── models/
│   ├── mountain_terrain/
│   ├── mountain_showcase_details/
│   ├── mountain_city_transition/
│   ├── simple_city/
│   ├── showcase_city_details/
│   ├── simple_airplane/
│   ├── simple_drone/
│   ├── rock_obstacle/
│   └── checkpoint_flag/
├── urdf/
│   └── mountain_car.xacro
└── scripts/
    ├── reset_spawn_model.py
    ├── simple_car_controller.py
    ├── autonomous_flag_nav.py
    └── uav_patrol_demo.py
```

综合 world 文件是：

```text
src/mountain_car_sim/worlds/mountain_city_air_demo.world
```

该 world 不直接把所有几何体写在一个大文件里，而是通过 `model://` 引用多个模型：

```xml
<include>
  <uri>model://mountain_terrain</uri>
</include>

<include>
  <uri>model://mountain_showcase_details</uri>
</include>

<include>
  <uri>model://mountain_city_transition</uri>
</include>

<include>
  <uri>model://simple_city</uri>
</include>

<include>
  <uri>model://showcase_city_details</uri>
</include>
```

这样做的好处是：山地、城市、过渡区、飞机、小车各自独立，后续修改某一部分不会影响整个 world 的结构。

## 3. Gazebo World 设计

### 3.1 物理参数

综合 world 使用 ODE 物理引擎，并保留较保守的仿真参数：

```xml
<physics name="default_physics" type="ode">
  <max_step_size>0.001</max_step_size>
  <real_time_factor>1.0</real_time_factor>
  <real_time_update_rate>1000</real_time_update_rate>
</physics>
```

这样设置的目的不是追求复杂物理，而是保证小车在坡面、道路、障碍物附近运动时尽量稳定，减少抖动、弹飞或接触异常。

### 3.2 场景光照

world 中使用 Gazebo 自带的 `sun` 和 `ground_plane`：

```xml
<include>
  <uri>model://sun</uri>
</include>

<include>
  <uri>model://ground_plane</uri>
</include>
```

同时设置了环境光和天空背景颜色：

```xml
<ambient>0.48 0.50 0.52 1</ambient>
<background>0.68 0.82 0.96 1</background>
```

这样可以保证山地、城市建筑、小车和飞机都有基本的明暗层次。

### 3.3 默认相机

综合 world 设置了默认 Gazebo GUI 相机：

```xml
<camera name="user_camera">
  <pose>5.4 -10.2 5.4 0 0.43 0.61</pose>
  <view_controller>orbit</view_controller>
</camera>
```

默认视角从山地与城市的连接方向斜看过去，启动后可以同时看到山地入口、过渡道路、城市街区和空中飞行区域。

## 4. 山地场景是怎么做出来的

山地部分由两层组成：

1. `mountain_terrain`：山地主体地形；
2. `mountain_showcase_details`：山地展示细节。

### 4.1 山地主体：mountain_terrain

山地主体模型路径：

```text
src/mountain_car_sim/models/mountain_terrain/model.sdf
```

该模型不是简单的几个 box，而是使用 mesh 文件构建：

```text
src/mountain_car_sim/models/mountain_terrain/meshes/mountain_terrain.dae
src/mountain_car_sim/models/mountain_terrain/meshes/mountain_trail.dae
```

其中：

- `mountain_terrain.dae` 表示山体主体，包含坡度、山脊、起伏地形；
- `mountain_trail.dae` 表示贴合山地的蛇形土路视觉层；
- `terrain_base` 是山地外圈土色底座，用于从 Gazebo 网格背景中区分实验场地；
- `left_boundary` 和 `right_boundary` 是两侧低矮边界，用来强调山路范围。

在 `model.sdf` 中，山地 mesh 既作为 visual，也作为 collision：

```xml
<collision name="collision">
  <geometry>
    <mesh>
      <uri>model://mountain_terrain/meshes/mountain_terrain.dae</uri>
    </mesh>
  </geometry>
</collision>
```

这意味着小车不是只在平面上显示，而是可以和山地 mesh 产生接触。

### 4.2 山地道路视觉层

山路不是用普通 box 直接铺出来，而是通过 `mountain_trail.dae` 作为视觉层叠加到山体上：

```xml
<mesh>
  <uri>model://mountain_terrain/meshes/mountain_trail.dae</uri>
</mesh>
```

山路材质使用棕色系：

```xml
<ambient>0.36 0.22 0.10 1</ambient>
<diffuse>0.55 0.34 0.16 1</diffuse>
```

这样在 Gazebo 中可以明显区分“绿色山体”和“棕色山路”。

### 4.3 山地细节层：mountain_showcase_details

山地细节模型路径：

```text
src/mountain_car_sim/models/mountain_showcase_details/model.sdf
```

这个模型不改变原始山地 mesh，只是在山地上叠加展示元素。它的作用是让山地看起来不只是一个裸地形，而是一个适合答辩展示的山地道路场景。

主要元素包括：

- 山路木护栏；
- 山路入口门架；
- 落石警示牌；
- 城市方向牌；
- 观景平台；
- 帐篷营地；
- 补给箱；
- 营火；
- 松树；
- 灌木；
- 碎石；
- 风向袋。

例如山路护栏使用 box 组合：

```xml
<visual name="rail">
  <geometry>
    <box>
      <size>2.25 0.08 0.13</size>
    </box>
  </geometry>
</visual>
```

松树使用 cylinder + sphere 组合：

```xml
<visual name="trunk">
  <geometry>
    <cylinder>
      <radius>0.08</radius>
      <length>0.64</length>
    </cylinder>
  </geometry>
</visual>

<visual name="crown_low">
  <geometry>
    <sphere>
      <radius>0.36</radius>
    </sphere>
  </geometry>
</visual>
```

这种做法虽然不是高精度建模，但优点是轻量、稳定、兼容 Gazebo Classic，不需要额外 mesh 或材质资源。

## 5. 城市场景是怎么做出来的

城市部分也分成两层：

1. `simple_city`：城市基础结构；
2. `showcase_city_details`：城市展示细节。

### 5.1 城市基础结构：simple_city

城市基础模型路径：

```text
src/mountain_car_sim/models/simple_city/model.sdf
```

它负责搭建城市的基本空间结构，包括：

- 主道路；
- 支路；
- 十字路口；
- 人行道；
- 建筑群；
- 道路标线；
- 路灯；
- 树；
- 路牌；
- 障碍物；
- 停靠车辆；
- 公交站；
- 建筑窗户和招牌。

城市道路使用薄 box：

```xml
<geometry>
  <box>
    <size>15.0 2.2 0.024</size>
  </box>
</geometry>
```

道路材质使用深灰色：

```xml
<ambient>0.035 0.038 0.042 1</ambient>
<diffuse>0.035 0.038 0.042 1</diffuse>
```

人行道使用浅灰色薄 box，建筑物使用不同尺寸和颜色的 box。这样可以在低成本情况下形成“道路 + 人行道 + 建筑群”的城市层次。

### 5.2 道路和路口

`simple_city` 中的主路是东西向长道路，支路是南北向道路。二者交叉形成十字路口：

```xml
<link name="main_road">
  <pose>12.0 0 0.012 0 0 0</pose>
</link>

<link name="cross_road">
  <pose>14.5 0 0.014 0 0 0</pose>
</link>
```

道路标线使用黄色/白色细 box：

- 黄色中心线表示车道分隔；
- 白色斑马线表示十字路口人行横道。

### 5.3 建筑群

建筑使用不同高度、颜色和尺寸的 box 搭建，例如：

- 蓝色建筑；
- 绿色高楼；
- 红色建筑；
- 黄色建筑；
- 灰色高楼。

这样做是为了让城市不显得单调，同时保持模型足够轻，不引入复杂贴图或外部模型依赖。

### 5.4 城市展示细节：showcase_city_details

城市展示细节模型路径：

```text
src/mountain_car_sim/models/showcase_city_details/model.sdf
```

该模型主要增强默认相机能看到的前景细节，包括：

- 店铺立面；
- 咖啡店/市场/诊所样式的门面；
- 大广告牌；
- 交通龙门架；
- 红绿灯；
- 停车位；
- 施工区；
- 路障锥；
- 低空航迹标记。

例如店铺立面使用墙体、窗户、遮阳棚、招牌组合：

```xml
<link name="storefront_cafe">
  <visual name="wall">...</visual>
  <visual name="window_left">...</visual>
  <visual name="window_right">...</visual>
  <visual name="awning">...</visual>
  <visual name="sign">...</visual>
</link>
```

广告牌使用 post + board + 彩色条块组合：

```xml
<link name="billboard">
  <visual name="post_left">...</visual>
  <visual name="post_right">...</visual>
  <visual name="board">...</visual>
  <visual name="stripe_top">...</visual>
</link>
```

这些细节不是为了模拟真实城市交通系统，而是为了让 Gazebo 中的城市区域在视觉上更像一个街区，适合答辩展示。

## 6. 山地和城市连接处是怎么融合的

连接处模型路径：

```text
src/mountain_car_sim/models/mountain_city_transition/model.sdf
```

这个模型专门解决“山地和城市割裂”的问题。它位于山地出口和城市道路入口之间，主要覆盖 `x=4.5` 到 `x=8.5` 附近的区域。

### 6.1 路面渐变

连接处不是直接从土路跳到黑色柏油路，而是分成几层：

1. `dirt_exit_patch`：山地土路出口；
2. `mixed_gravel_patch`：砂石混合段；
3. `asphalt_entry_patch`：柏油入口段；
4. `city_entry_flare`：城市道路加宽段。

这样在视觉上形成：

```text
山地土路 -> 砂石过渡 -> 柏油路 -> 城市主路
```

这比直接把城市道路贴到山体旁边自然很多。

### 6.2 遮挡硬边

为了避免山地 mesh 和城市 road box 之间出现明显拼接边，过渡区加入了：

- `north_earth_shoulder`
- `south_earth_shoulder`
- `north_city_curb`
- `south_city_curb`

土肩和路缘石可以遮住道路边缘，让山地和城市之间看起来像有修整过的道路边坡。

### 6.3 护栏材质过渡

连接处使用“木护栏 -> 金属护栏”的混合结构：

```text
山地侧：木质护栏
城市侧：金属护栏
```

对应模型：

- `north_wood_to_metal_rail`
- `south_wood_to_metal_rail`

这样山地侧和城市侧的视觉语言会自然过渡。

### 6.4 山城入口门架

过渡区加入 `mountain_city_gateway`：

- 两根立柱；
- 顶部横梁；
- 蓝色入口牌；
- 白色条纹。

这个结构相当于“从山地进入城市”的入口标志，在答辩演示中很容易解释。

### 6.5 自然和城市元素混合

过渡区同时放置了：

- 松树；
- 灌木；
- 路灯；
- 城市服务箱。

这体现了从自然山地到城市基础设施的转换。

## 7. 小车模型与地面运动

小车模型路径：

```text
src/mountain_car_sim/urdf/mountain_car.xacro
```

小车采用 Xacro/URDF 描述，主要结构包括：

- `base_footprint`：地面投影坐标系；
- `base_link`：车体底盘；
- `top_cabin`：车顶驾驶舱；
- 四个车轮 link；
- 四个连续转动 wheel joint。

小车不是用复杂差速动力学控制，而是使用 Gazebo 的平面移动插件：

```xml
<plugin name="mountain_car_planar_move" filename="libgazebo_ros_planar_move.so">
  <commandTopic>cmd_vel</commandTopic>
  <odometryTopic>odom</odometryTopic>
  <robotBaseFrame>base_footprint</robotBaseFrame>
</plugin>
```

该插件订阅 `/cmd_vel`，因此控制节点只需要发布 `geometry_msgs/Twist` 就能驱动小车。

### 7.1 小车生成

小车由以下 launch 生成：

```text
src/mountain_car_sim/launch/spawn_mountain_car.launch
```

该 launch 会：

1. 用 xacro 生成 `/robot_description`；
2. 启动 `reset_spawn_model.py`；
3. 删除旧的同名模型；
4. 调用 `/gazebo/spawn_urdf_model` 生成新小车；
5. 启动 `robot_state_publisher`。

在最终综合 launch 中，小车默认出生位置是：

```xml
<arg name="car_x" default="6.5" />
<arg name="car_y" default="0.0" />
<arg name="car_z" default="0.45" />
```

该位置位于山地和城市连接道路附近，便于展示“从山地进入城市”的效果。

## 8. 飞机/无人机模型与空中巡航

空中模型主要有两个：

```text
src/mountain_car_sim/models/simple_airplane/model.sdf
src/mountain_car_sim/models/simple_drone/model.sdf
```

当前最终演示重点展示 `simple_airplane`，因为它尺寸更大、颜色更醒目、低空巡航时更容易看到。

### 8.1 固定翼飞机

飞机模型 `simple_airplane` 使用 SDF 基础几何体组合：

- 机身：box；
- 机鼻：cylinder；
- 主翼：长 box；
- 翼尖：红色 box；
- 尾翼：box；
- 垂尾：box；
- 螺旋桨圆盘：cylinder；
- 驾驶舱：蓝色 box。

模型配色使用黄、蓝、红，目的是让飞机在 Gazebo 天空背景中明显可见。

### 8.2 飞行控制脚本

空中巡航脚本：

```text
src/mountain_car_sim/scripts/uav_patrol_demo.py
```

它不是完整飞控系统，而是演示级轨迹控制节点。节点调用 Gazebo 服务：

```text
/gazebo/set_model_state
```

不断设置飞机模型的位置和姿态，使它沿椭圆轨迹飞行。

核心轨迹公式：

```python
x = center_x + radius_x * cos(angle)
y = center_y + radius_y * sin(angle)
z = altitude
```

飞机 yaw 根据运动方向计算：

```python
yaw = atan2(vy, vx)
```

这样飞机在飞行时会朝向运动方向，而不是固定朝一个方向。

### 8.3 为什么不用真实飞控

本项目没有引入 PX4、MAVROS 或真实空气动力学，原因是：

- 课程项目重点是 ROS + Gazebo 综合仿真；
- 真实飞控依赖复杂，容易导致答辩机器启动失败；
- `/gazebo/set_model_state` 更稳定，能保证演示效果；
- 飞机轨迹清晰，便于解释。

因此该飞行方案更适合课程展示。

## 9. Launch 启动流程

最终 launch 文件：

```text
src/mountain_car_sim/launch/mountain_city_air_demo.launch
```

它完成以下工作：

1. 设置 `GAZEBO_MODEL_PATH`，让 Gazebo 找到本包 models；
2. 设置 `GAZEBO_PLUGIN_PATH`，保证 Gazebo ROS 插件可加载；
3. 启动 Gazebo 并加载 `mountain_city_air_demo.world`；
4. 调用 `spawn_mountain_car.launch` 生成小车；
5. 启动小车自动演示控制节点；
6. 启动飞机巡航节点。

关键环境变量：

```xml
<env name="GAZEBO_MODEL_PATH" value="$(find mountain_car_sim)/models:$(optenv GAZEBO_MODEL_PATH)" />
```

如果没有这个变量，Gazebo 可能找不到 `model://simple_city`、`model://mountain_city_transition` 等模型。

## 10. 各模型在最终场景中的职责

| 模型 | 文件路径 | 职责 |
| --- | --- | --- |
| `mountain_terrain` | `models/mountain_terrain` | 山地主体 mesh、蛇形山路、山地底座 |
| `mountain_showcase_details` | `models/mountain_showcase_details` | 山路护栏、营地、观景台、树木、标志等山地细节 |
| `mountain_city_transition` | `models/mountain_city_transition` | 山地土路到城市柏油路的融合过渡区 |
| `simple_city` | `models/simple_city` | 城市道路、路口、人行道、建筑、路灯、树等基础街景 |
| `showcase_city_details` | `models/showcase_city_details` | 店铺、广告牌、交通龙门架、停车场、施工区等城市展示细节 |
| `simple_airplane` | `models/simple_airplane` | 低空巡航固定翼飞机 |
| `simple_drone` | `models/simple_drone` | 简化四旋翼无人机，作为辅助空中模型 |
| `rock_obstacle` | `models/rock_obstacle` | 山路岩石障碍物 |
| `checkpoint_flag` | `models/checkpoint_flag` | 山地终点/检查点标志 |

## 11. 稳定性设计

本项目选择了轻量稳定的实现方式：

- 城市和细节大量使用 SDF 基础几何体；
- 不依赖 CARLA、OpenStreetMap、PX4、MAVROS；
- 山地主体使用已有 mesh，细节作为独立模型叠加；
- 飞机通过 `/gazebo/set_model_state` 控制，不引入复杂飞控；
- 小车使用 `libgazebo_ros_planar_move.so` 插件控制，避免复杂轮系动力学带来的不稳定。

这种设计牺牲了一部分真实度，但换来了：

- 启动速度更快；
- 依赖更少；
- 答辩时更不容易出错；
- 文件结构清晰，容易解释。

## 12. 编译和运行

如果工作空间中只有本项目或依赖完整：

```bash
cd ~/catkin_ws
catkin_make
source devel/setup.bash
roslaunch mountain_car_sim mountain_city_air_demo.launch
```

如果工作空间中有其它实验包导致编译失败，可以只编译大作业包：

```bash
cd ~/catkin_ws
catkin_make -DCATKIN_WHITELIST_PACKAGES="mountain_car_sim"
source devel/setup.bash
roslaunch mountain_car_sim mountain_city_air_demo.launch
```

## 13. 演示时可以怎么讲

答辩时可以按以下逻辑说明：

1. 原项目是山地小车 Gazebo 仿真，已经有山地 mesh、蛇形山路、岩石和红旗；
2. 我在原山地 world 基础上新增了城市街区，不是另开一个 world；
3. 山地由 `mountain_terrain` 和 `mountain_showcase_details` 组成；
4. 城市由 `simple_city` 和 `showcase_city_details` 组成；
5. 山地和城市之间通过 `mountain_city_transition` 做自然过渡；
6. 地面小车使用 Xacro/URDF 建模，通过 `/cmd_vel` 控制；
7. 空中飞机使用 SDF 几何体建模，通过 ROS 节点调用 `/gazebo/set_model_state` 实现巡航；
8. 整个系统通过 `mountain_city_air_demo.launch` 一键启动，体现 ROS launch、Gazebo world、SDF/URDF、多模型协同仿真的综合应用。

## 14. 后续优化方向

后续还可以继续扩展：

- 给建筑加入真实贴图或透明窗户材质；
- 给小车增加激光雷达或相机；
- 让小车从山路自动行驶到城市路口；
- 增加城市交通灯状态切换；
- 给飞机增加多种轨迹模式；
- 在 RViz 中显示小车路径和飞机轨迹；
- 制作答辩录屏专用 launch，自动调整相机和演示节奏。
