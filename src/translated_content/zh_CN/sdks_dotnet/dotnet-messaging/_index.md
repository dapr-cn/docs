---
type: docs
title: "Dapr Messaging .NET SDK"
linkTitle: "消息传递"
weight: 60000
description: 快速上手使用 Dapr Messaging .NET SDK
---

使用 Dapr Messaging 包，您可以在 .NET 应用程序中与 Dapr 消息 API 进行交互。在 v1.15 版本中，该包仅支持[流式 pubsub 功能](https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-publish-subscribe/#subscribe-to-topics)。

未来的 Dapr .NET SDK 版本将会把现有的消息功能从 Dapr.Client 迁移到 Dapr.Messaging 包中。这一变更将在发布说明、文档和相关的技术说明中提前告知。

要开始使用，请查看 [Dapr Messaging]({{< ref dotnet-messaging-pubsub-howto.md >}}) 指南，并参考[最佳实践文档]({{< ref dotnet-messaging-pubsub-usage.md >}})以获取更多指导。