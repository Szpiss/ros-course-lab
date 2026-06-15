#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Move the demo UAV along a stable patrol path with Gazebo set_model_state.

This is intentionally a display-level controller rather than a real flight
stack. It avoids PX4/MAVROS dependencies and keeps the final course demo easy
to launch on a standard ROS Noetic + Gazebo Classic setup.
"""

import math
import time

import rospy
from gazebo_msgs.msg import ModelState, ModelStates
from gazebo_msgs.srv import SetModelState
from geometry_msgs.msg import Quaternion


def yaw_to_quaternion(yaw):
    half_yaw = yaw * 0.5
    quat = Quaternion()
    quat.x = 0.0
    quat.y = 0.0
    quat.z = math.sin(half_yaw)
    quat.w = math.cos(half_yaw)
    return quat


class UavPatrolDemo:
    def __init__(self):
        rospy.init_node("uav_patrol_demo")

        self.model_name = rospy.get_param("~model_name", "patrol_airplane")
        self.reference_frame = rospy.get_param("~reference_frame", "world")
        self.center_x = rospy.get_param("~center_x", 9.5)
        self.center_y = rospy.get_param("~center_y", 0.0)
        self.radius_x = rospy.get_param("~radius_x", 6.5)
        self.radius_y = rospy.get_param("~radius_y", 4.2)
        self.altitude = rospy.get_param("~altitude", 10.5)
        self.speed = rospy.get_param("~speed", 2.0)
        self.rate_hz = rospy.get_param("~rate", 25.0)
        self.yaw_offset = rospy.get_param("~yaw_offset", 0.0)

        average_radius = max(0.1, (abs(self.radius_x) + abs(self.radius_y)) * 0.5)
        self.angular_speed = self.speed / average_radius
        self.model_seen = False

        rospy.Subscriber("/gazebo/model_states", ModelStates, self.model_states_callback)

        rospy.loginfo("等待 /gazebo/set_model_state 服务，用于无人机巡航演示...")
        rospy.wait_for_service("/gazebo/set_model_state")
        self.set_model_state = rospy.ServiceProxy("/gazebo/set_model_state", SetModelState)

    def model_states_callback(self, msg):
        self.model_seen = self.model_name in msg.name

    def wait_for_model(self):
        rate = rospy.Rate(5.0)
        rospy.loginfo("等待 Gazebo 中出现空中模型：%s", self.model_name)
        while not rospy.is_shutdown() and not self.model_seen:
            rate.sleep()
        if not rospy.is_shutdown():
            rospy.loginfo("空中模型已出现，开始巡航。")

    def make_state(self, elapsed):
        angle = elapsed * self.angular_speed
        x = self.center_x + self.radius_x * math.cos(angle)
        y = self.center_y + self.radius_y * math.sin(angle)
        z = self.altitude

        vx = -self.radius_x * self.angular_speed * math.sin(angle)
        vy = self.radius_y * self.angular_speed * math.cos(angle)
        yaw = math.atan2(vy, vx) + self.yaw_offset

        state = ModelState()
        state.model_name = self.model_name
        state.reference_frame = self.reference_frame
        state.pose.position.x = x
        state.pose.position.y = y
        state.pose.position.z = z
        state.pose.orientation = yaw_to_quaternion(yaw)
        state.twist.linear.x = vx
        state.twist.linear.y = vy
        state.twist.linear.z = 0.0
        state.twist.angular.z = self.angular_speed
        return state

    def run(self):
        self.wait_for_model()
        rate = rospy.Rate(self.rate_hz)
        start_time = time.monotonic()
        failures = 0

        while not rospy.is_shutdown():
            elapsed = time.monotonic() - start_time
            state = self.make_state(elapsed)

            try:
                result = self.set_model_state(state)
                if not result.success:
                    failures += 1
                    rospy.logwarn_throttle(2.0, "设置无人机状态失败：%s", result.status_message)
                else:
                    failures = 0
            except rospy.ServiceException as exc:
                failures += 1
                rospy.logwarn_throttle(2.0, "调用 /gazebo/set_model_state 异常：%s", exc)

            if failures > 20:
                rospy.logerr("连续多次无法控制无人机，请检查模型名 %s 是否存在。", self.model_name)
                return

            rospy.loginfo_throttle(
                2.0,
                "空中巡航：model=%s pos=(%.1f, %.1f, %.1f)",
                self.model_name,
                state.pose.position.x,
                state.pose.position.y,
                state.pose.position.z,
            )
            rate.sleep()


if __name__ == "__main__":
    try:
        UavPatrolDemo().run()
    except rospy.ROSInterruptException:
        pass
