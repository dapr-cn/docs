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
- Keep your code free from SDKs or libraries.
- Handle retries and failure recovery.
- Switch between bindings at runtime.
- Build portable applications with environment-specific bindings set-up and no required code changes.

例如，通过 bindings，您的微服务可以响应传入的 Twilio/SMS 消息，而无需：

- 添加或配置第三方 Twilio SDK
- Worrying about polling from Twilio (or using WebSockets, etc.)

{{% alert title="Note" color="primary" %}}
Bindings are developed independently of Dapr runtime. You can [view and contribute to the bindings](https://github.com/dapr/components-contrib/tree/master/bindings).
{{% /alert %}}

## Input bindings

With input bindings, you can trigger your application when an event from an external resource occurs. An optional payload and metadata may be sent with the request.

To receive events from an input binding:

1. Define the component YAML that describes the binding type and its metadata (connection info, etc.).
1. Listen for the incoming event using:
   - An HTTP endpoint
   - The gRPC proto library to get incoming events.

{{% alert title="Note" color="primary" %}}
 On startup, Dapr sends [an OPTIONS request]({{< ref "bindings_api.md#invoking-service-code-through-input-bindings" >}}) for all defined input bindings to the application. If the application wants to subscribe to the binding, Dapr expects a status code of 2xx or 405.

{{% /alert %}}

Read the [Create an event-driven app using input bindings guide]({{< ref howto-triggers.md >}}) to get started with input bindings.

## Output bindings

使用输出绑定，您可以调用外部资源。 An optional payload and metadata can be sent with the invocation request.

调用输出绑定：

1. Define the component YAML that describes the binding type and its metadata (connection info, etc.).
2. Use the HTTP endpoint or gRPC method to invoke the binding with an optional payload.

Read the [Use output bindings to interface with external resources guide]({{< ref howto-bindings.md >}}) to get started with output bindings.

## 试用绑定

### 快速入门和教程

Want to put the Dapr bindings API to the test? 浏览以下快速入门和教程以查看 绑定 的实际应用：

| 快速入门/教程                                                                                 | 说明                                                                                                            |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [Bindings quickstart]({{< ref bindings-quickstart.md >}})                               | Work with external systems using input bindings to respond to events and output bindings to call operations.  |
| [Bindings tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings) | Demonstrates how to use Dapr to create input and output bindings to other components. Uses bindings to Kafka. |

### Start using bindings directly in your app

想跳过快速入门？ 没问题。 您可以直接在应用程序中尝试 绑定 构建块，以调用输出绑定并触发输入绑定。 After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the bindings API starting with [the input bindings how-to guide]({{< ref howto-triggers.md >}}).

## 下一步

- Follow these guides on:
  - [How-To: Trigger a service from different resources with input bindings]({{< ref howto-triggers.md >}})
  - [How-To: Use output bindings to interface with external resources]({{< ref howto-bindings.md >}})
- Try out the [bindings tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings/README.md) to experiment with binding to a Kafka queue.
- Read the [bindings API specification]({{< ref bindings_api.md >}})