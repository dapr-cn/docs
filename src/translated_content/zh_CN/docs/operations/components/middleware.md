---
type: docs
title: "配置中间件组件"
linkTitle: "配置中间件"
weight: 2000
description: "通过添加中间件组件自定义处理管道"
---

Dapr 允许通过串联一系列中间件组件来定义自定义处理管道。您可以在以下两种场景中使用中间件管道：

1. 基础模块 API - 在调用任何 Dapr HTTP API 时执行 HTTP 中间件组件。
2. 服务间调用 - HTTP 中间件组件应用于服务间调用。

## 配置 API 中间件管道

启动时，Dapr sidecar 会为传入的 HTTP 调用构建一个中间件处理管道。默认情况下，管道由[追踪]({{< ref tracing-overview.md >}})和 CORS 中间件组成。可以通过 Dapr [configuration]({{< ref configuration-concept.md >}}) 配置的其他中间件按定义顺序添加到管道中。该管道适用于所有 Dapr API 端点，包括 state、pubsub、service-invocation、bindings、secret、configuration、分布式锁等。

请求在路由到用户代码之前会依次经过所有定义的中间件组件，然后在返回给客户端之前以相反的顺序再次经过这些中间件，如下图所示。

<img src="/images/middleware.png" width="800" alt="图示请求和响应通过中间件的流程，如上段所述" />

在使用 `httpPipeline` 配置调用 Dapr HTTP API 时，HTTP 中间件组件会被执行。

以下配置示例定义了一个自定义管道，使用了 [OAuth 2.0 中间件]({{< ref middleware-oauth2.md >}}) 和 [大写中间件组件]({{< ref middleware-uppercase.md >}})。在这种情况下，所有请求在转发到用户代码之前都通过 OAuth 2.0 协议进行授权，并转换为大写文本。

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

与其他组件一样，中间件组件可以在[支持的中间件参考]({{< ref supported-middleware >}})和[`dapr/components-contrib` 仓库](https://github.com/dapr/components-contrib/tree/master/middleware/http)中找到。

{{< button page="supported-middleware" text="查看所有中间件组件">}}

## 配置应用中间件管道

在进行服务间调用时，您也可以使用任何中间件组件。例如，在零信任环境中添加令牌验证，转换特定应用端点的请求，或应用 OAuth 策略。

服务间调用中间件组件适用于从 Dapr sidecar 到接收应用（服务）的所有**传出**调用，如下图所示。

<img src="/images/app-middleware.png" width="800" alt="图示服务调用请求的流程。从调用者 Dapr sidecar 到被调用应用的请求经过应用中间件管道，如上段所述。" />

任何可以用作 HTTP 中间件的中间件组件也可以通过 `appHttpPipeline` 配置应用于服务间调用。下面的示例为从 Dapr sidecar（服务调用的目标）到应用的所有传出调用添加了 `uppercase` 中间件组件。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pipeline
  namespace: default
spec:
  appHttpPipeline:
    handlers:
      - name: uppercase
        type: middleware.http.uppercase
```

## 相关链接

- [了解如何编写中间件组件]({{< ref develop-middleware.md >}})
- [组件架构]({{< ref component-schema.md >}})
- [配置概述]({{< ref configuration-overview.md >}})
- [API 中间件示例](https://github.com/dapr/samples/tree/master/middleware-oauth-google)
