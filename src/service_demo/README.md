# `service_demo` 实验说明

## 1. 这个 demo 做了什么

这个 demo 演示了 ROS Service 的请求/响应通信模型。它实现了一个最经典的服务：

```text
输入两个整数 a 和 b
返回它们的和 sum
```

整个 demo 由 3 部分组成：

- `srv/AddTwoInts.srv`：定义服务接口格式
- `src/server.cpp`：服务端，负责接收请求并返回结果
- `src/client.cpp`：客户端，负责发起请求并读取响应

和 Topic 的“持续广播”不同，Service 是一次请求对应一次响应，更适合命令式调用或查询式交互。

## 2. 包内文件说明

```text
service_demo/
├── CMakeLists.txt
├── package.xml
├── README.md
├── src/
│   ├── client.cpp
│   └── server.cpp
└── srv/
    └── AddTwoInts.srv
```

- `srv/AddTwoInts.srv`：定义请求与响应字段
- `src/server.cpp`：服务端节点
- `src/client.cpp`：客户端节点
- `CMakeLists.txt`：配置服务生成、消息编译和可执行文件构建
- `package.xml`：声明 `roscpp`、`message_generation`、`message_runtime` 等依赖

## 3. 服务接口是怎么定义的

### `AddTwoInts.srv`

```srv
int64 a
int64 b
---
int64 sum
```

这份文件用 `---` 把服务定义拆成两部分：

- 上半部分：请求 `Request`
  - `a`
  - `b`
- 下半部分：响应 `Response`
  - `sum`

也就是说，客户端发过去的是两个 64 位整数，服务端返回的是一个 64 位整数求和结果。

## 4. 运行步骤

先在工作空间根目录编译并加载环境：

```bash
cd /Users/cuing/ros/ros-course-lab
catkin_make
source devel/setup.bash
```

### 4.1 启动 ROS Master

```bash
roscore
```

### 4.2 启动服务端

新开终端并执行：

```bash
cd /Users/cuing/ros/ros-course-lab
source devel/setup.bash
rosrun service_demo server_node
```

正常情况下会看到：

```text
Ready to add two ints.
```

### 4.3 启动客户端并发送请求

再开一个终端执行：

```bash
cd /Users/cuing/ros/ros-course-lab
source devel/setup.bash
rosrun service_demo client_node 3 5
```

客户端会打印：

```text
Sum: 8
```

服务端终端会同步打印收到的请求和返回的响应。

## 5. 服务端是怎么实现的

### 5.1 核心目标

服务端要完成两件事：

1. 向 ROS 系统注册一个名为 `add_two_ints` 的服务
2. 当客户端发来请求时，执行求和并返回结果

### 5.2 `server.cpp` 的执行流程

#### 第一步：初始化节点

```cpp
ros::init(argc, argv, "add_two_ints_server");
```

作用：初始化当前 ROS 节点，节点名为 `add_two_ints_server`。

#### 第二步：创建节点句柄

```cpp
ros::NodeHandle nh;
```

作用：创建 `NodeHandle`，后续所有 ROS 通信对象都通过它来创建。

#### 第三步：注册服务

```cpp
ros::ServiceServer service = nh.advertiseService("add_two_ints", handle_add);
```

这是整个服务端最关键的一行。

- `nh.advertiseService(...)`
  作用：向 ROS Master 注册一个服务
- `"add_two_ints"`
  作用：服务名
- `handle_add`
  作用：当有客户端请求这个服务时，要调用的回调函数

#### 第四步：输出启动日志

```cpp
ROS_INFO("Ready to add two ints.");
```

作用：提示服务已经就绪。

#### 第五步：持续等待请求

```cpp
ros::spin();
```

作用：进入事件循环，保持节点存活，等待客户端请求到来。

### 5.3 `handle_add()` 回调函数做了什么

```cpp
bool handle_add(service_demo::AddTwoInts::Request &req,
                service_demo::AddTwoInts::Response &res)
```

这个函数是服务端真正处理业务逻辑的地方。

#### 参数含义

- `req`：客户端发来的请求数据
- `res`：服务端准备返回给客户端的响应数据

#### 处理步骤

1. `res.sum = req.a + req.b;`
   作用：把请求中的两个数相加，并写入响应字段 `sum`
2. `ROS_INFO("request: a=%ld, b=%ld", ...)`
   作用：输出收到的请求参数
3. `ROS_INFO("sending back response: %ld", ...)`
   作用：输出将要返回的计算结果
4. `return true;`
   作用：告诉 ROS 这次服务处理成功，可以把 `res` 返回给客户端

## 6. 客户端是怎么实现的

### 6.1 核心目标

客户端要完成三件事：

1. 从命令行读取两个整数
2. 调用 `add_two_ints` 服务
3. 打印服务端返回的结果

### 6.2 `client.cpp` 的执行流程

#### 第一步：初始化节点

```cpp
ros::init(argc, argv, "add_two_ints_client");
```

作用：初始化客户端节点。

#### 第二步：检查命令行参数

