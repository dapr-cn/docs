---
type: docs
title: "HTTP 路由别名"
linkTitle: "路由别名"
description: "通过路由别名中间件将任意 HTTP 路由映射为 Dapr 端点"
aliases:
- /zh-hans/developing-applications/middleware/supported-middleware/middleware-routeralias/
---

HTTP 路由别名 [中间件]({{< ref middleware.md >}}) 组件允许您将进入 Dapr 的任意 HTTP 路由映射为有效的 Dapr API 端点。

## 组件格式

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: routeralias 
spec:
  type: middleware.http.routeralias
  version: v1
  metadata:
    # 包含 JSON 或 YAML 格式的字典字符串
    # 字典中的每个键是传入路径，值是映射后的路径
    - name: "routes"
      value: |
        {
          "/mall/activity/info": "/v1.0/invoke/srv.default/method/mall/activity/info",
          "/hello/activity/{id}/info": "/v1.0/invoke/srv.default/method/hello/activity/info",
          "/hello/activity/{id}/user": "/v1.0/invoke/srv.default/method/hello/activity/user"
        }
```

在上面的示例中，传入的 HTTP 请求 `/mall/activity/info?id=123` 会被映射为 `/v1.0/invoke/srv.default/method/mall/activity/info?id=123`。

# 规格元数据字段

| 字段 | 详情 | 示例 |
|-------|---------|---------|
| `routes` | 包含 JSON 或 YAML 格式的字典字符串。字典中的每个键是传入路径，值是映射后的路径。 | 见上例 |

## Dapr 配置

要使用中间件，必须在 [配置]({{< ref configuration-concept.md >}}) 中进行引用。参见 [中间件管道]({{< ref "middleware.md#customize-processing-pipeline">}})。

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
