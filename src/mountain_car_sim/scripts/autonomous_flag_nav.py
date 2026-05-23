#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""山地小车自动寻迹避障节点。

节点读取 Gazebo 的 /gazebo/model_states：
- 获取 mountain_car 的当前位置和朝向；
- 获取岩石障碍物位置；
- 沿蛇形山路航点前进；
- 靠近岩石时加入避障斥力；
- 到达红旗 checkpoint_flag 附近后停止。

该实现不依赖额外传感器，适合课程实验展示“从山底自动到达红旗”的完整流程。
"""

import math

import rospy
from gazebo_msgs.msg import ModelStates
from geometry_msgs.msg import Twist


def clamp(value, min_value, max_value):
    return max(min_value, min(max_value, value))


def normalize_angle(angle):
    while angle > math.pi:
        angle -= 2.0 * math.pi
    while angle < -math.pi:
        angle += 2.0 * math.pi
    return angle


def yaw_from_quaternion(quat):
    siny_cosp = 2.0 * (quat.w * quat.z + quat.x * quat.y)
    cosy_cosp = 1.0 - 2.0 * (quat.y * quat.y + quat.z * quat.z)
    return math.atan2(siny_cosp, cosy_cosp)


class AutonomousFlagNavigator:
    def __init__(self):
        rospy.init_node("autonomous_flag_nav")

        self.cmd_pub = rospy.Publisher("/cmd_vel", Twist, queue_size=10)
        self.state_sub = rospy.Subscriber("/gazebo/model_states", ModelStates, self.state_callback)

        self.car_name = rospy.get_param("~car_name", "mountain_car")
        self.goal_name = rospy.get_param("~goal_name", "checkpoint_flag")
        self.rate_hz = rospy.get_param("~rate", 15.0)
        self.max_speed = rospy.get_param("~max_speed", 0.55)
        self.min_speed = rospy.get_param("~min_speed", 0.12)
        self.max_turn = rospy.get_param("~max_turn", 1.2)
        self.waypoint_tolerance = rospy.get_param("~waypoint_tolerance", 0.45)
        self.goal_tolerance = rospy.get_param("~goal_tolerance", 0.55)
        self.avoid_radius = rospy.get_param("~avoid_radius", 1.05)
        self.avoid_gain = rospy.get_param("~avoid_gain", 0.85)

        # 航点沿 mountain_trail.dae 中的蛇形土路布置，保证视觉上是在沿山路走。
        self.waypoints = [
            (-4.35, -0.08),
            (-3.30, -0.28),
            (-2.30, -0.42),
            (-1.20, -0.32),
            (-0.20, -0.06),
            (0.90, 0.24),
            (1.90, 0.42),
            (2.90, 0.34),
            (3.85, 0.16),
            (4.65, 0.02),
        ]
        self.current_waypoint = 0
        self.car_pose = None
        self.rock_positions = []
        self.goal_position = (4.7, 0.0)
        self.finished = False

    def state_callback(self, msg):
        rock_positions = []
        goal_position = self.goal_position
        car_pose = None

        for name, pose in zip(msg.name, msg.pose):
            if name == self.car_name:
                car_pose = pose
            elif name.startswith("rock_obstacle"):
                rock_positions.append((pose.position.x, pose.position.y))
            elif name == self.goal_name:
                goal_position = (pose.position.x, pose.position.y)

        self.car_pose = car_pose
        self.rock_positions = rock_positions
        self.goal_position = goal_position

    def stop(self):
        self.cmd_pub.publish(Twist())

    def distance_to(self, x, y):
        cx = self.car_pose.position.x
        cy = self.car_pose.position.y
        return math.hypot(x - cx, y - cy)

    def choose_target(self):
        # 如果已接近当前航点，就切换到下一个航点。
        while self.current_waypoint < len(self.waypoints) - 1:
            wx, wy = self.waypoints[self.current_waypoint]
            if self.distance_to(wx, wy) > self.waypoint_tolerance:
                break
            self.current_waypoint += 1
            rospy.loginfo("切换到第 %d 个山路航点：%s", self.current_waypoint + 1, self.waypoints[self.current_waypoint])

        # 最后一段直接瞄准红旗位置，避免模型名称或摆放高度影响终点判定。
        if self.current_waypoint >= len(self.waypoints) - 1:
            return self.goal_position
        return self.waypoints[self.current_waypoint]

    def obstacle_avoidance_vector(self):
        cx = self.car_pose.position.x
        cy = self.car_pose.position.y
        avoid_x = 0.0
        avoid_y = 0.0

        for ox, oy in self.rock_positions:
            dx = cx - ox
            dy = cy - oy
            dist = math.hypot(dx, dy)
            if 0.001 < dist < self.avoid_radius:
                strength = self.avoid_gain * (1.0 / dist - 1.0 / self.avoid_radius)
                avoid_x += strength * dx / dist
                avoid_y += strength * dy / dist

        return avoid_x, avoid_y

    def compute_command(self):
        cx = self.car_pose.position.x
        cy = self.car_pose.position.y
        yaw = yaw_from_quaternion(self.car_pose.orientation)

        goal_dist = math.hypot(self.goal_position[0] - cx, self.goal_position[1] - cy)
        if goal_dist < self.goal_tolerance:
            self.finished = True
            rospy.loginfo("已到达红旗附近，距离 %.2f m，小车停止。", goal_dist)
            return Twist()

        tx, ty = self.choose_target()
        path_x = tx - cx
        path_y = ty - cy
        avoid_x, avoid_y = self.obstacle_avoidance_vector()

        desired_x = path_x + avoid_x
        desired_y = path_y + avoid_y
        if math.hypot(desired_x, desired_y) < 0.001:
            desired_x, desired_y = path_x, path_y

        desired_heading = math.atan2(desired_y, desired_x)
        heading_error = normalize_angle(desired_heading - yaw)

        cmd = Twist()
        cmd.angular.z = clamp(1.8 * heading_error, -self.max_turn, self.max_turn)

        target_dist = math.hypot(path_x, path_y)
        speed = clamp(0.75 * target_dist, self.min_speed, self.max_speed)
        # 偏航角大时先转向，避免横着冲出山路。
        speed *= clamp(math.cos(heading_error), 0.15, 1.0)
        cmd.linear.x = speed

        rospy.loginfo_throttle(
            1.0,
            "自动导航：航点 %d/%d 目标=(%.2f, %.2f) 红旗距=%.2f cmd=(%.2f, %.2f)",
            self.current_waypoint + 1,
            len(self.waypoints),
            tx,
            ty,
            goal_dist,
            cmd.linear.x,
            cmd.angular.z,
        )
        return cmd

    def run(self):
        rate = rospy.Rate(self.rate_hz)
        rospy.loginfo("等待 Gazebo model_states，用于自动寻迹避障...")

        while not rospy.is_shutdown() and self.car_pose is None:
            rate.sleep()

        rospy.loginfo("自动寻迹避障启动：从山底沿山路前往红旗。")
        while not rospy.is_shutdown():
            if self.finished:
                self.stop()
            else:
                self.cmd_pub.publish(self.compute_command())
            rate.sleep()


if __name__ == "__main__":
    try:
        AutonomousFlagNavigator().run()
    except rospy.ROSInterruptException:
        pass
