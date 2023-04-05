---
type: docs
title: "mDNS 名称解析提供程序规范"
linkTitle: "mDNS"
description: 有关 mDNS 名称解析组件的详细信息
---

## Configuration format

Multicast DNS (mDNS) is configured automatically in [self-hosted mode]({{< ref self-hosted >}}) by Dapr. There is no configuration needed to use mDNS as your name resolution provider.

## 行为

该组件使用主机系统的 mDNS 服务解析目标应用。 您可以在[此处](https://en.wikipedia.org/wiki/Multicast_DNS)了解有关mDNS 的更多信息。

### 疑难解答

在某些云提供商虚拟网络（如 Microsoft Azure）中，mDNS 不可用。 改用替代提供商，例如 [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) 。

在某些企业托管系统上，如果配置了网络过滤器/代理，则可能会在 macOS 上禁用 mDNS。 请与您的 IT 部门联系，了解 mDNS 是否已禁用，并且您无法在本地使用服务调用。

## Spec 配置字段

不适用，因为 mDNS 是由 Dapr 在自承载模式下运行时配置的。

## 相关链接

- [服务调用构建块]({{< ref service-invocation >}})
- [mDNS reference](https://en.wikipedia.org/wiki/Multicast_DNS)