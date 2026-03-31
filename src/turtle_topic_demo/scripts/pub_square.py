#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import rospy
from geometry_msgs.msg import Twist

def move(pub, linear_x, angular_z, duration):
    vel_msg = Twist()
    vel_msg.linear.x = linear_x
    vel_msg.angular.z = angular_z

    start_time = rospy.Time.now().to_sec()
    rate = rospy.Rate(10)

    while not rospy.is_shutdown():
        current_time = rospy.Time.now().to_sec()
        if current_time - start_time >= duration:
            break
        pub.publish(vel_msg)
        rate.sleep()

    pub.publish(Twist())
    rospy.sleep(0.5)

def main():
    rospy.init_node('pub_square')
    pub = rospy.Publisher('/turtle1/cmd_vel', Twist, queue_size=10)
    rospy.sleep(1)

    side_time = 20.0
    turn_time = 7.85

    for _ in range(4):
        move(pub, 0.1, 0.0, side_time)
        move(pub, 0.0, 0.2, turn_time)

if __name__ == '__main__':
    try:
        main()
    except rospy.ROSInterruptException:
        pass
