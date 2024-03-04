---
type: docs
title: "Dapr Sentry 控制平面服务概述"
linkTitle: "Sentry"
description: "Dapr sentry 服务概述"
---

Dapr Sentry 服务管理服务间的 mTLS，并充当证书颁发机构。 它能生成 mTLS 证书，并将其分发到任何运行中的辅助程序。 这允许 sidecar 之间进行加密的 mTLS 流量通信。 有关更多信息，请阅读 [ Sidecar 间通信概述]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}})。

## 自托管模式

Sentry 服务的 Docker 容器不会随 [`dapr init`]({{< ref self-hosted-with-docker.md >}}) 的运行而自动启动。 但可以按 [mutual TLS]({{< ref "mtls.md#self-hosted" >}}) 说明来设置以手动运行。


如果你以 [slim-init mode]({{< ref self-hosted-no-docker.md >}}) 模式运行，它也可以作为进程手动运行。

<img src="/images/security-mTLS-sentry-selfhosted.png" width=1000>

## Kubernetes 模式

sentry 服务作为 `dapr init -k`的一部分部署，或通过 Dapr Helm chart 部署。 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。

<img src="/images/security-mTLS-sentry-kubernetes.png" width=1000>

## 深入阅读

- [安全概述]({{< ref security-concept.md >}})
- [自托管模式]({{< ref self-hosted-with-docker.md >}})
- [Kubernetes 模式]({{< ref kubernetes >}})
