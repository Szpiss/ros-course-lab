#!/usr/bin/env python3
import rospy
from std_msgs.msg import String


VOICE_TO_WAYPOINT = {
    "kitchen": "kitchen",
    "living room": "living_room",
    "dining room": "dining_room",
    "dinig room": "dining_room",
    "bedroom": "bedroom",
}


class VoiceBridge:
    def __init__(self):
        self.publisher = rospy.Publisher("/waterplus/navi_waypoint", String, queue_size=10)
        self.subscriber = rospy.Subscriber("/xfyun/iat", String, self.handle_voice)

    def handle_voice(self, msg):
        text = msg.data.strip().lower()
        for keyword, waypoint_name in VOICE_TO_WAYPOINT.items():
            if keyword in text:
                rospy.loginfo("recognized=%s -> waypoint=%s", text, waypoint_name)
                self.publisher.publish(String(data=waypoint_name))
                return
        rospy.logwarn("unmatched voice command: %s", text)


def main():
    rospy.init_node("lab6_voice_bridge")
    VoiceBridge()
    rospy.loginfo("lab6_voice_bridge ready")
    rospy.spin()


if __name__ == "__main__":
    main()
