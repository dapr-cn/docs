---
type: docs
title: "Dapr Sentry 控制平面服务概述"
linkTitle: "Sentry"
description: "Dapr sentry 服务概述"
---

Dapr Sentry 服务管理服务之间的mTLS并作为证书颁发机构。 它生成 mTLS 证书，并将其分发给任何正在运行的Sidecar。 这允许 Sidecar 之间进行加密的 mTLS 流量通信。 更多信息查看 [sidecar-to-sidecar communication overview]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}).

## 自托管模式

Sentry 服务的 Docker 容器作为 [`dapr init`]({{< ref self-hosted-with-docker.md >}}) 的一部分自动运行。 如果你以 [slim-init mode]({{< ref self-hosted-no-docker.md >}}) 模式运行，它也可以作为进程手动运行。

<img src="/images/security-mTLS-sentry-selfhosted.png" width=1000>

## Kubernetes 模式

Sentry服务作为`dapr init -k`或Dapr Helm charts的一部分被部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。

<img src="/images/security-mTLS-sentry-kubernetes.png" width=1000>

## 深入阅读

- [安全性概述]({{< ref security-concept.md >}})
- [自托管模式]({{< ref self-hosted-with-docker.md >}})
- [Kubernetes 模式]({{< ref kubernetes >}})