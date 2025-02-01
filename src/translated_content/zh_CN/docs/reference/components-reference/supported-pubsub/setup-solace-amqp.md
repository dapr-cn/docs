---
type: docs
title: "Solace-AMQP"
linkTitle: "Solace-AMQP"
description: "关于 Solace-AMQP 发布/订阅组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-solace-amqp/"
---

## 组件格式

要配置 Solace-AMQP 发布/订阅组件，请创建一个类型为 `pubsub.solace.amqp` 的组件。请参考 [发布/订阅代理组件文件]({{< ref setup-pubsub.md >}}) 了解 ConsumerID 的自动生成方式。参阅 [操作指南：发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) 以获取创建和应用发布/订阅配置的步骤。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: solace
spec:
  type: pubsub.solace.amqp
  version: v1
  metadata:
    - name: url
      value: 'amqp://localhost:5672'
    - name: username
      value: 'default'
    - name: password
      value: 'default'
    - name: consumerID
      value: 'channel1'
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保护密钥，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| url    | Y  | AMQP 代理的地址。可以使用 `secretKeyRef` 引用密钥。<br> 使用 **`amqp://`** URI 方案进行非 TLS 通信。<br> 使用 **`amqps://`** URI 方案进行 TLS 通信。 | `"amqp://host.domain[:port]"`
| username | Y | 连接到代理的用户名。仅在未启用匿名连接或设置为 `false` 时需要。| `default`
| password | Y | 连接到代理的密码。仅在未启用匿名连接或设置为 `false` 时需要。 | `default`
| consumerID        |    N     | 消费者 ID（消费者标签）用于将一个或多个消费者组织成一个组。具有相同消费者 ID 的消费者作为一个虚拟消费者工作；例如，消息仅由组中的一个消费者处理一次。如果未提供 `consumerID`，Dapr 运行时将其设置为 Dapr 应用程序 ID (`appID`) 值。 | 可以设置为字符串值（如上例中的 `"channel1"`）或字符串格式值（如 `"{podName}"` 等）。[查看您可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| anonymous | N | 在不进行凭证验证的情况下连接到代理。仅在代理上启用时有效。如果设置为 `true`，则不需要用户名和密码。 | `true`
| caCert | 使用 TLS 时必需 | 用于验证服务器 TLS 证书的 PEM 格式的证书颁发机构 (CA) 证书。 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert  | 使用 TLS 时必需 | PEM 格式的 TLS 客户端证书。必须与 `clientKey` 一起使用。 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | 使用 TLS 时必需 | PEM 格式的 TLS 客户端密钥。必须与 `clientCert` 一起使用。可以使用 `secretKeyRef` 引用密钥。 | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`

### 使用 TLS 进行通信

要配置使用 TLS 进行通信：

1. 确保 Solace 代理已配置为支持证书。
1. 在组件配置中提供 `caCert`、`clientCert` 和 `clientKey` 元数据。

例如：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: solace
spec:
  type: pubsub.solace.amqp
  version: v1
  metadata:
  - name: url
    value: "amqps://host.domain[:port]"
  - name: username
    value: 'default'
  - name: password
    value: 'default'
  - name: caCert
    value: ${{ myLoadedCACert }}
  - name: clientCert
    value: ${{ myLoadedClientCert }}
  - name: clientKey
    secretKeyRef:
      name: mySolaceClientKey
      key: mySolaceClientKey
auth:
  secretStore: <SECRET_STORE_NAME>
```

> 虽然 `caCert` 和 `clientCert` 的值可能不是密钥，但为了方便起见，它们也可以从 Dapr 密钥存储中引用。

### 发布/订阅主题和队列

默认情况下，消息通过主题发布和订阅。如果您希望目标是队列，请在主题前加上 `queue:` 前缀，Solace AMQP 组件将连接到队列。

## 创建 Solace 代理

{{< tabs "自托管" "SaaS">}}

{{% codetab %}}
您可以[使用 Docker 本地运行 Solace 代理](https://hub.docker.com/r/solace/solace-pubsub-standard)：

```bash
docker run -d -p 8080:8080 -p 55554:55555 -p 8008:8008 -p 1883:1883 -p 8000:8000 -p 5672:5672 -p 9000:9000 -p 2222:2222 --shm-size=2g --env username_admin_globalaccesslevel=admin --env username_admin_password=admin --name=solace solace/solace-pubsub-standard
```

然后您可以使用客户端端口与服务器交互：`mqtt://localhost:5672`
{{% /codetab %}}

{{% codetab %}}
您还可以在 [Solace Cloud](https://console.solace.cloud/login/new-account?product=event-streaming) 上注册一个免费的 SaaS 代理。
{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 参阅[本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})以获取配置发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
