#!/usr/bin/env python3
import math

import rospy
from geometry_msgs.msg import PoseStamped, PoseWithCovarianceStamped
from waterplus_map_tools.msg import Waypoint


WAYPOINTS = [
    ("kitchen", -3.5, 3.0, 1.57),
    ("living_room", -1.0, -3.0, 1.57),
    ("dining_room", 2.1, 1.7, 0.0),
    ("bedroom", 4.5, -3.2, 3.14159),
]


def quaternion_from_yaw(yaw):
    return math.sin(yaw / 2.0), math.cos(yaw / 2.0)


def publish_initial_pose(publisher):
    msg = PoseWithCovarianceStamped()
    msg.header.frame_id = "map"
    msg.pose.pose.position.x = -6.0
    msg.pose.pose.position.y = -0.5
    msg.pose.pose.orientation.w = 1.0
    msg.pose.covariance[0] = 0.25
    msg.pose.covariance[7] = 0.25
    msg.pose.covariance[35] = 0.068
    for _ in range(3):
        msg.header.stamp = rospy.Time.now()
        publisher.publish(msg)
        rospy.sleep(0.5)


def publish_waypoints(publisher):
    for name, x, y, yaw in WAYPOINTS:
        msg = Waypoint()
        msg.name = name
        msg.pose.position.x = x
        msg.pose.position.y = y
        msg.pose.orientation.z, msg.pose.orientation.w = quaternion_from_yaw(yaw)
        publisher.publish(msg)
        rospy.loginfo("add waypoint %s (%.3f, %.3f)", name, x, y)
        rospy.sleep(0.5)


def publish_demo_goal(publisher):
    msg = PoseStamped()
    msg.header.frame_id = "map"
    msg.header.stamp = rospy.Time.now()
    msg.pose.position.x = -3.5
    msg.pose.position.y = 3.0
    msg.pose.orientation.z, msg.pose.orientation.w = quaternion_from_yaw(1.57)
    publisher.publish(msg)
    rospy.loginfo("publish demo goal kitchen")


def main():
    rospy.init_node("setup_lab6_navigation")
    initial_pose_pub = rospy.Publisher("/initialpose", PoseWithCovarianceStamped, queue_size=1, latch=True)
    waypoint_pub = rospy.Publisher("/waterplus/add_waypoint", Waypoint, queue_size=10, latch=True)
    goal_pub = rospy.Publisher("/move_base_simple/goal", PoseStamped, queue_size=1, latch=True)

    rospy.sleep(2.0)
    publish_initial_pose(initial_pose_pub)
    publish_waypoints(waypoint_pub)

    if rospy.get_param("~publish_goal", True):
        rospy.sleep(1.0)
        publish_demo_goal(goal_pub)


if __name__ == "__main__":
    main()
