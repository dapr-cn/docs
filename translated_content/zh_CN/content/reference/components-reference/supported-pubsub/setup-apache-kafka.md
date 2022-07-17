---
type: docs
title: "Apache Kafka"
linkTitle: "Apache Kafka"
description: "关于Apache Kafka pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-apache-kafka/"
---

## 配置

要设置Apache Kafka pubsub，请创建一个`pubsub.kafka`类型的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。 有关使用 `secretKeyRef`的详细信息，请参阅有[关如何在组件中引用Secret指南]({{< ref component-secrets.md >}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # Required. Kafka broker connection setting
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: clientID # Optional. Used as client tracing ID by Kafka brokers.
    value: "my-dapr-app-id"
  - name: authType # Required.
    value: "password"
  - name: saslUsername # Required if authType is `password`.
    value: "adminuser"
  - name: saslPassword # Required if authType is `password`.
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
  - name: disableTls # Optional. Disable TLS. This is not safe for production!! You should read the `Mutual TLS` section for how to use TLS.
    value: "true"
```

## 元数据字段规范

| 字段                   | 必填 | 详情                                                                                                                                               | 示例                                                                                                 |
| -------------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| brokers              | Y  | A comma-separated list of Kafka brokers.                                                                                                         | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"`                                         |
| consumerGroup        | N  | 监听 kafka 消费者组。 发布到主题的每条记录都会传递给订阅该主题的每个消费者组中的一个消费者。                                                                                               | `"group1"`                                                                                         |
| clientID             | N  | A user-provided string sent with every request to the Kafka brokers for logging, debugging, and auditing purposes. Defaults to `"sarama"`.       | `"my-dapr-app"`                                                                                    |
| authRequired         | N  | *已弃用* 启用 [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) 对 Kafka broker 的身份验证。                                    | `"true"`, `"false"`                                                                                |
| authType             | Y  | 配置或禁用身份验证。 支持值包括： `none`, `password`, `mtls`, 或者 `oidc`                                                                                          | `"password"`, `"none"`                                                                             |
| saslUsername         | N  | 用于身份验证的 SASL 用户名。 只有将`authType`的值设置为`"password"`时才需要设置。                                                                                          | `"adminuser"`                                                                                      |
| saslPassword         | N  | 用于身份验证的 SASL 密码。 可以用`secretKeyRef`来[引用 Secret]({{< ref component-secrets.md >}})。 只有将`authType`的值设置为`"password"`时才需要设置。 |</code>""`,`"KeFg23!"` |                                                                                                    |
| initialOffset        | N  | 如果以前未提交任何偏移量，则要使用的初始偏移量。 应为"newest"或"oldest"。 默认为"newest"。                                                                                       | `"oldest"`                                                                                         |
| maxMessageBytes      | N  | 单条Kafka消息允许的最大消息的字节大小。 默认值为 1024。                                                                                                                | `2048`                                                                                             |
| consumeRetryInterval | N  | 尝试消费主题时重试的间隔。 将不带后缀的数字视为毫秒。 默认值为 100ms。                                                                                                          | `200ms`                                                                                            |
| consumeRetryEnabled  | N  | Disable consume retry by setting `"false"`                                                                                                       | `"true"`, `"false"`                                                                                |
| version              | N  | Kafka 集群版本。 默认值为 2.0.0.0                                                                                                                         | `0.10.2.0`                                                                                         |
| caCert               | N  | 证书颁发机构证书，使用 TLS 时需要。 可以用`secretKeyRef`来引用密钥。                                                                                                     | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientCert           | N  | 客户端证书， `authType` `mtls`需要使用到该配置。 可以用`secretKeyRef`来引用密钥。                                                                                        | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientKey            | N  | 客户端密钥，`authType` `mtls` 需要使用该配置，可以是`secretKeyRef`来使用一个秘密引用                                                                                       | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"` |
| skipVerify           | N  | 跳过 TLS 验证，不建议在生产中使用。 默认值为 `"false"`                                                                                                              | `"true"`, `"false"`                                                                                |
| disableTls           | N  | 为传输安全设置禁用 TLS 。 To disable, you're not required to set value to `"true"`. 不建议在生产中使用。 默认值为 `"false"`.                                             | `"true"`, `"false"`                                                                                |
| oidcTokenEndpoint    | N  | OAuth2 身份提供者访问令牌端点的完整 URL。 将`authType`的值设置为`oidc`时需要设置。                                                                                          | "https://identity.example.com/v1/token"                                                            |
| oidcClientID         | N  | 已在标识提供者中预配的 OAuth2 客户端 ID。 将`authType`的值设置为`oidc`时需要设置。                                                                                          | `dapr-kafka`                                                                                       |
| oidcClientSecret     | N  | 已在身份提供者中配置的 OAuth2 客户端密码：当 `authType` 设置为 `oidc`时需要                                                                                              | `"KeFg23!"`                                                                                        |
| oidcScopes           | N  | 使用访问令牌请求的 OAuth2/OIDC 范围的逗号分隔列表。 当 `authType` 设置为 `oidc`时推荐使用。 默认值为 `"openid"`                                                                   | `"openid,kafka-prod"`                                                                              |

上面的 `secretKeyRef` 引用了一个 [kubernetes secrets 存储]({{< ref kubernetes-secret-store.md >}}) 来访问 tls 信息。 访问[此处]({{< ref setup-secret-store.md >}}) ，了解有关如何配置密钥存储组件的详细信息。

### Authentication

Kafka 支持多种身份验证模式，Dapr 支持几种：SASL 密码、mTLS、OIDC/OAuth2。 使用附加的身份验证方法， `authRequired` 字段已从 v1.6 版本中弃用 ，而应使用 `authType` 字段。 如果 `authRequired` 设置为 `true`，Dapr 将尝试根据 `saslPassword`的值正确配置 `authType` 。 `authType`有四个有效值： `none`, `password`, `mtls` 和 `oidc`。 请注意，这只是身份验证；授权仍然在 Kafka 中配置。

#### 无验证

将 `authType` 设置为 `none` 将禁用任何身份验证。 在生产环境中不建议这样做。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-noauth
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # Required. Kafka broker connection setting
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: clientID # Optional. Used as client tracing ID by Kafka brokers.
    value: "my-dapr-app-id"
  - name: authType # Required.
    value: "none"
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
  - name: disableTls 
    value: "true"
```

#### SASL 密码

将 `authType` 设置为 `password` 使用 **PLAIN** 机制启用 [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) 身份验证。 这需要设置`saslUsername` 和 `saslPassword` 字段。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-sasl
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # Required. Kafka broker connection setting
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: clientID # Optional. Used as client tracing ID by Kafka brokers.
    value: "my-dapr-app-id"
  - name: authType # Required.
    value: "password"
  - name: saslUsername # Required if authType is `password`.
    value: "adminuser"
  - name: saslPassword # Required if authType is `password`.
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
  - name: caCert
    secretKeyRef:
      name: kafka-tls
      key: caCert
```

#### 双向 TLS

将 `authType` 设置为 `mtls` 使用 x509 客户端证书（ `clientCert` 字段）和密钥（ `clientKey` 字段）进行身份验证。 请注意，mTLS 作为一种身份验证机制不同于使用 TLS 加密来保护数据传输层。 mTLS 需要 TLS 传输（意味着 `disableTls` 必须为 `false`），但传输层保护不需要使用 mTLS。 有关底层 TLS 传输的配置信息，请参阅 [使用 TLS通信](#communication-using-tls)。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-mtls
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # Required. Kafka broker connection setting
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: clientID # Optional. Used as client tracing ID by Kafka brokers.
    value: "my-dapr-app-id"
  - name: authType # Required.
    value: "mtls"
  - name: caCert
    secretKeyRef:
      name: kafka-tls
      key: caCert
  - name: clientCert
    secretKeyRef:
      name: kafka-tls
      key: clientCert
  - name: clientKey
    secretKeyRef:
      name: kafka-tls
      key: clientKey
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
```

#### OAuth2 或 OpenID 连接

将 `authType` 设置为 `oidc` 可以使用 **OAUTHBEARER** 机制启用 SASL 身份验证。 This supports specifying a bearer token from an external OAuth2 or [OIDC](https://en.wikipedia.org/wiki/OpenID) identity provider. Currently, only the **client_credentials** grant is supported.

Configure `oidcTokenEndpoint` to the full URL for the identity provider access token endpoint.

将`oidcClientID` 和`oidcClientSecret` 设置为认证提供者预分配的客户端证书。

If `caCert` is specified in the component configuration, the certificate is appended to the system CA trust for verifying the identity provider certificate. Similarly, if `skipVerify` is specified in the component configuration, verification will also be skipped when accessing the identity provider.

By default, the only scope requested for the token is `openid`; it is **highly** recommended that additional scopes be specified via `oidcScopes` in a comma-separated list and validated by the Kafka broker. 如果不使用附加范围来限制access token的有效性，妥协的Kafka代理可以重放该token作为Dapr客户端ID去访问其他服务。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # Required. Kafka broker connection setting
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: clientID # Optional. Used as client tracing ID by Kafka brokers.
    value: "my-dapr-app-id"
  - name: authType # Required.
    value: "oidc"
  - name: oidcTokenEndpoint # Required if authType is `oidc`.
    value: "https://identity.example.com/v1/token"
  - name: oidcClientID      # Required if authType is `oidc`.
    value: "dapr-myapp"
  - name: oidcClientSecret  # Required if authType is `oidc`.
    secretKeyRef:
      name: kafka-secrets
      key: oidcClientSecret
  - name: oidcScopes        # Recommended if authType is `oidc`.
    value: "openid,kafka-dev"
  - name: caCert            # Also applied to verifying OIDC provider certificate
    secretKeyRef:
      name: kafka-tls
      key: caCert
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
```

### 使用 TLS 通信

默认情况下启用 TLS 以保护 Kafka 的传输层。 要禁用 TLS，请将 `disableTls` 设置为 `true`。 启用TLS后，你可以控制服务端证书验证，使用`skipVerify` 去禁用验证(在生产环境*不* 推荐) 并且使用`caCert`去指定一个信任的TLS证书颁发机构（CA）。 如果不指定`caCert`，将使用系统信任的CA。 要同时配置 mTLS 身份验证，请参阅 _身份验证_下的内容。 下面是一个配置使用传输层 TLS 的 Kafka pubsub 组件的示例：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # Required. Kafka broker connection setting
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # Optional. Used for input bindings.
    value: "group1"
  - name: clientID # Optional. Used as client tracing ID by Kafka brokers.
    value: "my-dapr-app-id"
  - name: authType # Required.
    value: "password"
  - name: saslUsername # Required if authType is `password`.
    value: "adminuser"
  - name: consumeRetryInterval # Optional.
    value: 200ms
  - name: version # Optional.
    value: 0.10.2.0
  - name: saslPassword # Required if authRequired is `true`.
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: maxMessageBytes # Optional.
    value: 1024
  - name: caCert # Certificate authority certificate.
    secretKeyRef:
      name: kafka-tls
      key: caCert
auth:
  secretStore: <SECRET_STORE_NAME>
```

## 每次调用的元数据字段

### 分区键

当调用Kafka 发布/订阅时，可以通过在请求url中使用`metadata`查询参数来提供一个可选的分区键。

参数名是`partitionKey`。

示例:

```shell
curl -X POST http://localhost:3500/v1.0/publish/myKafka/myTopic?metadata.partitionKey=key1 \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

### 消息头

所有其他元数据键/值对（不是 `partitionKey`）都设置为 Kafka 消息中的请求头。 下面是为消息设置 ` correlationId ` 的示例。

```shell
curl -X POST http://localhost:3500/v1.0/publish/myKafka/myTopic?metadata.correlationId=myCorrelationID&metadata.partitionKey=key1 \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

## 创建 Kafka 实例

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
你可以使用[这个](https://github.com/wurstmeister/kafka-docker)Docker镜像在本地运行Kafka。 要在没有Docker的情况下运行，请参阅[入门指南](https://kafka.apache.org/quickstart)。
{{% /codetab %}}

{{% codetab %}}
To run Kafka on Kubernetes, you can use any Kafka operator, such as [Strimzi](https://strimzi.io/docs/operators/latest/quickstart.html#ref-install-prerequisites-str).
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md##step-1-setup-the-pubsub-component" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
