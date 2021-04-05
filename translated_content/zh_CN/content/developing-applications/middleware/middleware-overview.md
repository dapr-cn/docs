---
type: docs
title: "概述"
linkTitle: "概述"
description: "Dapr中间件设置的概述"
weight: 10000
---

Dapr 允许通过链接一系列中间件组件来定义自定义处理管道。 Dapr配置文件中定义了中件管道。 与其他[构建块组件]({{< ref component-schema.md >}})一样，中间件组件是可扩展的，可以在[components-contrib repo](https://github.com/dapr/components-contrib/tree/master/middleware/http)中找到。

Dapr中的中间件使用`Component`文件描述，其schema如下:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <COMPONENT NAME>
  namespace: <NAMESPACE>
spec:
  type: middleware.http.<MIDDLEWARE TYPE>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```
中间件类型由 `type` 字段决定。 组件设置值，如速率限制，OAuth 凭据和其他设置被放入 `metadata` 部分。 即使元数据值可以在纯文本中包含密钥，但建议您使用一个 [密钥存储]({{< ref component-secrets.md >}})。

接下来，一个 Dapr [配置]({{< ref configuration-overview.md >}}) 定义了您应用程序的中间件组件管道.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: <COMPONENT NAME>
      type: middleware.http.<MIDDLEWARE TYPE>
    - name: <COMPONENT NAME>
      type: middleware.http.<MIDDLEWARE TYPE>
```

## 编写自定义中间件

Dapr 使用 [FastHTTP](https://github.com/valyala/fasthttp) 来实现其的 HTTP 服务器。 因此，您的 HTTP 中间件也需要编写为 FastHTTP handler。 您的中间件需要实现 Middleware 接口，该接口定义 **GetHandler** 方法，该方法返回 **fasthttp.RequestHandler**:

```go
type Middleware interface {
  GetHandler(metadata Metadata) (func(h fasthttp.RequestHandler) fasthttp.RequestHandler, error)
}
```

您的 handler 实现可以包含任何入站（inbound）逻辑和出站（outbound）逻辑或两者兼有：

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

在接受了 components-contrib 变更后，针对 [Dapr 运行时仓库](https://github.com/dapr/dapr) 提交另一个 pull 请求，以注册新的中间件类型。 您需要修改[runtime.WithHTTPMiddleware](https://github.com/dapr/dapr/blob/f4d50b1369e416a8f7b93e3e226c4360307d1313/cmd/daprd/main.go#L394-L424)</strong>方法中的**[cmd/daprd/main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go)方法，将您的中间件注册到Dapr的运行时。</p>

## 相关链接

* [中件管道概念]({{< ref middleware-concept.md >}})
* [组件schema]({{< ref component-schema.md >}})
* [配置概览]({{< ref configuration-overview.md >}})
* [中间件快速入门](https://github.com/dapr/quickstarts/tree/master/middleware)
