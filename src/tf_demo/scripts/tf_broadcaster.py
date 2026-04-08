#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import rospy
import tf
import turtlesim.msg

def pose_callback(msg):
    br = tf.TransformBroadcaster()

    # 广播 turtle1 相对于 world 的坐标变换
    br.sendTransform(
        (msg.x, msg.y, 0.0),
        tf.transformations.quaternion_from_euler(0, 0, msg.theta),
        rospy.Time.now(),
        "turtle1",
        "world"
    )

if __name__ == "__main__":
    rospy.init_node("tf_broadcaster")
    rospy.Subscriber("/turtle1/pose", turtlesim.msg.Pose, pose_callback)
    rospy.spin()