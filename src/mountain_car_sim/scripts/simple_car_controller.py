#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
简单自动巡航控制节点：
1. 前进 5 秒；
2. 左转 2 秒；
3. 再前进 5 秒；
4. 停止并持续发布 0 速度。

该脚本只依赖 /cmd_vel，适合课程演示和录屏截图。
"""

import rospy
from geometry_msgs.msg import Twist


class SimpleCarController:
    def __init__(self):
        rospy.init_node("simple_car_controller")
        self.cmd_pub = rospy.Publisher("/cmd_vel", Twist, queue_size=10)

        self.forward_speed = rospy.get_param("~forward_speed", 0.45)
        self.turn_speed = rospy.get_param("~turn_speed", 0.65)
        self.forward_duration = rospy.get_param("~forward_duration", 5.0)
        self.turn_duration = rospy.get_param("~turn_duration", 2.0)
        self.rate_hz = rospy.get_param("~rate", 10.0)

    def publish_for(self, linear_x, angular_z, duration, label):
        cmd = Twist()
        cmd.linear.x = linear_x
        cmd.angular.z = angular_z

        rospy.loginfo("%s: linear.x=%.2f angular.z=%.2f duration=%.1fs",
                      label, linear_x, angular_z, duration)

        rate = rospy.Rate(self.rate_hz)
        end_time = rospy.Time.now() + rospy.Duration(duration)
        while not rospy.is_shutdown() and rospy.Time.now() < end_time:
            self.cmd_pub.publish(cmd)
            rate.sleep()

    def stop_forever(self):
        cmd = Twist()
        rate = rospy.Rate(self.rate_hz)
        rospy.loginfo("自动巡航结束，持续发布停止命令。")
        while not rospy.is_shutdown():
            self.cmd_pub.publish(cmd)
            rate.sleep()

    def run(self):
        # 等待 Gazebo 中的差速驱动插件完成订阅，避免前几条速度命令丢失。
        rospy.sleep(1.0)
        self.publish_for(self.forward_speed, 0.0, self.forward_duration, "阶段1 前进")
        self.publish_for(0.12, self.turn_speed, self.turn_duration, "阶段2 左转")
        self.publish_for(self.forward_speed, 0.0, self.forward_duration, "阶段3 前进")
        self.stop_forever()


if __name__ == "__main__":
    try:
        SimpleCarController().run()
    except rospy.ROSInterruptException:
        pass
