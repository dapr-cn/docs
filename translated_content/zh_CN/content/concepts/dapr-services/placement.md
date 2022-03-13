---
type: docs
title: "Dapr Placement 控制平面服务概述"
linkTitle: "Placement"
description: "Dapr Placement 服务概述"
---

Dapr Placement 服务用于计算和分发在 [自托管模式]({{< ref self-hosted >}}) 下或 [Kubernetes]({{< ref kubernetes >}})上运行 [Dapr Actor]({{< ref actors >}})位置的分布式哈希表。 这个哈希表将 actor ID 映射到 pod 或进程，这样 Dapr 应用程序就可以与 actor 进行通信。任何时候Dapr应用程序激活一个Dapr actor，placement 服务就会用最新的 actor 位置更新哈希表。

## 自托管模式

Placement 服务的 Docker 容器作为 [`dapr init`]({{< ref self-hosted-with-docker.md >}}) 的一部分自动运行。 如果你以 [slim-init mode]({{< ref self-hosted-no-docker.md >}}) 模式运行，它也可以作为进程手动运行。

## Kubernetes 模式

Placement 服务作为 `dapr init -k` 或 Dapr Helm charts 的一部分被部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 自托管页面]({{< ref kubernetes >}})。
