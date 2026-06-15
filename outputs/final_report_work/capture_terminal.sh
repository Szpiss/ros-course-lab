#!/bin/bash
export DISPLAY=:1
export XAUTHORITY=/run/user/1000/gdm/Xauthority
export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
mkdir -p /home/cuing/report_captures
command -v gnome-terminal >/home/cuing/report_captures/terminal_tool.txt 2>&1 || true
if command -v gnome-terminal >/dev/null 2>&1; then
  gnome-terminal --title="ROS Gazebo Runtime State" --geometry=110x32 -- bash -lc 'source /opt/ros/noetic/setup.bash; source /home/cuing/catkin_ws/devel/setup.bash; echo "ROS + Gazebo mountain_city_air_demo runtime"; echo; echo "[rosnode]"; rosnode list; echo; echo "[topics]"; rostopic list | egrep "cmd_vel|gazebo|joint_states"; echo; echo "[services]"; rosservice list | grep set_model_state; echo; echo "[process]"; ps -ef | egrep "roslaunch|gzserver|gzclient|uav_patrol|road_follow" | grep -v egrep; echo; echo "Press Ctrl+C to close"; sleep 60'
  sleep 4
  wid=$(xdotool search --name "ROS Gazebo Runtime State" | tail -1 || true)
  if [ -n "$wid" ]; then
    xdotool windowactivate "$wid" windowraise "$wid" windowsize "$wid" 1100 760 windowmove "$wid" 80 80 || true
  fi
  sleep 1
  gnome-screenshot -f /home/cuing/report_captures/04_runtime_terminal.png
fi
