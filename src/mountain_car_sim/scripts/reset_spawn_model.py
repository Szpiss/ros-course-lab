#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""删除旧同名模型后重新生成小车。

Gazebo 中模型名必须唯一。重复运行 launch 时，如果旧的 mountain_car 还在场景中，
直接调用 spawn_model 会报 entity already exists。这个脚本先删除旧模型，再生成新模型。
"""

import math

import rospy
from gazebo_msgs.srv import DeleteModel, SpawnModel
from geometry_msgs.msg import Pose, Quaternion


def yaw_to_quaternion(yaw):
    half_yaw = yaw * 0.5
    quat = Quaternion()
    quat.x = 0.0
    quat.y = 0.0
    quat.z = math.sin(half_yaw)
    quat.w = math.cos(half_yaw)
    return quat


def main():
    rospy.init_node("reset_spawn_mountain_car")

    model_name = rospy.get_param("~model_name", "mountain_car")
    robot_namespace = rospy.get_param("~robot_namespace", "")
    reference_frame = rospy.get_param("~reference_frame", "world")
    x = rospy.get_param("~x", -4.0)
    y = rospy.get_param("~y", 0.0)
    z = rospy.get_param("~z", 0.45)
    yaw = rospy.get_param("~yaw", 0.0)

    robot_xml = rospy.get_param("/robot_description", "")
    if not robot_xml.strip():
        rospy.logerr("robot_description 为空，无法生成小车。")
        raise SystemExit(1)

    rospy.loginfo("等待 Gazebo 删除和生成模型服务...")
    rospy.wait_for_service("/gazebo/delete_model")
    rospy.wait_for_service("/gazebo/spawn_urdf_model")

    delete_model = rospy.ServiceProxy("/gazebo/delete_model", DeleteModel)
    spawn_model = rospy.ServiceProxy("/gazebo/spawn_urdf_model", SpawnModel)

    try:
        result = delete_model(model_name)
        if result.success:
            rospy.loginfo("已删除旧模型 %s。", model_name)
        else:
            rospy.loginfo("旧模型 %s 不存在或无需删除：%s", model_name, result.status_message)
    except rospy.ServiceException as exc:
        rospy.logwarn("删除旧模型时出现异常，继续尝试生成新模型：%s", exc)

    pose = Pose()
    pose.position.x = x
    pose.position.y = y
    pose.position.z = z
    pose.orientation = yaw_to_quaternion(yaw)

    rospy.loginfo("生成模型 %s，位置 x=%.2f y=%.2f z=%.2f yaw=%.2f", model_name, x, y, z, yaw)
    result = spawn_model(model_name, robot_xml, robot_namespace, pose, reference_frame)

    if not result.success:
        rospy.logerr("生成模型失败：%s", result.status_message)
        raise SystemExit(1)

    rospy.loginfo("生成模型成功：%s", result.status_message)


if __name__ == "__main__":
    main()
