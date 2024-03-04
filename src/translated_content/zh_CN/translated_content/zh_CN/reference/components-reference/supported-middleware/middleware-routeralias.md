---
type: docs
title: "Router alias http request routing"
linkTitle: "Router Alias"
description: "Use router alias middleware to alias arbitrary http routes to Dapr endpoints"
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/middleware-routeralias/
---

The router alias HTTP [middleware]({{< ref middleware.md >}}) component allows you to convert arbitrary HTTP routes arriving into Dapr to valid Dapr API endpoints.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: routeralias 
spec:
  type: middleware.http.routeralias
  version: v1
  metadata:
    # String containing a JSON-encoded or YAML-encoded dictionary
    # Each key in the dictionary is the incoming path, and the value is the path it's converted to
    - name: "routes"
      value: |
        {
          "/mall/activity/info": "/v1.0/invoke/srv.default/method/mall/activity/info",
          "/hello/activity/{id}/info": "/v1.0/invoke/srv.default/method/hello/activity/info",
          "/hello/activity/{id}/user": "/v1.0/invoke/srv.default/method/hello/activity/user"
        }
```

In the example above, an incoming HTTP request for `/mall/activity/info?id=123` is transformed into `/v1.0/invoke/srv.default/method/mall/activity/info?id=123`.

# 元数据字段规范

| Field    | 详情                                                                                                                                                         | 示例                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `routes` | String containing a JSON-encoded or YAML-encoded dictionary. Each key in the dictionary is the incoming path, and the value is the path it's converted to. | See example above |

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
