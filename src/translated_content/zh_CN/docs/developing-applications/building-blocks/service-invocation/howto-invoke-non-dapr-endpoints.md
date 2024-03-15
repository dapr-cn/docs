---
type: docs
title: 操作方法：使用HTTP调用非Dapr端点
linkTitle: 操作方法：调用非 Dapr 端点
description: 使用服务调用从 Dapr 应用程序调用非 Dapr 端点
weight: 40
---

本文演示如何使用Dapr通过HTTP调用非Dapr端点。

使用 Dapr 的服务调用 API，您可以与使用或不使用 Dapr 的端点进行通信。 使用 Dapr 调用不使用 Dapr 的端点不仅提供了一致的 API，还提供以下[Dapr服务调用]({{< ref service-invocation-overview\.md >}})的好处：

- 应用弹性策略的能力
- 使用跟踪 & metrics的可观测性
- 通过作用域进行安全访问控制
- 能够利用中间件管道组件
- 服务发现
- 通过使用headers进行身份验证

## HTTP服务调用到外部服务或非Dapr端点

有时候你需要调用一个非 Dapr 的 HTTP 终端点。 For example:

- 您可以选择仅在整个应用程序的一部分中使用 Dapr，包括旧代码开发
- 您可能无法访问代码以迁移现有应用程序以使用 Dapr
- 您需要调用外部HTTP服务。

通过定义一个 `HTTPEndpoint` 资源，您可以声明性地定义一种与非 Dapr 端点交互的方式。 然后，您使用服务调用URL来调用非 Dapr 端点。 或者，您可以直接将非 Dapr 完全限定域名（FQDN）终端点 URL 放入服务调用 URL 中。

### HttpEndpoint、FQDN URL 和 appId 之间的优先顺序

在使用服务调用时，Dapr 运行时遵循优先顺序：

1. 这是一个名为 `HTTPEndpoint` 的资源吗？
2. 这是一个带有`http://`或`https://`前缀的FQDN URL吗？
3. 这是一个`appID`吗？

## 服务调用和非 Dapr HTTP 端点

下图概述了在调用非 Dapr 端点时 Dapr 的服务调用是如何工作的。

<img src="/images/service-invocation-overview-non-dapr-endpoint.png" width=800 alt="Diagram showing the steps of service invocation to non-Dapr endpoints">

1. 服务 A 针对服务 B（非 Dapr 端点）进行 HTTP 调用。 调用转到本地 Dapr sidecar。
2. Dapr 使用 `HTTPEndpoint` 或 FQDN URL 来发现 Service B 的位置。
3. Dapr 将消息转发至服务 B。
4. Service B运行其业务逻辑代码。
5. 服务 B 发送响应给服务 A 的 Dapr sidecar。
6. 服务 A 接收响应。

## 使用HTTPEndpoint资源或FQDN URL来调用非Dapr端点

在与 Dapr 应用程序或非 Dapr 应用程序通信时，有两种方法可以调用非 Dapr 端点。 Dapr 应用程序可以通过提供以下之一来调用非 Dapr 终结点:

- 一个命名的`HTTPEndpoint`资源，包括定义一个`HTTPEndpoint`资源类型。 查看[HTTPEndpoint参考]({{< ref httpendpoints-schema.md >}})指南以获取示例。

  ```sh
  localhost:3500/v1.0/invoke/<HTTPEndpoint-name>/method/<my-method>
  ```

  例如，使用名为"palpatine"的`HTTPEndpoint`资源和名为"Order66"的方法，这将是：

  ```sh
  curl http://localhost:3500/v1.0/invoke/palpatine/method/order66
  ```

- 一个指向非 Dapr 终端节点的 FQDN URL。

  ```sh
  localhost:3500/v1.0/invoke/<URL>/method/<my-method>
  ```

  例如，对于名为 `https://darthsidious.starwars` 的 FQDN 资源，这将是：

  ```sh
  curl http://localhost:3500/v1.0/invoke/https://darthsidious.starwars/method/order66
  ```

### 在调用 Dapr 启用的应用程序时使用 appId

AppID 始终用于调用 Dapr 应用程序，使用 `appID` 和 `my-method`。 阅读[操作方法：使用HTTP调用服务]({{< ref howto-invoke-discover-services.md >}})指南，了解更多信息。 For example:

```sh
localhost:3500/v1.0/invoke/<appID>/method/<my-method>
```

```sh
curl http://localhost:3602/v1.0/invoke/orderprocessor/method/checkout
```

## TLS认证

使用[HTTPEndpoint资源]({{< ref httpendpoints-schema.md >}})允许您根据远程终端的身份验证要求使用根证书、客户端证书和私钥的任意组合。

### 使用根证书的示例

```yaml
apiVersion: dapr.io/v1alpha1
kind: HTTPEndpoint
metadata:
  name: "external-http-endpoint-tls"
spec:
  baseUrl: https://service-invocation-external:443
  headers:
  - name: "Accept-Language"
    value: "en-US"
  clientTLS:
    rootCA:
      secretKeyRef:
        name: dapr-tls-client
        key: ca.crt
```

### 使用客户端证书和私钥的示例

```yaml
apiVersion: dapr.io/v1alpha1
kind: HTTPEndpoint
metadata:
  name: "external-http-endpoint-tls"
spec:
  baseUrl: https://service-invocation-external:443
  headers:
  - name: "Accept-Language"
    value: "en-US"
  clientTLS:
    certificate:
      secretKeyRef:
        name: dapr-tls-client
        key: tls.crt
    privateKey:
      secretKeyRef:
        name: dapr-tls-key
        key: tls.key
```

## Related Links

- [HTTPEndpoint reference]({{< ref httpendpoints-schema.md >}})
- [服务调用概述]({{< ref service-invocation-overview\.md >}})
- [服务调用API规范]({{< ref service_invocation_api.md >}})

## Community call demo

观看此 [视频](https://youtu.be/BEXJgLsO4hA?t=364) 以了解如何使用服务调用来调用非 Dapr 终端点。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BEXJgLsO4hA?t=364" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
