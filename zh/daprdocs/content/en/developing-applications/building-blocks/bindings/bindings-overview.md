---
type: docs
title: "绑定概述"
linkTitle: "Overview"
weight: 100
description: Dapr 绑定构建块概述
---

## 简介

使用绑定，您可以使用来自外部系统的事件或与外部系统的接口来触发应用程序。 此构建块为您和您的代码提供了若干益处:

- 除去连接到消息传递系统 ( 如队列和消息总线 ) 并进行轮询的复杂性
- 聚焦于业务逻辑，而不是如何与系统交互的实现细节
- Keep your code free from SDKs or libraries
- Handle retries and failure recovery
- Switch between bindings at run time
- Build portable applications where environment-specific bindings are set-up and no code changes are required

For a specific example, bindings would allow your microservice to respond to incoming Twilio/SMS messages without adding or configuring a third-party Twilio SDK, worrying about polling from Twilio (or using websockets, etc.).

Bindings are developed independently of Dapr runtime. You can view and contribute to the bindings [here](https://github.com/dapr/components-contrib/tree/master/bindings).

## Input bindings

Input bindings are used to trigger your application when an event from an external resource has occurred. An optional payload and metadata may be sent with the request.

In order to receive events from an input binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.)
2. Listen on an HTTP endpoint for the incoming event, or use the gRPC proto library to get incoming events

> On startup Dapr sends a `OPTIONS` request for all defined input bindings to the application and expects a status code other than `NOT FOUND (404)` if this application wants to subscribe to the binding.

Read the [Create an event-driven app using input bindings]({{< ref howto-triggers.md >}}) page to get started with input bindings.

## Output bindings

Output bindings allow users to invoke external resources. An optional payload and metadata can be sent with the invocation request.

In order to invoke an output binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.)
2. Use the HTTP endpoint or gRPC method to invoke the binding with an optional payload

Read the [Send events to external systems using output bindings]({{< ref howto-bindings.md >}}) page to get started with output bindings.



 ## Related Topics
- [Trigger a service from different resources with input bindings]({{< ref howto-triggers.md >}})
- [Invoke different resources using output bindings]({{< ref howto-bindings.md >}})

