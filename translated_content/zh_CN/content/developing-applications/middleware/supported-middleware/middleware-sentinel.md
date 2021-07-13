---
type: docs
title: "Sentinel 容错中间件组件"
linkTitle: "Sentinel"
weight: 7000
description: "使用 Sentinel 中间件来保证应用程序的可靠性和弹性"
---

[Sentinel](https://github.com/alibaba/sentinel-golang) 是一个功能强大的容错组件，它以“流量”为切入点，从流量控制、流量整形、集群限流、熔断降级和系统自适应保护等多个维度来保证微服务的可靠性和弹性。

Sentinel [HTTP 中间件]({{< ref middleware-concept.md >}}) 使 Dapr 能够使用 Sentinel 的强大能力来保护您的应用程序。 您可以参考 [Sentinel Wiki](https://github.com/alibaba/sentinel-golang/wiki) 来了解更多关于 Sentinel 的信息。

## 配置

根据下述定义，请求正文转换为大写字母：

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

## 元数据字段规范

| 字段                  | 详情                  | Example                                                                                     |
| ------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| appName             | 当前运行服务的名称           | `nodeapp`                                                                                   |
| logDir              | 日志目录路径              | `/var/tmp/sentinel`                                                                         |
| flowRules           | 哨兵流量控制规则 json 数组    | [流量控制规则](https://github.com/alibaba/sentinel-golang/blob/master/core/flow/rule.go)          |
| circuitBreakerRules | 哨兵断路器规则 json 数组     | [断路器规则](https://github.com/alibaba/sentinel-golang/blob/master/core/circuitbreaker/rule.go) |
| hotSpotParamRules   | 哨兵热点参数流控制规则 json 数组 | [热点规则](https://github.com/alibaba/sentinel-golang/blob/master/core/hotspot/rule.go)         |
| isolationRules      | 哨兵隔离规则 json 数组      | [隔离规则](https://github.com/alibaba/sentinel-golang/blob/master/core/isolation/rule.go)       |
| systemRules         | 哨兵系统规则 json 数组      | [系统规则](https://github.com/alibaba/sentinel-golang/blob/master/core/system/rule.go)          |

一旦达到上限，请求将返回 *HTTP Status code 429: Too Many Requests*。

特别注意每个规则定义中 `resource` 领域。 在 Dapr 中，它遵循以下格式：

```
POST/GET/PUT/DELETE:Dapr HTTP API Request Path
```

所有具体的 HTTP API 信息都可以从 \[Dapr API Reference\]({{< ref "api" >}}) 中找到. 在上述示例配置中， `resource` 字段设置为 **POST:/v1.0/invoke/nodeapp/method/neworder**。

## Dapr配置

要应用中间件，必须在[配置]({{< ref configuration-concept.md >}})中引用中间件。 参考[中间件管道]({{< ref "middleware-concept.md#customize-processing-pipeline">}})。

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
- [中间件概念]({{< ref middleware-concept.md >}})
- [Dapr配置]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
