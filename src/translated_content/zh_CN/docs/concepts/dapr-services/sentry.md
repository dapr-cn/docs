---
type: docs
title: "Dapr Sentry 控制平面服务概述"
linkTitle: "Sentry"
description: "Dapr Sentry 服务概述"
---

Dapr Sentry 服务负责管理服务之间的 mTLS，并作为证书颁发机构。它生成 mTLS 证书并将其分发给所有正在运行的 sidecar。这样，sidecar 可以通过加密的 mTLS 流量进行通信。有关更多信息，请阅读 [sidecar-to-sidecar 通信概述]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}})。

## 自托管模式

Sentry 服务的 Docker 容器不会作为 [`dapr init`]({{< ref self-hosted-with-docker.md >}}) 的一部分自动启动。不过，您可以按照 [mutual TLS]({{< ref "mtls.md#self-hosted" >}}) 的设置说明手动启动。

如果您在 [slim-init 模式]({{< ref self-hosted-no-docker.md >}}) 下运行，也可以手动以进程的方式启动。

<img src="/images/security-mTLS-sentry-selfhosted.png" width=1000>

## Kubernetes 模式

Sentry 服务可以通过 `dapr init -k` 或使用 Dapr Helm Chart 部署。有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。

<img src="/images/security-mTLS-sentry-kubernetes.png" width=1000>

## 进一步阅读

- [安全概述]({{< ref security-concept.md >}})
- [自托管模式]({{< ref self-hosted-with-docker.md >}})
- [Kubernetes 模式]({{< ref kubernetes >}})
