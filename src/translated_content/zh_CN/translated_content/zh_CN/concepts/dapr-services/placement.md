---
type: docs
title: "Dapr Placement 控制平面服务概述"
linkTitle: "Placement"
description: "Dapr Placement 服务概述"
---

The Dapr Placement service is used to calculate and distribute distributed hash tables for the location of [Dapr actors]({{< ref actors >}}) running in [self-hosted mode]({{< ref self-hosted >}}) or on [Kubernetes]({{< ref kubernetes >}}). This hash table maps actor IDs to pods or processes so a Dapr application can communicate with the actor.Anytime a Dapr application activates a Dapr actor, the placement updates the hash tables with the latest actor locations.

## 自托管模式

Placement 服务的 Docker 容器作为 [`dapr init`]({{< ref self-hosted-with-docker.md >}}) 的一部分自动运行。 如果你以 [slim-init mode]({{< ref self-hosted-no-docker.md >}}) 模式运行，它也可以作为进程手动运行。

## Kubernetes 模式

Placement 服务作为 `dapr init -k` 或 Dapr Helm charts 的一部分被部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。
