cmake_minimum_required(VERSION 3.0.2)
project(sensor_robot_sim)

find_package(catkin REQUIRED COMPONENTS
  roscpp
  rospy
  std_msgs
  geometry_msgs
  sensor_msgs
  gazebo_ros
  robot_state_publisher
)

catkin_package()

include_directories(
  ${catkin_INCLUDE_DIRS}
)

catkin_install_python(PROGRAMS
  scripts/obstacle_avoid.py
  DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION}
)