---
type: docs
title: "bindings 概述"
linkTitle: "概述"
weight: 100
description: bindings API 模块的概述
---

通过 Dapr 的 bindings API，您可以利用外部系统的事件来触发应用程序，并与外部系统交互。使用 bindings API，您可以：

- 避免连接到消息系统并进行轮询的复杂性（如队列和消息总线）。
- 专注于业务逻辑，而不是系统交互的实现细节。
- 使您的代码不依赖于特定的 SDK 或库。
- 处理重试和故障恢复。
- 在运行时可以切换不同的 bindings。
- 构建具有特定环境 bindings 设置的可移植应用程序，而无需更改代码。

例如，通过 bindings，您的应用程序可以响应传入的 Twilio/SMS 消息，而无需：

- 添加或配置第三方 Twilio SDK
- 担心从 Twilio 轮询（或使用 WebSockets 等）

<img src="/images/binding-overview.png" width=1000 alt="显示 bindings 的图示" style="padding-bottom:25px;">

在上图中：
- 输入 binding 触发您应用程序上的一个方法。
- 在组件上执行输出 binding 操作，例如 `"create"`。

bindings 的开发独立于 Dapr 运行时。您可以[查看并贡献 bindings](https://github.com/dapr/components-contrib/tree/master/bindings)。

{{% alert title="注意" color="primary" %}}
如果您正在使用 HTTP Binding，建议使用[service-invocation]({{< ref service_invocation_api.md >}}) 代替。阅读[如何：使用 HTTP 调用非 Dapr 端点]({{< ref "howto-invoke-non-dapr-endpoints.md" >}})以获取更多信息。
{{% /alert %}}

## 输入 bindings

通过输入 bindings，您可以在外部资源发生事件时触发您的应用程序。请求中可以发送可选的负载和元数据。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=wlmAi7BJBWS8KNK7&t=8261)展示了 Dapr 输入 binding 的工作原理。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=wlmAi7BJBWS8KNK7&amp;start=8261" title="YouTube 视频播放器" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>  

要接收来自输入 binding 的事件：

1. 定义描述 binding 类型及其元数据（如连接信息）的组件 YAML。
1. 使用以下方式监听传入事件：
   - HTTP 端点
   - gRPC proto 库获取传入事件。

{{% alert title="注意" color="primary" %}}
在启动时，Dapr 会向应用程序发送[一个 OPTIONS 请求]({{< ref "bindings_api.md#invoking-service-code-through-input-bindings" >}})以获取所有定义的输入 bindings。如果应用程序想要订阅 binding，Dapr 期望返回状态码为 2xx 或 405。

{{% /alert %}}

阅读[使用输入 bindings 创建事件驱动应用程序指南]({{< ref howto-triggers.md >}})以开始使用输入 bindings。

## 输出 bindings

通过输出 bindings，您可以调用外部资源。调用请求中可以发送可选的负载和元数据。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=PoA4NEqL5mqNj6Il&t=7668)展示了 Dapr 输出 binding 的工作原理。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=PoA4NEqL5mqNj6Il&amp;start=7668" title="YouTube 视频播放器" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>  

要调用输出 binding：

1. 定义描述 binding 类型及其元数据（如连接信息）的组件 YAML。
1. 使用 HTTP 端点或 gRPC 方法调用 binding，并附带可选负载。
1. 指定输出操作。输出操作取决于您使用的 binding 组件，可以包括：
   - `"create"`
   - `"update"`
   - `"delete"`
   - `"exec"` 

阅读[使用输出 bindings 与外部资源交互指南]({{< ref howto-bindings.md >}})以开始使用输出 bindings。

## binding 方向（可选）

您可以提供 `direction` 元数据字段以指示 binding 组件支持的方向。这可以使 Dapr sidecar 避免“等待应用程序准备就绪”状态，减少 Dapr sidecar 与应用程序之间的生命周期依赖：

- `"input"`
- `"output"`
- `"input, output"`

{{% alert title="注意" color="primary" %}}
强烈建议所有输入 bindings 应该包含 `direction` 属性。
{{% /alert %}}

[查看 bindings `direction` 元数据的完整示例。]({{< ref "bindings_api.md#binding-direction-optional" >}})

## 试用 bindings

### 快速入门和教程

想要测试 Dapr bindings API？通过以下快速入门和教程来查看 bindings 的实际应用：

| 快速入门/教程 | 描述 |
| ------------------- | ----------- |
| [bindings 快速入门]({{< ref bindings-quickstart.md >}}) | 使用输入 bindings 处理外部系统的事件，并使用输出 bindings 调用操作。 |
| [bindings 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings) | 演示如何使用 Dapr 创建到其他组件的输入和输出 bindings。使用 bindings 连接到 Kafka。 |

### 直接在您的应用程序中开始使用 bindings

想要跳过快速入门？没问题。您可以直接在应用程序中试用 bindings 模块，以调用输出 bindings 和触发输入 bindings。在[Dapr 安装完成后]({{< ref "getting-started/_index.md" >}})，您可以从[输入 bindings 如何指南]({{< ref howto-triggers.md >}})开始使用 bindings API。

## 下一步

- 请遵循以下指南：
  - [如何：使用输入 bindings 从不同资源触发服务]({{< ref howto-triggers.md >}})
  - [如何：使用输出 bindings 与外部资源交互]({{< ref howto-bindings.md >}})
- 尝试[bindings 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings/README.md)以体验绑定到 Kafka 队列。
- 阅读[bindings API 规范]({{< ref bindings_api.md >}})