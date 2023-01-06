---
type: docs
title: "预览功能"
linkTitle: "预览功能"
weight: 4000
description: "当前预览功能列表"
---

Dapr 中的预览功能在首次发布时被视为实验性功能。

Runtime preview features require explicit opt-in in order to be used. The runtime opt-in is specified in a preview setting feature in Dapr's application configuration. See [How-To: Enable preview features]({{<ref preview-features>}}) for more information.

For CLI there is no explicit opt-in, just the version that this was first made available.


## 当前预览功能
| 特性                                                    | 说明                                                                                                                                                                                                                                                                                | 设置                                       | 文档                                                                              | Version introduced |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- | ------------------ |
| **分区 actor 提醒**                                       | 允许在基础状态存储中的多个键之间对 actor reminders 进行分区，以提高规模和性能。                                                                                                                                                                                                                                  | `Actor.TypeMetadata`                     | [操作方法：Actor Reminders 分区]({{< ref "howto-actors.md#partitioning-reminders" >}}) | v1.4               |
| **发布/订阅路由**                                           | 允许使用表达式将 Cloud Events 路由到应用程序中的不同 URI/路径和事件处理程序。                                                                                                                                                                                                                                  | `PubSub.Routing`                         | [指南：发布消息并订阅主题]({{<ref howto-route-messages>}})                                  | v1.4               |
| **ARM64 Mac 支持**                                      | Dapr CLI、sidecar 和 Dashboard 现在已针对 ARM64 Mac 进行了本地编译，并通过 Homebrew 进行了 Dapr CLI 安装。                                                                                                                                                                                                | N/A                                      | [安装 Dapr CLI]({{<ref install-dapr-cli>}})                                       | v1.5               |
| **--image-registry** flag with Dapr CLI               | In self hosted mode you can set this flag to specify any private registry to pull the container images required to install Dapr                                                                                                                                                   | N/A                                      | [init CLI 命令参考]({{<ref "dapr-init.md#self-hosted-environment" >}})              | v1.7               |
| **Resiliency**                                        | Allows configuring of fine-grained policies for retries, timeouts and circuitbreaking.                                                                                                                                                                                            | `Resiliency`                             | [Configure Resiliency Policies]({{<ref "resiliency-overview">}})                | v1.7               |
| **Service invocation without default `content-type`** | When enabled removes the default service invocation content-type header value `application/json` when no content-type is provided. This will become the default behavior in release v1.9.0. This requires you to explictly set content-type headers where required for your apps. | `ServiceInvocation.NoDefaultContentType` | [服务调用]({{<ref "service_invocation_api.md#request-contents" >}})                 | v1.7               |

