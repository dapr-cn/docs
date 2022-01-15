---
type: docs
title: "Dapr Placement 控制平面服务概述"
linkTitle: "放置"
description: "Dapr Placement 服务概述"
---

Dapr Placement 服务用于计算和分发在 [自托管模式]({{< ref self-hosted >}}) 下或 [Kubernetes]({{< ref kubernetes >}})上运行 [Dapr Actor]({{< ref actors >}})位置的分布式哈希表。 此哈希表将 Actor ID映射到 Pod 或进程，这样 Dapr 应用程序就可以与 actor 通信。 任何时候 Dapr 应用程序激活 Dapr actor, 放置服务将会更新散列表中最新的 actor 位置。

## 自托管模式

Placement 服务的 Docker 容器作为 [`dapr init`]({{< ref self-hosted-with-docker.md >}}) 的一部分自动运行。 如果你以 [slim-init mode]({{< ref self-hosted-no-docker.md >}}) 模式运行，它也可以作为进程手动运行。

## Kubernetes 模式

Placement 服务作为`dapr init -k`或Dapr Helm charts的一部分被部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。
