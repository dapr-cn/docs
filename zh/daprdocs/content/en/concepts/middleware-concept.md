---
type: docs
title: "中间件管道"
linkTitle: "中间件"
weight: 400
description: "链式中间件组件的自定义处理管道"
---

Dapr 允许通过链接一系列中间件组件来定义自定义处理管道。 请求在路由到用户代码之前经过所有已定义的中间件组件，然后在返回到客户机之前，按相反顺序经过已定义的中间件，如下图中所示。

<img src="/images/middleware.png" width=400>

## 自定义处理管道

启动后， Dapr sidecar 会构建中间件处理管道。 默认情况下，管道由 [跟踪中间件]({{< ref tracing.md >}}) 和 CORS 中间组成。 其他中间件，由 Dapr [ configuration ]({{< ref configuration-concept.md >}}) 配置，按照定义的顺序添加到管道中。 管道适用于所有 Dapr API 端点，包括状态，发布/订阅，服务调用，绑定，安全和其他。

> **注意：** Dapr 提供 **middleware.http.uppercase** 预注册组件，该组件将请求正文中的所有文本更改为大写。 您可以使用它来测试/验证自定义管道是否已就绪。

以下配置示例定义了使用 [OAuth 2.0 中间件]({{< ref oauth.md >}}) 和大写中间件组件的自定义管道。 在这种情况下，在转发到用户代码之前，所有请求都将通过 OAuth 2.0 协议进行授权，并转换为大写文本。

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

## 编写自定义中间件

Dapr 使用 [FastHTTP](https://github.com/valyala/fasthttp) 实现其 HTTP 服务器。 因此，您的 HTTP 中间件也需要编写为 FastHTTP handler。 中间件需要实现 middleware 接口，该接口定义 **GetHandler** 方法，该方法返回 **fasthttp.RequestHandler**:

```go
type Middleware interface {
  GetHandler(metadata Metadata) (func(h fasthttp.RequestHandler) fasthttp.RequestHandler, error)
}
```

处理程序实现可以包括任何入站（inbound）逻辑、出站（outbound）逻辑或两者兼有：

```go
func GetHandler(metadata Metadata) fasthttp.RequestHandler {
  return func(h fasthttp.RequestHandler) fasthttp.RequestHandler {
    return func(ctx *fasthttp.RequestCtx) {
      // inboud logic
      h(ctx)  // call the downstream handler
      // outbound logic
    }
  }
}
```

## 添加新的中间件组件
您的中间件组件可以贡献到 [components-contrib 仓库](https://github.com/dapr/components-contrib/tree/master/middleware)。

然后，在 [Dapr 运行时仓库](https://github.com/dapr/dapr) 提交另一个拉取请求（pull request/Pr），以注册新的中间件类型。 您需要修改位于 [ registry.go](https://github.com/dapr/dapr/blob/master/pkg/components/middleware/http/registry.go) 中的 **Load()** 方法以使用 **Register** 方法注册中间件。

## 下一步
* [操作方法：使用 OAuth 配置 API 授权]({{< ref oauth.md >}})
