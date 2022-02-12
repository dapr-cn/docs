---
type: docs
title: "Preview features"
linkTitle: "Preview features"
weight: 4000
description: "List of current preview features"
---

Dapr 中的预览功能在首次发布时被视为实验性功能。 这些预览功能需要显式选择加入才能使用。 选择加入在 Dapr 的配置中指定。 有关详细信息，请参阅 [操作方法：启用预览功能]({{<ref preview-features>}}) 。


## 当前预览功能
| 特性                            | 说明                                                                                 | Setting              | Documentation                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| **Actor reentrancy**          | 使 Actors 能够在同一调用链中被多次调用，从而允许在 Actors 之间回调。                                         | `Actor.Reentrancy`   | [Actor reentrancy]({{<ref actor-reentrancy>}})                                            |
| **Partition actor reminders** | 允许在基础状态存储中的多个键之间对 actor reminders 进行分区，以提高规模和性能。                                   | `Actor.TypeMetadata` | [How-To: Partition Actor Reminders]({{< ref "howto-actors.md#partitioning-reminders" >}}) |
| **gRPC proxying**             | 允许通过 gRPC 代理通过 Dapr 在 gRPC 服务上使用服务调用来调用终结点，而无需使用 Dapr SDK。                         | `proxy.grpc`         | [How-To: Invoke services using gRPC]({{<ref howto-invoke-services-grpc>}})                |
| **State store encryption**    | 为状态存储启用自动客户端加密                                                                     | `State.Encryption`   | [操作方法：加密应用程序 state]({{<ref howto-encrypt-state>}})                                        |
| **Pub/Sub routing**           | 允许使用表达式将 Cloud Events 路由到应用程序中的不同 URI/路径和事件处理程序。                                   | `PubSub.Routing`     | [指南：发布消息并订阅主题]({{<ref howto-route-messages>}})                                            |
| **ARM64 Mac Support**         | Dapr CLI、sidecar 和 Dashboard 现在已针对 ARM64 Mac 进行了本机编译，并通过 Homebrew 进行了 Dapr CLI 安装。 | N/A                  | [安装 Dapr CLI]({{<ref install-dapr-cli>}})                                                 |