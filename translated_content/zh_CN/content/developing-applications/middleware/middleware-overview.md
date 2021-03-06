---
type: docs
title: "概述"
linkTitle: "Secrets stores overview"
description: "General overview on set up of middleware components for Dapr"
weight: 10000
---

Dapr 允许通过链接一系列中间件组件来定义自定义处理管道。 Middleware pipelines are defined in Dapr configuration files. Middleware pipelines are defined in Dapr configuration files. As with other [building block components]({{< ref component-schema.md >}}), middleware components are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib/tree/master/middleware/http).

Middleware in Dapr is described using a `Component` file with the following schema:

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
The type of middleware is determined by the `type` field. Component setting values such as rate limits, OAuth credentials and other settings are put in the `metadata` section. The type of middleware is determined by the `type` field. Component setting values such as rate limits, OAuth credentials and other settings are put in the `metadata` section. Even though metadata values can contain secrets in plain text, it is recommended that you use a [secret store]({{< ref component-secrets.md >}}).

Next, a Dapr [configuration]({{< ref configuration-overview.md >}}) defines the pipeline of middleware components for your application.

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

## Writing a custom middleware

Dapr uses [FastHTTP](https://github.com/valyala/fasthttp) to implement its HTTP server. 因此，您的 HTTP 中间件也需要编写为 FastHTTP handler。 因此，您的 HTTP 中间件也需要编写为 FastHTTP handler。 您的中间件需要实现 Middleware 接口，该接口定义 **GetHandler** 方法，该方法返回 **fasthttp.RequestHandler**:

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

## Adding new middleware components

您的中间件组件可以贡献到 [components-contrib 仓库](https://github.com/dapr/components-contrib/tree/master/middleware)。

After the components-contrib change has been accepted, submit another pull request against the [Dapr runtime repository](https://github.com/dapr/dapr) to register the new middleware type. You'll need to modify **[runtime.WithHTTPMiddleware](https://github.com/dapr/dapr/blob/f4d50b1369e416a8f7b93e3e226c4360307d1313/cmd/daprd/main.go#L394-L424)** method in [cmd/daprd/main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go) to register your middleware with Dapr's runtime. You'll need to modify **[runtime.WithHTTPMiddleware](https://github.com/dapr/dapr/blob/f4d50b1369e416a8f7b93e3e226c4360307d1313/cmd/daprd/main.go#L394-L424)** method in [cmd/daprd/main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go) to register your middleware with Dapr's runtime.

## 相关链接

* [Middleware pipelines concept]({{< ref middleware-concept.md >}})
* [Component schema]({{< ref component-schema.md >}})
* [Configuration overview]({{< ref configuration-overview.md >}})
* [Middleware quickstart](https://github.com/dapr/quickstarts/tree/master/middleware)
