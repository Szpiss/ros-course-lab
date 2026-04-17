#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import math
import rospy
from sensor_msgs.msg import LaserScan
from geometry_msgs.msg import Twist


class ObstacleAvoidance:
    def __init__(self):
        rospy.init_node('obstacle_avoidance_node')

        self.cmd_pub = rospy.Publisher('/cmd_vel', Twist, queue_size=10)
        self.scan_sub = rospy.Subscriber('/scan', LaserScan, self.scan_callback)

        self.safe_distance = rospy.get_param('~safe_distance', 0.8)
        self.forward_speed = rospy.get_param('~forward_speed', 0.2)
        self.turn_speed = rospy.get_param('~turn_speed', 0.6)
        self.turn_forward_speed = rospy.get_param('~turn_forward_speed', 0.05)
        self.front_distance = float('inf')
        self.left_distance = float('inf')
        self.right_distance = float('inf')
        self.current_state = "FORWARD"

        rospy.loginfo("Obstacle avoidance node started.")

    @staticmethod
    def valid_min(values):
        valid_ranges = []
        for value in values:
            if not math.isinf(value) and not math.isnan(value):
                valid_ranges.append(value)

        if valid_ranges:
            return min(valid_ranges)
        return float('inf')

    def scan_callback(self, msg):
        ranges = msg.ranges
        if not ranges:
            return

        total = len(ranges)
        center = total // 2

        # 雷达范围设置为 [-90°, 90°]，中间为正前方
        front_ranges = ranges[max(0, center - 25): min(total, center + 25)]
        left_ranges = ranges[min(total, center + 25): min(total, center + 90)]
        right_ranges = ranges[max(0, center - 90): max(0, center - 25)]

        self.front_distance = self.valid_min(front_ranges)
        self.left_distance = self.valid_min(left_ranges)
        self.right_distance = self.valid_min(right_ranges)

    def run(self):
        rate = rospy.Rate(10)

        while not rospy.is_shutdown():
            cmd = Twist()

            if self.front_distance > self.safe_distance:
                # 情况1：前方安全，直行
                self.current_state = "FORWARD"
                cmd.linear.x = self.forward_speed
                cmd.angular.z = 0.0
                rospy.loginfo_throttle(
                    1,
                    "Case 1: path clear, move forward. front=%.2f left=%.2f right=%.2f",
                    self.front_distance,
                    self.left_distance,
                    self.right_distance,
                )
            elif self.left_distance < self.right_distance:
                # 情况2：左侧更近，说明左边更拥挤，向右转
                self.current_state = "TURN_RIGHT"
                cmd.linear.x = self.turn_forward_speed
                cmd.angular.z = -self.turn_speed
                rospy.loginfo_throttle(
                    1,
                    "Case 2: obstacle closer on left, turn right. front=%.2f left=%.2f right=%.2f",
                    self.front_distance,
                    self.left_distance,
                    self.right_distance,
                )
            else:
                # 情况3：右侧更近或两侧接近，向左转
                self.current_state = "TURN_LEFT"
                cmd.linear.x = self.turn_forward_speed
                cmd.angular.z = self.turn_speed
                rospy.loginfo_throttle(
                    1,
                    "Case 3: obstacle closer on right, turn left. front=%.2f left=%.2f right=%.2f",
                    self.front_distance,
                    self.left_distance,
                    self.right_distance,
                )

            self.cmd_pub.publish(cmd)
            rate.sleep()


if __name__ == '__main__':
    try:
        node = ObstacleAvoidance()
        node.run()
    except rospy.ROSInterruptException:
        pass
