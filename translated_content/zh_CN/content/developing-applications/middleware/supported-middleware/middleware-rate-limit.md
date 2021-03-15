---
type: docs
title: "速率限制"
linkTitle: "速率限制"
weight: 1000
description: "使用速率限制中间件来限制每秒的请求"
---

速率限制 [HTTP 中间件]({{< ref middleware-concept.md >}})允许限制每秒允许的 HTTP 请求的最大数量。 速率限制可以保护您的应用程序免受拒绝服务（DOS）攻击。 DOS攻击可以由恶意的第三方发起，也可以由你的软件中的错误发起（也就是 "友军 "DOS攻击）。

## 组件格式

根据下述定义，每秒的最高请求数定为10：
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: ratelimit
spec:
  type: middleware.http.ratelimit
  version: v1
  metadata:
  - name: maxRequestsPerSecond
    value: 10
```

## 元数据字段规范

| 字段                   | 详情                                                         | 示例   |
| -------------------- | ---------------------------------------------------------- | ---- |
| maxRequestsPerSecond | 按远程IP和路径每秒的最大请求。 需要考虑的是， **限制在每个 Dapr sidecar中独立执行，而不是群集** | `10` |

一旦达到上限，请求将返回 *HTTP Status code 429: Too Many Requests*。

另外，[最大并发量设置]({{< ref control-concurrency.md >}})可用于限制应用程序的速率，并适用于所有流量，无论远程IP或路径如何。

## Dapr 配置

要应用中间件，必须在[配置]({{< ref configuration-concept.md >}})中引用。 请参阅[中间件管道]({{< ref "middleware-concept.md#customize-processing-pipeline">}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: ratelimit
      type: middleware.http.ratelimit
```

## 相关链接

- [控制最大并发量]({{< ref control-concurrency.md >}})
- [中间件概念]({{< ref middleware-concept.md >}})
- [Dapr 配置]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
