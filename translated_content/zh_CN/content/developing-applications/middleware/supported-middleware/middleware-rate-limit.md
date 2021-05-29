---
type: docs
title: "速率限制"
linkTitle: "速率限制"
weight: 1000
description: "使用速率限制中间件来限制每秒的请求"
---

The rate limit [HTTP middleware]({{< ref middleware-concept.md >}}) allows restricting the maximum number of allowed HTTP requests per second. 速率限制可以保护您的应用程序免受拒绝服务（DOS）攻击。 DOS攻击可以由恶意的第三方发起，也可以由你的软件中的错误发起（也就是 "友军 "DOS攻击）。

## 配置

根据下述定义，请求正文转换为大写字母：
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

| 字段                   | 详情                                                         | Example |
| -------------------- | ---------------------------------------------------------- | ------- |
| maxRequestsPerSecond | 按远程IP和路径每秒的最大请求。 需要考虑的是， **限制在每个 Dapr sidecar中独立执行，而不是群集** | `10`    |

一旦达到上限，请求将返回 *HTTP Status code 429: Too Many Requests*。

Alternatively, the [max concurrency setting]({{< ref control-concurrency.md >}}) can be used to rate limit applications and applies to all traffic regardless of remote IP or path.

## Dapr配置

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware-concept.md#customize-processing-pipeline">}}).

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
- [Dapr配置]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
