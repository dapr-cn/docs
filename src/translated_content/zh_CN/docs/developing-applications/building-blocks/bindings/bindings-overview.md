---
type: docs
title: 绑定概述
linkTitle: Overview
weight: 100
description: Dapr 绑定API构建块概述
---

使用 Dapr 的绑定 API，你可以使用来自外部系统的事件触发应用，并与外部系统交互。 使用绑定 API，您可以：

- 避免与队列和消息总线等消息系统连接和轮询的复杂性。
- 关注业务逻辑，而不是与系统交互的执行细节。
- 让您的代码远离 SDK 或库。
- 处理重试和故障恢复。
- 在运行时切换绑定
- 利用特定环境绑定设置构建可移植应用程序，无需更改代码。

例如，有了绑定，您的应用程序就可以响应传入的 Twilio/SMS 消息，而不需要

- 添加或配置第三方 Twilio SDK
- 担心来自 Twilio 的轮询（或使用 WebSockets 等）

<img src="/images/binding-overview.png" width=1000 alt="Diagram showing bindings" style="padding-bottom:25px;">

在上图中

- 输入绑定会触发应用程序的一个方法。
- 在组件上执行输出绑定操作，如 `"create"`。

绑定是独立于 Dapr 运行时开发的。 您可以[查看并贡献绑定](https://github.com/dapr/components-contrib/tree/master/bindings)。

{{% alert title="注意" color="primary" %}}
如果您正在使用HTTP绑定，则最好使用[服务调用]({{< ref service_invocation_api.md >}})。 阅读[操作方法：使用HTTP调用非Dapr端点]({{< ref "howto-invoke-non-dapr-endpoints.md" >}})以获取更多信息。
{{% /alert %}}

## 输入绑定

通过输入绑定，您可以在外部资源发生事件时触发应用程序。 可选择随请求发送有效载荷和元数据。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=wlmAi7BJBWS8KNK7\&t=8261)演示了Dapr输入绑定是如何工作的。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=wlmAi7BJBWS8KNK7&amp;start=8261" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>  

接收来自输入绑定的事件：

1. 定义描述绑定类型及其元数据（连接信息等）的 YAML 组件。
2. 监听传入事件:
   - HTTP 端点
   - 用于获取传入事件的 gRPC 原型库。

{{% alert title="注意" color="primary" %}}
在启动时，Dapr会向应用程序发送[OPTIONS请求]({{< ref "bindings_api.md#invoking-service-code-through-input-bindings" >}})，以获取所有已定义的输入绑定。 如果应用程序要订阅绑定，Dapr 将收到 2xx 或 405 的状态代码。



阅读[使用输入绑定创建事件驱动应用指南]({{< ref howto-triggers.md >}})以开始使用输入绑定。

## 输出绑定

使用输出绑定，您可以调用外部资源。 调用请求可发送可选的有效载荷和元数据。

[以下概述视频和演示](https://www.youtube.com/live/0y7ne6teHT4?si=PoA4NEqL5mqNj6Il\&t=7668)演示了Dapr中的输出绑定是如何工作的。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/0y7ne6teHT4?si=PoA4NEqL5mqNj6Il&amp;start=7668" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>  

调用输出绑定：

1. 定义描述绑定类型及其元数据（连接信息等）的 YAML 组件。
2. 使用 HTTP 端点或 gRPC 方法调用带有可选有效载荷的绑定。
3. 指定输出操作。 输出操作取决于您使用的绑定组件，可包括
   - `"create"`
   - `"update"`
   - `"delete"`
   - `"exec"`

开始使用输出绑定，请参阅[使用输出绑定向外部系统发送事件指南]({{< ref howto-bindings.md >}})。

## 绑定方向（可选）

您可以提供`direction`元数据字段来指明绑定组件支持的方向。 这样，Dapr sidecar避免了`"等待应用程序准备就绪"`的状态，减少了Dapr sidecar与应用程序之间的生命周期依赖性：

- `"input"`
- `"output"`
- `"input, output"`

{{% alert title="注意" color="primary" %}}
强烈建议所有输入绑定都包含 `direction` 属性。
{{% /alert %}}

[查看完整的绑定`direction`元数据示例。]({{< ref "bindings_api.md#binding-direction-optional" >}})

## 试用绑定

### 快速启动和教程

想测试一下 Dapr 绑定 API 吗？ 浏览以下快速入门和教程以查看 绑定 的实际应用：

| 快速入门/教程                                                                                                             | 说明                                          |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [绑定快速入门]({{< ref bindings-quickstart.md >}}) | 使用输入绑定响应事件，使用输出绑定调用操作，与外部系统协作。              |
| [绑定教程](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings)                                          | 演示如何使用 Dapr 创建与其他组件的输入和输出绑定。 使用与 Kafka 的绑定。 |

### 开始直接在应用程序中使用绑定

想跳过快速入门？ Not a problem. 您可以直接在应用程序中尝试 绑定 构建块，以调用输出绑定并触发输入绑定。 安装[Dapr]({{< ref "getting-started/_index.md" >}})之后，您可以开始使用绑定 API，从[输入绑定操作方法指南]({{< ref howto-triggers.md >}})开始。

## Next Steps

- 关注以下指南：
  - [操作方法：使用输入绑定从不同资源触发服务]({{< ref howto-triggers.md >}})
  - [操作方法：使用输出绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- 尝试使用[绑定教程](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings/README.md)来实验绑定到Kafka队列。
- 阅读[绑定API规范]({{< ref bindings_api.md >}})
