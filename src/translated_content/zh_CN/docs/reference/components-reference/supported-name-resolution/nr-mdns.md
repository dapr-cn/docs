---
type: docs
title: "mDNS"
linkTitle: "mDNS"
description: mDNS名称解析组件的详细信息
---

## 配置格式

在Dapr的[自托管模式]({{< ref self-hosted >}})中，mDNS会自动配置。使用mDNS作为名称解析提供程序无需进行任何配置。

## 行为

该组件通过主机系统的mDNS服务来解析目标应用程序。您可以在[这里](https://en.wikipedia.org/wiki/Multicast_DNS)了解更多关于mDNS的信息。

### 故障排除

在某些云提供商的虚拟网络中，例如Microsoft Azure，mDNS可能不可用。请使用其他提供程序，例如[HashiCorp Consul]({{< ref setup-nr-consul.md >}})。

在某些企业管理的系统上，如果配置了网络过滤器或代理，macOS上的mDNS可能会被禁用。如果mDNS被禁用且您无法在本地使用服务调用，请与您的IT部门确认。

## 规格配置字段

不适用，因为在自托管模式下运行时，mDNS由Dapr自动配置。

## 相关链接

- [服务调用构建块]({{< ref service-invocation >}})
- [mDNS参考](https://en.wikipedia.org/wiki/Multicast_DNS)