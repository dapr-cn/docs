---
type: docs
title: "Router alias http request routing"
linkTitle: "Router Alias"
description: "Use router alias middleware to alias arbitrary http routes to Dapr endpoints"
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/middleware-routeralias/
---

The router alias HTTP [middleware]({{< ref middleware.md >}}) component allows you to convert arbitrary HTTP routes arriving to Dapr to valid Dapr API endpoints.

## Component format

The router alias middleware metadata contains name/value pairs, where the name describes the HTTP route to expect, and the value describes the corresponding Dapr API the request should be sent to.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: routeralias 
spec:
  type: middleware.http.routeralias
  version: v1
  metadata:
  - name: "/v1.0/mall/activity/info"
    value: "/v1.0/invoke/srv.default/method/mall/activity/info"
  - name: "/v1.0/hello/activity/{id}/info"
    value: "/v1.0/invoke/srv.default/method/hello/activity/info"
  - name: "/v1.0/hello/activity/{id}/user"
    value: "/v1.0/invoke/srv.default/method/hello/activity/user"
```

示例︰

An incoming HTTP request for `/v1.0/mall/activity/info?id=123` is transformed into `/v1.0/invoke/srv.default/method/mall/activity/info?id=123`.

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
    - name: routeralias 
      type: middleware.http.routeralias
```

## 相关链接

- [中间件]({{< ref middleware.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
