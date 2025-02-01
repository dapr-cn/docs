---
type: docs
title: "如何：编写中间件组件"
linkTitle: "中间件组件"
weight: 200
description: "学习如何开发中间件组件"
aliases:
  - /zh-hans/developing-applications/middleware/middleware-overview/
  - /zh-hans/concepts/middleware-concept/
---

Dapr 允许通过将一系列中间件组件链接在一起来定义自定义处理管道。在本指南中，您将学习如何创建一个中间件组件。要了解如何配置已有的中间件组件，请参阅[配置中间件组件]({{< ref middleware.md >}})

## 编写自定义 HTTP 中间件

Dapr 中的 HTTP 中间件是对标准 Go [net/http](https://pkg.go.dev/net/http) 处理函数的封装。

您的中间件需要实现一个中间件接口，该接口定义了一个 **GetHandler** 方法，该方法返回一个 [**http.Handler**](https://pkg.go.dev/net/http#Handler) 回调函数和一个 **error**：

```go
type Middleware interface {
  GetHandler(metadata middleware.Metadata) (func(next http.Handler) http.Handler, error)
}
```

处理器接收一个 `next` 回调函数，该函数应被调用以继续处理请求。

您的处理器实现可以包括入站逻辑、出站逻辑，或同时包括两者：

```go

func (m *customMiddleware) GetHandler(metadata middleware.Metadata) (func(next http.Handler) http.Handler, error) {
  var err error
  return func(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      // 入站逻辑
      // ...

      // 调用下一个处理器
      next.ServeHTTP(w, r)

      // 出站逻辑
      // ...
    }
  }, err
}
```

## 相关链接

- [组件模式]({{< ref component-schema.md >}})
- [配置概述]({{< ref configuration-overview.md >}})
- [API 中间件示例](https://github.com/dapr/samples/tree/master/middleware-oauth-google)
