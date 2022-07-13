---
type: docs
title: "mDNS name resolution provider spec"
linkTitle: "mDNS"
description: Detailed information on the mDNS name resolution component
---

## 配置格式

Multicast DNS (mDNS) is configured automatically in [self-hosted mode]({{< ref self-hosted >}}) by Dapr. There is no configuration needed to use mDNS as your name resolution provider.

## 行为

The component resolves target apps by using the host system's mDNS service. You can learn more about mDNS [here](https://en.wikipedia.org/wiki/Multicast_DNS).

### 疑难解答

In some cloud provider virtual networks, such as Microsoft Azure, mDNS is not available. Use an alternate provider such as [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) instead.

On some enterprise-managed systems, mDNS may be disabled on macOS if a network filter/proxy is configured. Check with your IT department if mDNS is disabled and you are unable to use service invocation locally.

## Spec 配置字段

Not applicable, as mDNS is configured by Dapr when running in self-hosted mode.

## 相关链接

- [服务调用构建块]({{< ref service-invocation >}})
- [mDNS reference](https://en.wikipedia.org/wiki/Multicast_DNS)