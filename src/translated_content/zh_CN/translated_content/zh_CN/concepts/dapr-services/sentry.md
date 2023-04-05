---
type: docs
title: "Dapr Sentry 控制平面服务概述"
linkTitle: "Sentry"
description: "Dapr sentry 服务概述"
---

The Dapr Sentry service manages mTLS between services and acts as a certificate authority. It generates mTLS certificates and distributes them to any running sidecars. This allows sidecars to communicate with encrypted, mTLS traffic. For more information read the [sidecar-to-sidecar communication overview]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}).

## 自托管模式

Sentry 服务的 Docker 容器不会随 [`dapr init`]({{< ref self-hosted-with-docker.md >}}) 的运行而自动启动。 但可以按 [mutual TLS]({{< ref "mtls.md#self-hosted" >}}) 说明来设置以手动运行。


如果你以 [slim-init mode]({{< ref self-hosted-no-docker.md >}}) 模式运行，它也可以作为进程手动运行。

<img src="/images/security-mTLS-sentry-selfhosted.png" width=1000>

## Kubernetes 模式

The sentry service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. 有关在 Kubernetes 上运行 Dapr 的更多信息，请访问 [Kubernetes 托管页面]({{< ref kubernetes >}})。

<img src="/images/security-mTLS-sentry-kubernetes.png" width=1000>

## 深入阅读

- [Security overview]({{< ref security-concept.md >}})
- [自托管模式]({{< ref self-hosted-with-docker.md >}})
- [Kubernetes 模式]({{< ref kubernetes >}})
