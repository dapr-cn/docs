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

Dapr 允许通过链接一系列中间件组件来定义自定义处理管道。 请求在路由到用户代码之前经过所有已定义的中间件组件，然后在返回到客户机之前，按相反顺序经过已定义的中间件，如下图中所示。

<img src="/images/middleware.png" width=800>

## Configuring middleware pipelines

启动后， Dapr sidecar 会构建中间件处理管道。 默认情况下，管道由 [追踪中间件]({{< ref tracing-overview.md >}}) 和 CORS 中间件组成。 其他中间件，由 Dapr [ configuration ]({{< ref configuration-concept.md >}}) 配置，按照定义的顺序添加到管道中。 管道适用于所有 Dapr API 终结点，包括状态，发布/订阅，服务调用，绑定，安全性和其他。

The following configuration example defines a custom pipeline that uses a [OAuth 2.0 middleware]({{< ref middleware-oauth2.md >}}) and an [uppercase middleware component]({{< ref middleware-uppercase.md >}}). 在这种情况下，在转发到用户代码之前，所有请求都将通过 OAuth 2.0 协议进行授权，并转换为大写文本。

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

As with other building block components, middleware components are extensible and can be found in the [supported Middleware reference]({{< ref supported-middleware >}}) and in the [components-contrib repo](https://github.com/dapr/components-contrib/tree/master/middleware/http).

{{< button page="supported-middleware" text="See all middleware components">}}

## 编写自定义中间件

Dapr 使用 [FastHTTP](https://github.com/valyala/fasthttp) 来实现其的 HTTP 服务器。 因此，您的 HTTP 中间件也需要编写为 FastHTTP handler。 Your middleware needs to implement a middleware interface, which defines a **GetHandler** method that returns  **fasthttp.RequestHandler** and **error**:

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

在接受了 components-contrib 变更后，针对 [Dapr 运行时仓库](https://github.com/dapr/dapr) 提交另一个 pull 请求，以注册新的中间件类型。 您需要修改[runtime.WithHTTPMiddleware](https://github.com/dapr/dapr/blob/f4d50b1369e416a8f7b93e3e226c4360307d1313/cmd/daprd/main.go#L394-L424)</strong>方法中的**[cmd/daprd/main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go)方法，将您的中间件注册到Dapr的运行时。

## 相关链接

* [组件schema]({{< ref component-schema.md >}})
* [配置概览]({{< ref configuration-overview.md >}})
* [中间件快速入门](https://github.com/dapr/quickstarts/tree/master/middleware)
