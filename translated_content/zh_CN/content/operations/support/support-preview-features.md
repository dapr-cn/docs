---
type: docs
title: "Preview features"
linkTitle: "Preview features"
weight: 4000
description: "List of current preview features"
---

Preview features in Dapr are considered experimental when they are first released.

Runtime preview features require explicit opt-in in order to be used. The runtime opt-in is specified in a preview setting feature in Dapr's application configuration. See [How-To: Enable preview features]({{<ref preview-features>}}) for more information.

For CLI there is no explicit opt-in, just the version that this was first made available.


## 当前预览功能
| 特性                                                    | 说明                                                                                                                                                                                                                                                                                | Setting                                  | Documentation                                                                             | Version introduced |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------ |
| **Partition actor reminders**                         | Allows actor reminders to be partitioned across multiple keys in the underlying statestore in order to improve scale and performance.                                                                                                                                             | `Actor.TypeMetadata`                     | [How-To: Partition Actor Reminders]({{< ref "howto-actors.md#partitioning-reminders" >}}) | v1.4               |
| **Pub/Sub routing**                                   | Allow the use of expressions to route cloud events to different URIs/paths and event handlers in your application.                                                                                                                                                                | `PubSub.Routing`                         | [指南：发布消息并订阅主题]({{<ref howto-route-messages>}})                                            | v1.4               |
| **ARM64 Mac 支持**                                      | Dapr CLI、sidecar 和 Dashboard 现在已针对 ARM64 Mac 进行了本地编译，并通过 Homebrew 进行了 Dapr CLI 安装。                                                                                                                                                                                                | N/A                                      | [安装 Dapr CLI]({{<ref install-dapr-cli>}})                                                 | v1.5               |
| **--image-registry** flag with Dapr CLI               | In self hosted mode you can set this flag to specify any private registry to pull the container images required to install Dapr                                                                                                                                                   | N/A                                      | [init CLI 命令参考]({{<ref "dapr-init.md#self-hosted-environment" >}})                        | v1.7               |
| **Resiliency**                                        | Allows configuring of fine-grained policies for retries, timeouts and circuitbreaking.                                                                                                                                                                                            | `Resiliency`                             | [Configure Resiliency Policies]({{<ref "resiliency-overview">}})                          | v1.7               |
| **Service invocation without default `content-type`** | When enabled removes the default service invocation content-type header value `application/json` when no content-type is provided. This will become the default behavior in release v1.9.0. This requires you to explictly set content-type headers where required for your apps. | `ServiceInvocation.NoDefaultContentType` | [Service Invocation]({{<ref "service_invocation_api.md#request-contents" >}})             | v1.7               |

