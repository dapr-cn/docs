---
type: docs
title: "Kubernetes DNS 名称解析提供方规范"
linkTitle: "Kubernetes DNS"
description: 有关 Kubernetes DNS 名称解析组件的详细信息
---

## 配置格式

Kubernetes DNS 名称解析是在 Dapr 的 [Kubernetes 模式]({{< ref kubernetes >}}) 下自动配置的。 无需配置即可将 Kubernetes DNS 用作名称解析提供程序。

## 行为

该组件通过使用 Kubernetes 集群的 DNS 提供程序解析目标应用。 您可以在 [Kubernetes 文档](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)中了解更多信息。

## Spec 配置字段

不适用，因为 Kubernetes DNS 是由 Dapr 在 Kubernetes 模式下运行时配置的。

## 相关链接

- [服务调用构建块]({{< ref service-invocation >}})
- [Kubernetes DNS 文档](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)