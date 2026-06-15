#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""沿山地-城市道路行驶的小车展示节点。

节点通过 /gazebo/set_model_state 直接控制 mountain_car 的位姿，同时发布
/cmd_vel 作为课堂演示中的控制话题。这样即使 Gazebo 车体运动插件不可用，
小车也能稳定沿城市道路中心线行驶。
"""

import math

import rospy
from gazebo_msgs.msg import ModelState
from gazebo_msgs.srv import SetModelState
from geometry_msgs.msg import Quaternion, Twist


def yaw_to_quaternion(yaw):
    half_yaw = yaw * 0.5
    return Quaternion(0.0, 0.0, math.sin(half_yaw), math.cos(half_yaw))


class RoadFollowCar:
    def __init__(self):
        rospy.init_node("road_follow_car")

        self.model_name = rospy.get_param("~model_name", "mountain_car")
        self.z = rospy.get_param("~z", 0.45)
        self.speed = rospy.get_param("~speed", 0.9)
        self.rate_hz = rospy.get_param("~rate", 30.0)
        self.pause_at_crossing = rospy.get_param("~pause_at_crossing", 0.4)

        self.cmd_pub = rospy.Publisher("/cmd_vel", Twist, queue_size=10)
        rospy.wait_for_service("/gazebo/set_model_state")
        self.set_model_state = rospy.ServiceProxy("/gazebo/set_model_state", SetModelState)

        # 主路 y=-0.38 表示右侧车道；十字路 x=14.5 表示竖向道路中心线。
        self.waypoints = [
            (5.2, -0.38),
            (7.8, -0.38),
            (11.8, -0.38),
            (13.6, -0.38),
            (14.5, -0.38),
            (14.5, -3.4),
            (14.5, 3.4),
            (14.5, 0.38),
            (17.8, 0.38),
            (19.1, 0.38),
            (17.8, 0.38),
            (14.5, 0.38),
            (14.5, 3.4),
            (14.5, -3.4),
            (14.5, -0.38),
            (11.8, -0.38),
            (7.8, -0.38),
            (5.2, -0.38),
        ]

    def publish_pose(self, x, y, yaw, speed):
        state = ModelState()
        state.model_name = self.model_name
        state.reference_frame = "world"
        state.pose.position.x = x
        state.pose.position.y = y
        state.pose.position.z = self.z
        state.pose.orientation = yaw_to_quaternion(yaw)
        state.twist.linear.x = speed

        cmd = Twist()
        cmd.linear.x = speed
        self.cmd_pub.publish(cmd)
        self.set_model_state(state)

    def drive_segment(self, start, end):
        sx, sy = start
        ex, ey = end
        dx = ex - sx
        dy = ey - sy
        distance = math.hypot(dx, dy)
        if distance < 0.001:
            return

        yaw = math.atan2(dy, dx)
        duration = distance / max(self.speed, 0.05)
        start_time = rospy.Time.now()
        rate = rospy.Rate(self.rate_hz)

        while not rospy.is_shutdown():
            elapsed = (rospy.Time.now() - start_time).to_sec()
            ratio = min(1.0, elapsed / duration)
            x = sx + dx * ratio
            y = sy + dy * ratio
            self.publish_pose(x, y, yaw, self.speed)

            if ratio >= 1.0:
                break
            rate.sleep()

    def pause(self, point):
        rate = rospy.Rate(self.rate_hz)
        end_time = rospy.Time.now() + rospy.Duration(self.pause_at_crossing)
        while not rospy.is_shutdown() and rospy.Time.now() < end_time:
            self.publish_pose(point[0], point[1], 0.0, 0.0)
            rate.sleep()

    def run(self):
        rospy.loginfo("道路巡航启动：模型=%s speed=%.2f", self.model_name, self.speed)
        rate = rospy.Rate(self.rate_hz)

        while not rospy.is_shutdown():
            for index in range(len(self.waypoints) - 1):
                start = self.waypoints[index]
                end = self.waypoints[index + 1]
                self.drive_segment(start, end)
                if abs(end[0] - 14.5) < 0.05 and abs(end[1]) < 0.45:
                    self.pause(end)
                rate.sleep()


if __name__ == "__main__":
    try:
        RoadFollowCar().run()
    except rospy.ROSInterruptException:
        pass
