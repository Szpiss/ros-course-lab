#!/bin/bash
export DISPLAY=:1
export XAUTHORITY=/run/user/1000/gdm/Xauthority
export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
mkdir -p /home/cuing/report_captures
source /opt/ros/noetic/setup.bash
source /home/cuing/catkin_ws/devel/setup.bash
{
  echo '--- processes ---'
  ps -ef | egrep 'roslaunch|gzserver|gzclient|uav_patrol|robot_state|spawn_model' | grep -v egrep || true
  echo '--- models ---'
  timeout 8s gz model --list || true
  echo '--- topics ---'
  timeout 5s rostopic list | egrep 'cmd_vel|gazebo|robot|joint' || true
  echo '--- services ---'
  timeout 5s rosservice list | grep set_model_state || true
} > /home/cuing/report_captures/runtime_state.txt 2>&1
wid=$(xdotool search --name Gazebo | tail -1 || true)
if [ -n "$wid" ]; then
  xdotool windowactivate "$wid" windowraise "$wid" windowsize "$wid" 1280 860 windowmove "$wid" 30 40 || true
fi
sleep 2
gnome-screenshot -f /home/cuing/report_captures/01_gazebo_full_scene.png
# Change view via mouse drag/scroll if possible for different visual evidence.
if [ -n "$wid" ]; then
  xdotool mousemove 640 420 drag 920 420 || true
  sleep 1
  gnome-screenshot -f /home/cuing/report_captures/02_gazebo_city_mountain_transition.png
  xdotool mousemove 660 420 drag 660 260 || true
  sleep 1
  gnome-screenshot -f /home/cuing/report_captures/03_gazebo_air_vehicle.png
fi
