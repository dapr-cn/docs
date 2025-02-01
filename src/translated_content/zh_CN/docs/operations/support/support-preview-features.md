---
type: docs
title: "预览功能"
linkTitle: "预览功能"
weight: 4000
description: "当前预览功能列表"
---

Dapr 的预览功能在首次发布时被视为实验性功能。

要使用运行时的预览功能，必须在 Dapr 的应用程序配置中通过预览设置功能进行显式选择加入。有关更多信息，请参阅[如何启用预览功能]({{<ref preview-features>}})。

对于 CLI，不需要显式选择加入，只需使用首次提供该功能的版本即可。

## 当前预览功能

| 功能 | 描述 | 设置 | 文档 | 引入版本 |
| --- | --- | --- | --- | --- |
| **可插拔组件** | 允许创建基于 gRPC 的自托管组件，这些组件可以用任何支持 gRPC 的语言编写。支持以下组件 API：状态存储、pub/sub、bindings | N/A | [可插拔组件概念]({{<ref "components-concept#pluggable-components" >}})| v1.9  |
| **Kubernetes 的多应用运行** | 从单个配置文件配置多个 Dapr 应用程序，并在 Kubernetes 上通过单个命令运行 | `dapr run -k -f` | [多应用运行]({{< ref multi-app-dapr-run.md >}}) | v1.12 |
| **工作流** | 将工作流作为代码编写，以在应用程序中自动化和编排任务，如消息传递、状态管理和故障处理 | N/A | [工作流概念]({{< ref "components-concept#workflows" >}})| v1.10  |
| **加密** | 加密或解密数据而无需管理密钥 | N/A | [加密概念]({{< ref "components-concept#cryptography" >}})| v1.11  |
| **actor 状态 TTL** | 允许 actor 将记录保存到状态存储中，并设置生存时间 (TTL) 以自动清理旧数据。在当前实现中，带有 TTL 的 actor 状态可能无法被客户端正确反映。请阅读 [actor 状态事务]({{< ref actors_api.md >}}) 以获取更多信息。 | `ActorStateTTL` | [actor 状态事务]({{< ref actors_api.md >}}) | v1.11  |
| **组件热重载** | 允许 Dapr 加载的组件进行“热重载”。当在 Kubernetes 中或在自托管模式下更新文件中的组件规范时，组件会被重新加载。对 actor 状态存储和工作流后端的更改将被忽略。 | `HotReload`| [热重载]({{< ref components-concept.md >}}) | v1.13  |
| **订阅热重载** | 允许声明性订阅进行“热重载”。当在 Kubernetes 中更新订阅时，或在自托管模式下更新文件中的订阅时，订阅会被重新加载。重载时不会影响正在进行的消息。 | `HotReload`| [热重载]({{< ref "subscription-methods.md#declarative-subscriptions" >}}) | v1.14  |
| **调度器 actor 提醒** | 调度器 actor 提醒是存储在调度器控制平面服务中的 actor 提醒，与存储在放置控制平面服务中的 actor 提醒系统不同。`SchedulerReminders` 预览功能默认设置为 `true`，但您可以通过将其设置为 `false` 来禁用调度器 actor 提醒。 | `SchedulerReminders`| [调度器 actor 提醒]({{< ref "scheduler.md#actor-reminders" >}}) | v1.14  |
