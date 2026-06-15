#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""山地小车控制节点。

支持两种模式：
- keyboard：WASD 手动控制，适合课堂演示；
- auto：前进、左转、再前进，适合无人值守录屏。

支持两种驱动后端：
- cmd_vel：只发布 /cmd_vel，适合 Gazebo 运动插件已安装的环境；
- model_state：同时发布 /cmd_vel，并通过 /gazebo/set_model_state 稳定移动模型。
"""

import math
import select
import sys
import termios
import tty
import rospy
from gazebo_msgs.msg import ModelState, ModelStates
from gazebo_msgs.srv import SetModelState
from geometry_msgs.msg import Twist
from geometry_msgs.msg import Quaternion


def yaw_to_quaternion(yaw):
    half_yaw = yaw * 0.5
    quat = Quaternion()
    quat.x = 0.0
    quat.y = 0.0
    quat.z = math.sin(half_yaw)
    quat.w = math.cos(half_yaw)
    return quat


def yaw_from_quaternion(quat):
    siny_cosp = 2.0 * (quat.w * quat.z + quat.x * quat.y)
    cosy_cosp = 1.0 - 2.0 * (quat.y * quat.y + quat.z * quat.z)
    return math.atan2(siny_cosp, cosy_cosp)


class SimpleCarController:
    def __init__(self):
        rospy.init_node("simple_car_controller")
        self.cmd_pub = rospy.Publisher("/cmd_vel", Twist, queue_size=10)

        self.mode = rospy.get_param("~mode", "keyboard")
        self.drive_backend = rospy.get_param("~drive_backend", "cmd_vel")
        self.model_name = rospy.get_param("~model_name", "mountain_car")
        self.fixed_z = rospy.get_param("~fixed_z", 0.45)
        self.forward_speed = rospy.get_param("~forward_speed", 0.45)
        self.backward_speed = rospy.get_param("~backward_speed", -0.30)
        self.turn_speed = rospy.get_param("~turn_speed", 0.65)
        self.forward_duration = rospy.get_param("~forward_duration", 5.0)
        self.turn_duration = rospy.get_param("~turn_duration", 2.0)
        self.rate_hz = rospy.get_param("~rate", 10.0)
        self.key_timeout = rospy.get_param("~key_timeout", 0.15)
        self.model_pose = None
        self.last_step_time = None
        self.set_model_state = None

        if self.drive_backend == "model_state":
            rospy.Subscriber("/gazebo/model_states", ModelStates, self.state_callback)
            rospy.loginfo("等待 Gazebo set_model_state 服务，用稳定后端驱动小车模型...")
            rospy.wait_for_service("/gazebo/set_model_state")
            self.set_model_state = rospy.ServiceProxy("/gazebo/set_model_state", SetModelState)

    def state_callback(self, msg):
        for name, pose in zip(msg.name, msg.pose):
            if name == self.model_name:
                self.model_pose = pose
                return

    @staticmethod
    def make_twist(linear_x=0.0, angular_z=0.0):
        cmd = Twist()
        cmd.linear.x = linear_x
        cmd.angular.z = angular_z
        return cmd

    def publish_cmd(self, linear_x=0.0, angular_z=0.0):
        cmd = self.make_twist(linear_x, angular_z)
        self.cmd_pub.publish(cmd)

        if self.drive_backend == "model_state":
            self.step_model_state(cmd)

    def wait_for_model_pose(self):
        if self.drive_backend != "model_state":
            return True

        rate = rospy.Rate(self.rate_hz)
        rospy.loginfo("等待 Gazebo 中出现模型 %s ...", self.model_name)
        while not rospy.is_shutdown() and self.model_pose is None:
            rate.sleep()
        self.last_step_time = rospy.Time.now()
        return self.model_pose is not None

    def step_model_state(self, cmd):
        if self.model_pose is None or self.set_model_state is None:
            return

        now = rospy.Time.now()
        if self.last_step_time is None:
            self.last_step_time = now
            return

        dt = (now - self.last_step_time).to_sec()
        self.last_step_time = now
        if dt <= 0.0 or dt > 0.5:
            return

        yaw = yaw_from_quaternion(self.model_pose.orientation)
        yaw += cmd.angular.z * dt

        state = ModelState()
        state.model_name = self.model_name
        state.reference_frame = "world"
        state.pose.position.x = self.model_pose.position.x + cmd.linear.x * math.cos(yaw) * dt
        state.pose.position.y = self.model_pose.position.y + cmd.linear.x * math.sin(yaw) * dt
        state.pose.position.z = self.fixed_z
        state.pose.orientation = yaw_to_quaternion(yaw)
        state.twist = cmd

        try:
            self.set_model_state(state)
        except rospy.ServiceException as exc:
            rospy.logwarn_throttle(2.0, "set_model_state 驱动失败：%s", exc)

    def read_key(self):
        ready, _, _ = select.select([sys.stdin], [], [], self.key_timeout)
        if ready:
            return sys.stdin.read(1)
        return ""

    def run_keyboard(self):
        if not sys.stdin.isatty():
            rospy.logwarn("当前终端不支持键盘输入，自动切换到 auto 模式。")
            self.run_auto()
            return

        settings = termios.tcgetattr(sys.stdin)
        rospy.loginfo("WASD 控制已启动：w前进 s后退 a左转 d右转 空格停止 q退出")
        rospy.loginfo("建议在单独终端运行：rosrun mountain_car_sim simple_car_controller.py _mode:=keyboard")

        try:
            tty.setraw(sys.stdin.fileno())
            rate = rospy.Rate(self.rate_hz)
            linear_x = 0.0
            angular_z = 0.0

            while not rospy.is_shutdown():
                key = self.read_key().lower()

                if key == "w":
                    linear_x = self.forward_speed
                    angular_z = 0.0
                elif key == "s":
                    linear_x = self.backward_speed
                    angular_z = 0.0
                elif key == "a":
                    linear_x = 0.0
                    angular_z = self.turn_speed
                elif key == "d":
                    linear_x = 0.0
                    angular_z = -self.turn_speed
                elif key == " ":
                    linear_x = 0.0
                    angular_z = 0.0
                elif key in ("q", "\x03"):
                    break

                # 持续发布上一条速度指令，按空格或 q 时再停止。
                self.publish_cmd(linear_x, angular_z)
                rate.sleep()
        finally:
            self.publish_cmd(0.0, 0.0)
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, settings)
            rospy.loginfo("WASD 控制结束，小车已停止。")

    def publish_for(self, linear_x, angular_z, duration, label):
        rospy.loginfo("%s: linear.x=%.2f angular.z=%.2f duration=%.1fs",
                      label, linear_x, angular_z, duration)

        rate = rospy.Rate(self.rate_hz)
        end_time = rospy.Time.now() + rospy.Duration(duration)
        while not rospy.is_shutdown() and rospy.Time.now() < end_time:
            self.publish_cmd(linear_x, angular_z)
            rate.sleep()

    def stop_forever(self):
        rate = rospy.Rate(self.rate_hz)
        rospy.loginfo("自动巡航结束，持续发布停止命令。")
        while not rospy.is_shutdown():
            self.publish_cmd(0.0, 0.0)
            rate.sleep()

    def run_auto(self):
        # 等待 Gazebo 插件完成订阅，避免前几条速度命令丢失。
        rospy.sleep(1.0)
        if not self.wait_for_model_pose():
            return
        self.publish_for(self.forward_speed, 0.0, self.forward_duration, "阶段1 前进")
        self.publish_for(0.12, self.turn_speed, self.turn_duration, "阶段2 左转")
        self.publish_for(self.forward_speed, 0.0, self.forward_duration, "阶段3 前进")
        self.stop_forever()

    def run(self):
        if self.drive_backend == "model_state" and self.mode != "auto":
            if not self.wait_for_model_pose():
                return

        if self.mode == "auto":
            self.run_auto()
        else:
            self.run_keyboard()


if __name__ == "__main__":
    try:
        SimpleCarController().run()
    except rospy.ROSInterruptException:
        pass
