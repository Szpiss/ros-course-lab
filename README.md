# ROS课程实验仓库

## 课程说明
本仓库用于保存《嵌入式系统原理》课程中 ROS 相关实验的代码、实验文档与运行记录。

## 实验环境
- Ubuntu 20.04.5 LTS
- ROS Noetic
- catkin_ws 工作空间
- Visual Studio Code
- VMware 虚拟机

## 仓库结构
- `src/turtle_topic_demo`：实验二，ROS Topic 通信
- `src/service_demo`：实验三，ROS 服务通信
- `docs/lab1_environment.md`：实验一，虚拟机、ROS 与 VS Code 环境配置
- `docs/lab2_topic.md`：实验二说明
- `docs/lab3_service.md`：实验三说明

## 已完成实验
1. 实验一：虚拟机、ROS 与 Visual Studio Code 环境配置
2. 实验二：ROS Topic 通信
3. 实验三：ROS 服务通信编程

## 使用方法
```bash
cd ~/catkin_ws
catkin_make
source devel/setup.bash