#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import rospy
import tf

if __name__ == "__main__":
    rospy.init_node("tf_listener")

    listener = tf.TransformListener()
    rate = rospy.Rate(10.0)

    while not rospy.is_shutdown():
        try:
            (trans, rot) = listener.lookupTransform('/world', '/turtle1', rospy.Time(0))
            rospy.loginfo("平移: x=%.3f, y=%.3f, z=%.3f", trans[0], trans[1], trans[2])
            rospy.loginfo("旋转四元数: x=%.3f, y=%.3f, z=%.3f, w=%.3f", rot[0], rot[1], rot[2], rot[3])
        except (tf.LookupException, tf.ConnectivityException, tf.ExtrapolationException):
            pass

        rate.sleep()