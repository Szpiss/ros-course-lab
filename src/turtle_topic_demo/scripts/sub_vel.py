#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import rospy
from geometry_msgs.msg import Twist

def callback(msg):
    rospy.loginfo("linear.x = %.3f, angular.z = %.3f", msg.linear.x, msg.angular.z)

def main():
    rospy.init_node('sub_vel')
    rospy.Subscriber('/turtle1/cmd_vel', Twist, callback)
    rospy.spin()

if __name__ == '__main__':
    main()