```cpp
if (argc != 3)
{
    ROS_INFO("usage: client_node X Y");
    return 1;
}
```

作用：确保运行命令中提供了两个数字参数。如果参数数量不对，就直接退出。

#### 第三步：创建节点句柄

```cpp
ros::NodeHandle nh;
```

作用：后续创建服务客户端对象时需要使用。

#### 第四步：创建服务客户端

```cpp
ros::ServiceClient client = nh.serviceClient<service_demo::AddTwoInts>("add_two_ints");
```

这是客户端最关键的一步。

- `nh.serviceClient<service_demo::AddTwoInts>(...)`
  作用：创建一个用于调用服务的客户端对象
- 模板参数 `service_demo::AddTwoInts`
  作用：告诉编译器该服务的数据类型
- `"add_two_ints"`
  作用：指定要连接的服务名

#### 第五步：构造服务请求

```cpp
service_demo::AddTwoInts srv;
srv.request.a = atoll(argv[1]);
srv.request.b = atoll(argv[2]);
```

作用：

- `service_demo::AddTwoInts srv;`
  创建一个服务对象，内部同时包含 `request` 和 `response`
- `atoll(argv[1])` / `atoll(argv[2])`
  把命令行字符串转换成整数
- `srv.request.a`、`srv.request.b`
  把转换后的整数写入请求字段

#### 第六步：发起调用

```cpp
if (client.call(srv))
```

作用：向服务端发送请求，并等待响应返回。

如果调用成功：

```cpp
ROS_INFO("Sum: %ld", (long int)srv.response.sum);
```

作用：打印服务端返回的 `sum`。

如果调用失败：

```cpp
ROS_ERROR("Failed to call service add_two_ints");
return 1;
```

作用：输出错误并退出。常见原因是服务端还没启动，或者服务名不一致。

## 7. 构建系统是怎么支持这个 demo 的

这个 demo 不只是写了 C++ 代码，还依赖 `catkin` 自动把 `.srv` 文件生成成可用的头文件和消息类型。

### 7.1 `CMakeLists.txt` 的关键配置

#### `find_package(...)`

```cmake
find_package(catkin REQUIRED COMPONENTS
  roscpp
  rospy
  std_msgs
  message_generation
)
```

作用：声明构建时需要 `roscpp`、`message_generation` 等组件。

#### `add_service_files(...)`

```cmake
add_service_files(
  FILES
  AddTwoInts.srv
)
```

作用：告诉 `catkin` 需要处理 `srv/AddTwoInts.srv` 这个服务定义文件。

#### `generate_messages(...)`

```cmake
generate_messages(
  DEPENDENCIES
  std_msgs
)
```

作用：根据 `.srv` 文件自动生成服务相关代码。

#### `catkin_package(...)`

```cmake
catkin_package(
  CATKIN_DEPENDS roscpp rospy std_msgs message_runtime
)
```

作用：导出本包依赖，并声明运行时需要 `message_runtime`。

#### `add_executable(...)`

```cmake
add_executable(server_node src/server.cpp)
add_executable(client_node src/client.cpp)
```

作用：把服务端和客户端源码分别编译成两个可执行节点。

#### `add_dependencies(...)`

```cmake
add_dependencies(server_node ${${PROJECT_NAME}_EXPORTED_TARGETS} ${catkin_EXPORTED_TARGETS})
add_dependencies(client_node ${${PROJECT_NAME}_EXPORTED_TARGETS} ${catkin_EXPORTED_TARGETS})
```

作用：确保在编译 `server_node` 和 `client_node` 之前，服务消息代码已经先生成完成。

#### `target_link_libraries(...)`

```cmake
target_link_libraries(server_node ${catkin_LIBRARIES})
target_link_libraries(client_node ${catkin_LIBRARIES})
```

作用：把 ROS 相关库链接进可执行文件。

### 7.2 `package.xml` 的关键依赖

- `roscpp`：编写 C++ ROS 节点
- `message_generation`：构建阶段生成服务代码
- `message_runtime`：运行阶段加载服务类型支持
- `std_msgs`：基础消息依赖
- `rospy`：虽然当前 demo 主要是 C++，但包里也声明了 Python 侧运行依赖

## 8. Topic 和 Service 的区别

这个实验也能帮助理解 Topic 与 Service 的通信差异：

- Topic：适合持续发送数据流，例如速度、传感器数据、图像
- Service：适合“一问一答”式操作，例如查询、计算、触发某个动作

`service_demo` 之所以适合用 Service，是因为“输入两个数字并返回一个结果”天然就是同步请求/响应模型。

## 9. 实验结论

这个 demo 展示了 ROS Service 的完整链路：

1. 用 `.srv` 文件定义接口
2. 用 `add_service_files()` 和 `generate_messages()` 生成服务类型
3. 服务端通过 `advertiseService()` 注册服务
4. 客户端通过 `serviceClient()` 和 `call()` 发起请求
5. 服务端在回调函数中处理请求并返回结果

通过这个实验，可以清楚看到 ROS 中同步通信模式是如何搭建和调用的。
