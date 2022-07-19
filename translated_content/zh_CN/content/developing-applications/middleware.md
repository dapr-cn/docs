---
type: docs
title: "中间件"
linkTitle: "中间件"
weight: 50
description: "通过添加中间件组件自定义处理管道"
aliases:
  - /zh-hans/developing-applications/middleware/middleware-overview/
  - /zh-hans/concepts/middleware-concept/
---

Dapr 允许通过链接一系列中间件组件来定义自定义处理管道。 请求在路由到用户代码之前经过所有已定义的中间件组件，然后在返回到客户端之前，按相反顺序经过已定义的中间件，如下图中所示。

<img src="/images/middleware.png" width=800>

## 配置中间件管道

启动后， Dapr sidecar 会构建中间件处理管道。 默认情况下，管道由 [追踪中间件]({{< ref tracing-overview.md >}}) 和 CORS 中间件组成。 其他中间件，由 Dapr [ configuration ]({{< ref configuration-concept.md >}}) 配置，按照定义的顺序添加到管道中。 管道适用于所有 Dapr API 终结点，包括状态，发布/订阅，服务调用，绑定，安全性和其他。

以下配置示例定义了使用 [OAuth 2.0 中间件]({{< ref middleware-oauth2.md >}})和[大写中间件组件]({{< ref middleware-uppercase.md >}})的自定义管道。 在这种情况下，在转发到用户代码之前，所有请求都将通过 OAuth 2.0 协议进行授权，并转换为大写文本。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pipeline
  namespace: default
spec:
  httpPipeline:
    handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
```

与其他构建块组件一样，中间件组件是可扩展的，可以在[支持的中间件参考文档]({{< ref supported-middleware >}})和 [components-contrib 仓库](https://github.com/dapr/components-contrib/tree/master/middleware/http)中找到。

{{< button page="supported-middleware" text="See all middleware components">}}

## 编写自定义中间件

Dapr 使用 [FastHTTP](https://github.com/valyala/fasthttp) 来实现其的 HTTP 服务器。 因此，您的 HTTP 中间件也需要编写为 FastHTTP handler。 您的中间件需要实现 Middleware 接口，该接口定义 **GetHandler** 方法，该方法返回 **fasthttp.RequestHandler** 和 **error**:

```go
type Middleware interface {
  GetHandler(metadata Metadata) (func(h fasthttp.RequestHandler) fasthttp.RequestHandler, error)
}
```

您的 handler 实现可以包含任何入站（inbound）逻辑和出站（outbound）逻辑或两者兼有：

```go

func (m *customMiddleware) GetHandler(metadata Metadata) (func(fasthttp.RequestHandler) fasthttp.RequestHandler, error) {
  var err error
  return func(h fasthttp.RequestHandler) fasthttp.RequestHandler {
    return func(ctx *fasthttp.RequestCtx) {
      // inboud logic
      h(ctx)  // call the downstream handler
      // outbound logic
    }
  }, err
}
```

## 添加新的中间件组件

您的中间件组件可以贡献到 [components-contrib 仓库](https://github.com/dapr/components-contrib/tree/master/middleware)。

在接受了 components-contrib 变更后，针对 [Dapr 运行时仓库](https://github.com/dapr/dapr) 提交另一个 pull 请求，以注册新的中间件类型。 您需要修改 [runtime.WithHTTPMiddleware](https://github.com/dapr/dapr/blob/f4d50b1369e416a8f7b93e3e226c4360307d1313/cmd/daprd/main.go#L394-L424)</strong>方法中的**[cmd/daprd/main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go) 方法，将您的中间件注册到 Dapr 的运行时。

## 相关链接

* [组件 schema]({{< ref component-schema.md >}})
* [配置概览]({{< ref configuration-overview.md >}})
* [中间件示例](https://github.com/dapr/samples/tree/master/middleware-oauth-google)
