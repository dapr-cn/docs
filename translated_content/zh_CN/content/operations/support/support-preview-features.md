---
type: docs
title: "Preview features"
linkTitle: "Preview features"
weight: 4000
description: "List of current preview features"
---

Preview features in Dapr are considered experimental when they are first released. These preview features require explicit opt-in in order to be used. 选择加入在 Dapr 的配置中指定。 See [How-To: Enable preview features]({{<ref preview-features>}}) for information more information.


## 当前预览功能
| 特性                            | 说明                                                                                                                                          | Setting              | Documentation                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| **Actor reentrancy**          | Enables actors to be called multiple times in the same call chain allowing call backs between actors.                                       | `Actor.Reentrancy`   | [Actor reentrancy]({{<ref actor-reentrancy>}})                                            |
| **Partition actor reminders** | Allows actor reminders to be partitioned across multiple keys in the underlying statestore in order to improve scale and performance.       | `Actor.TypeMetadata` | [How-To: Partition Actor Reminders]({{< ref "howto-actors.md#partitioning-reminders" >}}) |
| **gRPC proxying**             | Enables calling endpoints using service invocation on gRPC services through Dapr via gRPC proxying, without requiring the use of Dapr SDKs. | `proxy.grpc`         | [How-To: Invoke services using gRPC]({{<ref howto-invoke-services-grpc>}})                |
| **State store encryption**    | Enables automatic client side encryption for state stores                                                                                   | `State.Encryption`   | [How-To: Encrypt application state]({{<ref howto-encrypt-state>}})                        |
| **Pub/Sub routing**           | Allow the use of expressions to route cloud events to different URIs/paths and event handlers in your application.                          | `PubSub.Routing`     | [指南：发布消息并订阅主题]({{<ref howto-route-messages>}})                                            |
| **ARM64 Mac Support**         | Dapr CLI, sidecar, and Dashboard are now natively compiled for ARM64 Macs, along with Dapr CLI installation via Homebrew.                   | N/A                  | [安装 Dapr CLI]({{<ref install-dapr-cli>}})                                                 |