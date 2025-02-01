---
type: docs
title: "如何：使用HTTP调用非Dapr端点"
linkTitle: "如何：调用非Dapr端点"
description: "从Dapr应用程序中通过服务调用访问非Dapr端点"
weight: 40
---

本文介绍如何通过Dapr使用HTTP调用非Dapr端点。

通过Dapr的服务调用API，您可以与使用或不使用Dapr的端点进行通信。使用Dapr调用非Dapr端点不仅提供了一致的API，还带来了以下[Dapr服务调用]({{< ref service-invocation-overview.md >}})的优势：

- 应用弹性策略
- 通过跟踪和指标实现调用的可观测性
- 通过访问控制实现安全性
- 利用中间件管道组件
- 服务发现
- 使用请求头进行身份验证

## 通过HTTP调用外部服务或非Dapr端点
有时您可能需要调用非Dapr的HTTP端点，例如：
- 您可能只在应用程序的一部分中使用Dapr，尤其是在涉及旧系统时
- 您可能无法访问代码以将现有应用程序迁移到Dapr
- 您需要调用外部的HTTP服务

通过定义`HTTPEndpoint`资源，您可以声明性地配置与非Dapr端点的交互方式。然后，您可以使用服务调用URL来访问非Dapr端点。或者，您可以直接在服务调用URL中使用非Dapr的完全限定域名（FQDN）端点URL。

### HttpEndpoint、FQDN URL和appId的优先级
在进行服务调用时，Dapr运行时遵循以下优先级顺序：

1. 是否为命名的`HTTPEndpoint`资源？
2. 是否为带有`http://`或`https://`前缀的FQDN URL？
3. 是否为`appID`？

## 服务调用与非Dapr HTTP端点
下图概述了Dapr在调用非Dapr端点时的工作流程。

<img src="/images/service-invocation-overview-non-dapr-endpoint.png" width=800 alt="显示服务调用到非Dapr端点步骤的图示">

1. 服务A发起一个HTTP调用，目标是服务B（一个非Dapr端点）。调用被发送到本地的Dapr sidecar。
2. Dapr通过`HTTPEndpoint`或FQDN URL定位服务B的位置，然后将消息转发给服务B。
3. 服务B向服务A的Dapr sidecar发送响应。
4. 服务A接收响应。

## 使用HTTPEndpoint资源或FQDN URL调用非Dapr端点
在与Dapr应用程序或非Dapr应用程序通信时，有两种方法可以调用非Dapr端点。Dapr应用程序可以通过以下方式之一调用非Dapr端点：

- 使用命名的`HTTPEndpoint`资源，定义一个`HTTPEndpoint`资源类型。请参阅[HTTPEndpoint参考]({{< ref httpendpoints-schema.md >}})中的示例。

    ```sh
    localhost:3500/v1.0/invoke/<HTTPEndpoint-name>/method/<my-method>
    ```

    例如，使用名为"palpatine"的`HTTPEndpoint`资源和名为"Order66"的方法：
    ```sh
    curl http://localhost:3500/v1.0/invoke/palpatine/method/order66
    ```

- 使用指向非Dapr端点的FQDN URL。

    ```sh
    localhost:3500/v1.0/invoke/<URL>/method/<my-method>
    ```

    例如，使用名为`https://darthsidious.starwars`的FQDN资源：
    ```sh
    curl http://localhost:3500/v1.0/invoke/https://darthsidious.starwars/method/order66
    ```

### 使用appId调用启用Dapr的应用程序
AppID用于通过`appID`和`my-method`调用Dapr应用程序。阅读[如何：使用HTTP调用服务]({{< ref howto-invoke-discover-services.md >}})指南以获取更多信息。例如：

```sh
localhost:3500/v1.0/invoke/<appID>/method/<my-method>
```
```sh
curl http://localhost:3602/v1.0/invoke/orderprocessor/method/checkout
```

## TLS认证

使用[HTTPEndpoint资源]({{< ref httpendpoints-schema.md >}})允许您根据远程端点的认证要求使用根证书、客户端证书和私钥的任意组合。

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

## 相关链接

- [HTTPEndpoint参考]({{< ref httpendpoints-schema.md >}})
- [服务调用概述]({{< ref service-invocation-overview.md >}})
- [服务调用API规范]({{< ref service_invocation_api.md >}})

## 社区电话演示
观看此[视频](https://youtu.be/BEXJgLsO4hA?t=364)以了解如何使用服务调用来调用非Dapr端点。
<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BEXJgLsO4hA?t=364" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>