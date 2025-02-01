---
type: docs
title: "Sentinel 容错中间件组件"
linkTitle: "Sentinel"
description: "使用 Sentinel 中间件来保证应用程序的可靠性和弹性"
aliases:
- /zh-hans/developing-applications/middleware/supported-middleware/middleware-sentinel/
---

[Sentinel](https://github.com/alibaba/sentinel-golang) 是一个强大的容错组件，专注于流量管理，涵盖流量控制、流量整形、并发限制、熔断降级和自适应系统保护等多个领域，以确保微服务的可靠性和弹性。

Sentinel [HTTP 中间件]({{< ref middleware.md >}}) 使 Dapr 可以利用 Sentinel 的强大功能来保护您的应用程序。您可以参考 [Sentinel Wiki](https://github.com/alibaba/sentinel-golang/wiki) 以获取有关 Sentinel 的更多详细信息。

## 组件格式

在以下定义中，最大请求数被设定为每秒 10 个：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sentinel
spec:
  type: middleware.http.sentinel
  version: v1
  metadata:
  - name: appName
    value: "nodeapp"
  - name: logDir
    value: "/var/tmp"
  - name: flowRules
    value: >-
      [
        {
          "resource": "POST:/v1.0/invoke/nodeapp/method/neworder",
          "threshold": 10,
          "tokenCalculateStrategy": 0,
          "controlBehavior": 0
        }
      ]
```

## 规格元数据字段

| 字段 | 详情 | 示例 |
|-------|---------|---------|
| appName | 当前运行服务的名称 | `nodeapp`
| logDir | 日志目录路径 | `/var/tmp/sentinel`
| flowRules | Sentinel 流量控制规则的 JSON 数组 | [流量控制规则](https://github.com/alibaba/sentinel-golang/blob/master/core/flow/rule.go)
| circuitBreakerRules | Sentinel 熔断器规则的 JSON 数组 | [熔断器规则](https://github.com/alibaba/sentinel-golang/blob/master/core/circuitbreaker/rule.go)
| hotSpotParamRules | Sentinel 热点参数流量控制规则的 JSON 数组 | [热点规则](https://github.com/alibaba/sentinel-golang/blob/master/core/hotspot/rule.go)
| isolationRules | Sentinel 隔离规则的 JSON 数组 | [隔离规则](https://github.com/alibaba/sentinel-golang/blob/master/core/isolation/rule.go)
| systemRules | Sentinel 系统规则的 JSON 数组 | [系统规则](https://github.com/alibaba/sentinel-golang/blob/master/core/system/rule.go)

一旦达到限制，请求将返回 *HTTP 状态码 429: 请求过多*。

请特别注意每个规则定义中的 `resource` 字段。在 Dapr 中，它遵循以下格式：

```
POST/GET/PUT/DELETE:Dapr HTTP API 请求路径
```

所有具体的 HTTP API 信息可以在 [Dapr API 参考]{{< ref "api" >}} 中找到。在上述示例配置中，`resource` 字段被设置为 **POST:/v1.0/invoke/nodeapp/method/neworder**。

## Dapr 配置

要应用中间件，必须在 [configuration]({{< ref configuration-concept.md >}}) 中引用。请参阅 [中间件管道]({{< ref "middleware.md#customize-processing-pipeline">}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
spec:
  httpPipeline:
    handlers:
      - name: sentinel
        type: middleware.http.sentinel
```

## 相关链接

- [Sentinel Github](https://github.com/alibaba/sentinel-golang)
- [中间件]({{< ref middleware.md >}})
- [Dapr 配置]({{< ref configuration-concept.md >}})
- [配置概述]({{< ref configuration-overview.md >}})
