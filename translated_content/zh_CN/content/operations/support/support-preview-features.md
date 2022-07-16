---
type: docs
title: "预览功能"
linkTitle: "预览功能"
weight: 4000
description: "当前预览功能列表"
---

Dapr 中的预览功能在首次发布时被视为实验性功能。 这些预览功能需要显式选择加入才能使用。 选择加入在 Dapr 的配置中指定。 有关详细信息，请参阅 [操作方法：启用预览功能]({{<ref preview-features>}}) 。


## 当前预览功能
| 特性               | 说明                                                                                 | 设置                   | 文档                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------- |
| **Actor可重入性**    | 使 Actors 能够在同一调用链中被多次调用，从而允许在 Actor 之间回调。                                          | `Actor.Reentrancy`   | [Actor可重入性]({{<ref actor-reentrancy>}})                                         |
| **分区 actor 提醒**  | 允许在基础状态存储中的多个键之间对 actor reminders 进行分区，以提高规模和性能。                                   | `Actor.TypeMetadata` | [操作方法：Actor Reminders 分区]({{< ref "howto-actors.md#partitioning-reminders" >}}) |
| **gRPC 代理**      | 允许通过 gRPC 代理，通过 Dapr 在 gRPC 服务上使用服务调用来调用端点，而无需使用 Dapr SDK。                         | `proxy.grpc`         | [操作方法：使用 gRPC 调用服务]({{<ref howto-invoke-services-grpc>}})                       |
| **状态存储加密**       | 为状态存储启用自动客户端加密                                                                     | `State.Encryption`   | [操作方法：加密应用程序状态]({{<ref howto-encrypt-state>}})                                  |
| **发布/订阅路由**      | 允许使用表达式将 Cloud Events 路由到应用程序中的不同 URI/路径和事件处理程序。                                   | `PubSub.Routing`     | [指南：发布消息并订阅主题]({{<ref howto-route-messages>}})                                  |
| **ARM64 Mac 支持** | Dapr CLI、sidecar 和 Dashboard 现在已针对 ARM64 Mac 进行了本地编译，并通过 Homebrew 进行了 Dapr CLI 安装。 | N/A                  | [安装 Dapr CLI]({{<ref install-dapr-cli>}})                                       |