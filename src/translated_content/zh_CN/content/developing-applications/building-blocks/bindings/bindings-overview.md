---
type: docs
title: "绑定概述"
linkTitle: "概述"
weight: 100
description: Dapr 绑定API构建块概述
---

使用 Dapr 的绑定 API，你可以使用来自外部系统的事件触发应用，并与外部系统交互。 使用绑定 API，您可以：

- Avoid the complexities of connecting to and polling from messaging systems, such as queues and message buses.
- Focus on business logic, instead of the implementation details of interacting with a system.
- 使代码不受 SDK 或库的跟踪.
- 处理重试和故障恢复.
- Switch between bindings at runtime.
- Build portable applications with environment-specific bindings set-up and no required code changes.

例如，通过 bindings，您的微服务可以响应传入的 Twilio/SMS 消息，而无需：

- 添加或配置第三方 Twilio SDK
- Worrying about polling from Twilio (or using WebSockets, etc.)

{{% alert title="Note" color="primary" %}}
绑定是独立于 Dapr 运行时开发的。 You can [view and contribute to the bindings](https://github.com/dapr/components-contrib/tree/master/bindings).
{{% /alert %}}

## 输入绑定

With input bindings, you can trigger your application when an event from an external resource occurs. 可选的有效负载和元数据可以与请求一起发送。

To receive events from an input binding:

1. Define the component YAML that describes the binding type and its metadata (connection info, etc.).
1. Listen for the incoming event using:
   - An HTTP endpoint
   - The gRPC proto library to get incoming events.

{{% alert title="Note" color="primary" %}}
 On startup, Dapr sends [an OPTIONS request]({{< ref "bindings_api.md#invoking-service-code-through-input-bindings" >}}) for all defined input bindings to the application. If the application wants to subscribe to the binding, Dapr expects a status code of 2xx or 405.

{{% /alert %}}

Read the [Create an event-driven app using input bindings guide]({{< ref howto-triggers.md >}}) to get started with input bindings.

## 输出绑定

使用输出绑定，您可以调用外部资源。 可选的有效负载和元数据可与调用请求一起发送。

调用输出绑定：

1. Define the component YAML that describes the binding type and its metadata (connection info, etc.).
2. 使用 HTTP 端点或 gRPC 方法调用具有可选有效负载的绑定.

Read the [Use output bindings to interface with external resources guide]({{< ref howto-bindings.md >}}) to get started with output bindings.

## 试用绑定

### 快速入门和教程

Want to put the Dapr bindings API to the test? 浏览以下快速入门和教程以查看 绑定 的实际应用：

| 快速入门/教程                                                                                 | 说明                                                                                                           |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [Bindings quickstart]({{< ref bindings-quickstart.md >}})                               | Work with external systems using input bindings to respond to events and output bindings to call operations. |
| [Bindings tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings) | 演示如何使用Dapr创建与其他组件的输入和输出绑定。 使用与Kafka的绑定。                                                                      |

### Start using bindings directly in your app

想跳过快速入门？ 没问题。 您可以直接在应用程序中尝试 绑定 构建块，以调用输出绑定并触发输入绑定。 After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the bindings API starting with [the input bindings how-to guide]({{< ref howto-triggers.md >}}).

## 下一步

- 遵循这些指南：
  - [使用输入绑定从不同资源触发服务]({{< ref howto-triggers.md >}})
  - [使用输出绑定调用不同的资源]({{< ref howto-bindings.md >}})
- Try out the [bindings tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings/README.md) to experiment with binding to a Kafka queue.
- 查阅[绑定API规范]({{< ref bindings_api.md >}})