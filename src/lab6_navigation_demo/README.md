# lab6_navigation_demo

`lab6_navigation_demo` 用来保存实验六在 Ubuntu 虚拟机里实际使用的“实验专用代码”和实验生成地图，不重复打包整套第三方仿真仓库。这个包主要负责两件事：

- 保存实验六建图后得到的 `map.pgm` 和 `map.yaml`
- 提供“初始位姿 + 房间航点 + 语音到航点映射”的辅助脚本

## 包内内容

- `maps/map.pgm`、`maps/map.yaml`
  - 这是在 Ubuntu 中执行 `rosrun map_server map_saver -f map` 后生成并复制回仓库的地图文件
  - 导航阶段由 `map_server` 读取这两个文件，构建静态地图
- `scripts/setup_lab6_navigation.py`
  - 通过 `rospy.Publisher("/initialpose", PoseWithCovarianceStamped, ...)` 发布机器人初始位姿
  - 通过 `rospy.Publisher("/waterplus/add_waypoint", Waypoint, ...)` 一次性写入 `kitchen`、`living_room`、`dining_room`、`bedroom` 4 个命名航点
  - 通过 `rospy.Publisher("/move_base_simple/goal", PoseStamped, ...)` 发布一个示例导航目标
- `scripts/lab6_voice_bridge.py`
  - 通过 `rospy.Subscriber("/xfyun/iat", String, ...)` 订阅语音识别结果
  - 在回调函数中把 `Go to the kitchen` 之类的英文房间指令映射成命名航点
  - 再通过 `rospy.Publisher("/waterplus/navi_waypoint", String, ...)` 触发 `wp_navi_server` 导航
- `launch/lab6_voice_navigation.launch`
  - 一次性启动语音桥接节点和初始化脚本

## 依赖说明

这个包是“实验六补充包”，默认依赖 Ubuntu 实验环境里已经存在的以下 ROS 包：

- `wpr_simulation`
- `waterplus_map_tools`
- `wpb_home_tutorials`

也就是说，它负责保存实验六本身新增或整理出的代码与地图资源，而不是替代整套上游仿真环境。

## 建议运行顺序

1. 先在 Ubuntu 中启动实验六使用的导航仿真环境

```bash
roslaunch wpr_simulation wpb_map_tool.launch
```

如果当前环境里默认局部规划器不可用，也可以按实验报告中的处理方式改成 `DWAPlannerROS` 后再启动。

2. 另开一个终端，执行实验六辅助 launch

```bash
roslaunch lab6_navigation_demo lab6_voice_navigation.launch
```

这个步骤会完成：

- 发布 `/initialpose`
- 写入 4 个命名航点
- 发布一个示例目标点
- 启动 `/xfyun/iat -> /waterplus/navi_waypoint` 语音桥接

3. 发布测试语音识别结果

```bash
rostopic pub /xfyun/iat std_msgs/String "data: 'Go to the kitchen'" -1
rostopic pub /xfyun/iat std_msgs/String "data: 'Go to the living room'" -1
rostopic pub /xfyun/iat std_msgs/String "data: 'Go to the dining room'" -1
rostopic pub /xfyun/iat std_msgs/String "data: 'Go to the bedroom'" -1
```

## 对应实验报告

- 实验报告 6：`docs/reports/2315302125 崔子霖6.docx`
