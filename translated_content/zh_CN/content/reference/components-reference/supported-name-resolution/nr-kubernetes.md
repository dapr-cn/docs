---
type: docs
title: "Kubernetes DNS name resolution provider spec"
linkTitle: "Kubernetes DNS"
description: Detailed information on the Kubernetes DNS name resolution component
---

## 配置格式

Kubernetes DNS name resolution is configured automatically in [Kubernetes mode]({{< ref kubernetes >}}) by Dapr. There is no configuration needed to use Kubernetes DNS as your name resolution provider.

## 行为

The component resolves target apps by using the Kubernetes cluster's DNS provider. You can learn more in the [Kubernetes docs](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/).

## Spec 配置字段

Not applicable, as Kubernetes DNS is configured by Dapr when running in Kubernetes mode.

## 相关链接

- [服务调用构建块]({{< ref service-invocation >}})
- [Kubernetes DNS docs](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)