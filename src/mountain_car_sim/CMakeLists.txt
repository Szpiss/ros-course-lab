cmake_minimum_required(VERSION 3.0.2)
project(mountain_car_sim)

find_package(catkin REQUIRED COMPONENTS
  gazebo_msgs
  gazebo_ros
  geometry_msgs
  robot_state_publisher
  rospy
  std_msgs
  xacro
)

catkin_package()

include_directories(
  ${catkin_INCLUDE_DIRS}
)

catkin_install_python(PROGRAMS
  scripts/autonomous_flag_nav.py
  scripts/reset_spawn_model.py
  scripts/simple_car_controller.py
  DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION}
)

install(DIRECTORY
  launch
  models
  urdf
  worlds
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}
)
