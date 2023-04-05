---
type: docs
title: "Dapr Quickstarts"
linkTitle: "Dapr 快速入门"
weight: 70
description: "试用Dapr的快速入门，这些示例代码旨帮助您快速上手Dapr"
no_list: true
---

Hit the ground running with our Dapr quickstarts, complete with code samples aimed to get you started quickly with Dapr.

{{% alert title="Note" color="primary" %}}
 我们正在积极努力增加我们的快速入门库。 同时，你可以通过我们的[教程]({{< ref "getting-started/tutorials/_index.md" >}})探索Dapr。

{{% /alert %}}

#### 在您开始之前

- [设置你的本地Dapr环境]({{< ref "install-dapr-cli.md" >}})。

## 快速入门

| Quickstarts                                                       | 说明                                                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [发布与订阅]({{< ref pubsub-quickstart.md >}})                         | Asynchronous communication between two services using messaging.                                             |
| [Service Invocation]({{< ref serviceinvocation-quickstart.md >}}) | Synchronous communication between two services using HTTP or gRPC.                                           |
| [状态管理]({{< ref statemanagement-quickstart.md >}})                 | Store a service's data as key/value pairs in supported state stores.                                         |
| [绑定]({{< ref bindings-quickstart.md >}})                          | Work with external systems using input bindings to respond to events and output bindings to call operations. |
| [Secrets Management]({{< ref secrets-quickstart.md >}})           | Securely fetch secrets.                                                                                      |
| [Configuration]({{< ref configuration-quickstart.md >}})          | Get configuration items and subscribe for configuration updates.                                             |
| [Resiliency]({{< ref resiliency >}})                              | Define and apply fault-tolerance policies to your Dapr API requests.                                         |
| [Workflow]({{< ref workflow-quickstart.md >}})                    | Orchestrate business workflow activities in long running, fault-tolerant, stateful applications.             |
