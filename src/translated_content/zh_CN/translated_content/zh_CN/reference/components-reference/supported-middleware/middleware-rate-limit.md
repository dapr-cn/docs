---
type: docs
title: "限流"
linkTitle: "限流"
description: "Use rate limit middleware to limit requests per second"
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/middleware-rate-limit/
---

The rate limit [HTTP middleware]({{< ref middleware.md >}}) allows restricting the maximum number of allowed HTTP requests per second. Rate limiting can protect your application from Denial of Service (DoS) attacks. DoS attacks can be initiated by malicious 3rd parties but also by bugs in your software (a.k.a. a "friendly fire" DoS attack).

## Component format

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

| Field                  | 详情                                                                                                                                                        | 示例   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `maxRequestsPerSecond` | The maximum requests per second by remote IP.<br>The component looks at the `X-Forwarded-For` and `X-Real-IP` headers to determine the caller's IP. | `10` |

Once the limit is reached, the requests will fail with HTTP Status code *429: Too Many Requests*.

{{% alert title="Important" color="warning" %}}
The rate limit is enforced independently in each Dapr sidecar, and not cluster-wide.
{{% /alert %}}

Alternatively, the [max concurrency setting]({{< ref control-concurrency.md >}}) can be used to rate-limit applications and applies to all traffic, regardless of remote IP, protocol, or path.

## Dapr 配置

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

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

- [Control max concurrently]({{< ref control-concurrency.md >}})
- [中间件]({{< ref middleware.md >}})
- [Dapr 配置]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
