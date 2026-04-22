cmake_minimum_required(VERSION 3.0.2)
project(lab6_navigation_demo)

find_package(catkin REQUIRED COMPONENTS
  geometry_msgs
  rospy
  std_msgs
  waterplus_map_tools
)

catkin_package()

catkin_install_python(PROGRAMS
  scripts/lab6_voice_bridge.py
  scripts/setup_lab6_navigation.py
  DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION}
)

install(DIRECTORY launch maps
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}
)
