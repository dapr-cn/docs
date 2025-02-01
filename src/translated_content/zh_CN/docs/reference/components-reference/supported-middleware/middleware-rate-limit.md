---
type: docs
title: "速率限制"
linkTitle: "速率限制"
description: "通过速率限制中间件控制每秒请求数量"
aliases:
- /zh-hans/developing-applications/middleware/supported-middleware/middleware-rate-limit/
---

HTTP中间件速率限制[HTTP中间件]({{< ref middleware.md >}})允许您限制每秒HTTP请求的最大数量。通过速率限制，您可以保护应用程序免受拒绝服务（DoS）攻击的影响。DoS攻击可能由恶意第三方发起，也可能由于软件错误（即所谓的“友军火力”DoS攻击）而发生。

## 组件格式

在以下定义中，每秒最大请求数被设置为10：

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

## 规格元数据字段

| 字段 | 详情 | 示例 |
|-------|---------|---------|
| `maxRequestsPerSecond` | 每秒允许的最大请求数，基于远程IP。<br>组件通过`X-Forwarded-For`和`X-Real-IP`头来识别请求者的IP。 | `10`

一旦达到限制，请求将返回HTTP状态码*429: Too Many Requests*。

{{% alert title="重要" color="warning" %}}
速率限制是在每个Dapr sidecar中独立执行的，而不是在整个集群范围内统一执行。
{{% /alert %}}

此外，您还可以使用[最大并发设置]({{< ref control-concurrency.md >}})来限制应用程序的请求处理能力，这种方法适用于所有流量，不论远程IP、协议或路径。

## Dapr配置

要应用中间件，必须在[配置]({{< ref configuration-concept.md >}})中进行引用。请参阅[中间件管道]({{< ref "middleware.md#customize-processing-pipeline">}})。

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

- [控制最大并发]({{< ref control-concurrency.md >}})
- [中间件]({{< ref middleware.md >}})
- [Dapr配置]({{< ref configuration-concept.md >}})
- [配置概述]({{< ref configuration-overview.md >}})
