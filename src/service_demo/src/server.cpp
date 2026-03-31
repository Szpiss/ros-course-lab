#include "ros/ros.h"
#include "service_demo/AddTwoInts.h"

bool handle_add(service_demo::AddTwoInts::Request &req,
                service_demo::AddTwoInts::Response &res)
{
    res.sum = req.a + req.b;
    ROS_INFO("request: a=%ld, b=%ld", (long int)req.a, (long int)req.b);
    ROS_INFO("sending back response: %ld", (long int)res.sum);
    return true;
}

int main(int argc, char **argv)
{
    ros::init(argc, argv, "add_two_ints_server");
    ros::NodeHandle nh;

    ros::ServiceServer service = nh.advertiseService("add_two_ints", handle_add);
    ROS_INFO("Ready to add two ints.");

    ros::spin();
    return 0;
}