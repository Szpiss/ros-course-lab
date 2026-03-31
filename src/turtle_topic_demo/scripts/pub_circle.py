#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import rospy
from geometry_msgs.msg import Twist

def main():
    rospy.init_node('pub_circle')
    pub = rospy.Publisher('/turtle1/cmd_vel', Twist, queue_size=10)
    rate = rospy.Rate(10)
    
    vel_msg = Twist()
    vel_msg.linear.x = 0.1
    vel_msg.angular.z = 0.2
    
    while not rospy.is_shutdown():
        pub.publish(vel_msg)
        rate.sleep()
        
if __name__ == '__main__':
    try:
        main()
    except rospy.ROSInterruptException:
        pass