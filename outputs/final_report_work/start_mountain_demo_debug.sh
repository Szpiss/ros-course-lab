#!/bin/bash
{
set -x
export DISPLAY=:1
export XAUTHORITY=/run/user/1000/gdm/Xauthority
export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
pkill -x gzserver || true
pkill -x gzclient || true
pkill -x rosmaster || true
pkill -x roscore || true
sleep 2
cd /home/cuing/catkin_ws
source /opt/ros/noetic/setup.bash
source devel/setup.bash
nohup roslaunch mountain_car_sim mountain_city_air_demo.launch > /home/cuing/mountain_demo_launch.log 2>&1 &
echo $! > /home/cuing/mountain_demo_launch.pid
sleep 1
ps -ef | egrep 'roslaunch|gzserver|gzclient|rosmaster' | grep -v egrep || true
} > /home/cuing/start_mountain_demo_debug.log 2>&1
