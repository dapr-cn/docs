---
type: docs
title: "Dapr Placement 控制平面服务概述"
linkTitle: "Placement"
description: "Dapr Placement 服务概述"
---

Dapr Placement 服务用于计算和分发在 [自托管模式]({{< ref self-hosted >}}) 下或 [Kubernetes]({{< ref kubernetes >}})上运行 [Dapr Actor]({{< ref actors >}})位置的分布式哈希表。 This hash table maps actor IDs to pods or processes so a Dapr application can communicate with the actor.Anytime a Dapr application activates a Dapr actor, the placement updates the hash tables with the latest actor locations.

## 自托管模式

The placement service Docker container is started automatically as part of [`dapr init`]({{< ref self-hosted-with-docker.md >}}). It can also be run manually as a process if you are running in [slim-init mode]({{< ref self-hosted-no-docker.md >}}).

## Kubernetes mode

The placement service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).
