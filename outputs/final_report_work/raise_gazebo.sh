#!/bin/bash
export DISPLAY=:1
export XAUTHORITY=/run/user/1000/gdm/Xauthority
export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
wid=$(xdotool search --name Gazebo | tail -1 || true)
if [ -n "$wid" ]; then
  xdotool windowactivate "$wid" windowraise "$wid" windowsize "$wid" 1280 860 windowmove "$wid" 30 40 || true
fi
