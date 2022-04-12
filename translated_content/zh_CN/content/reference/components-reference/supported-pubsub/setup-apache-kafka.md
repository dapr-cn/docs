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
```

## 元数据字段规范

| 字段                   | 必填 | 详情                                                                                                                                                     | 示例                                                                                                 |
| -------------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| brokers              | Y  | 逗号分隔的kafka broker列表.                                                                                                                                   | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"`                                         |
| consumerGroup        | 否  | 监听 kafka 消费者组。 发布到主题的每条记录都会传递给订阅该主题的每个消费者组中的一个消费者。                                                                                                     | `"group1"`                                                                                         |
| clientID             | 否  | 用户提供的字符串，随每个请求一起发送到 Kafka 代理，用于日志记录、调试和审计目的。 默认为 `"sarama"`。                                                                                           | `"my-dapr-app"`                                                                                    |
| authRequired         | 否  | *Deprecated* Enable [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) authentication with the Kafka brokers.              | `"true"`, `"false"`                                                                                |
| authType             | Y  | Configure or disable authentication. Supported values: `none`, `password`, `mtls`, or `oidc`                                                           | `"password"`, `"none"`                                                                             |
| saslUsername         | N  | 用于身份验证的 SASL 用户名。 Only required if `authType` is set to `"password"`.                                                                                  | `"adminuser"`                                                                                      |
| saslPassword         | N  | 用于身份验证的 SASL 密码。 可以用`secretKeyRef`来[引用 Secret]({{< ref component-secrets.md >}})。 Only required if `authType is set to`"password"`. |`""`,`"KeFg23!"` |                                                                                                    |
| initialOffset        | N  | 如果以前未提交任何偏移量，则要使用的初始偏移量。 应为"newest"或"oldest"。 默认为"newest"。                                                                                             | `"oldest"`                                                                                         |
| maxMessageBytes      | N  | 单条Kafka消息允许的最大消息的字节大小。 默认值为 1024。                                                                                                                      | `2048`                                                                                             |
| consumeRetryInterval | N  | 尝试消费主题时重试的间隔。 将不带后缀的数字视为毫秒。 默认值为 100ms。                                                                                                                | `200ms`                                                                                            |
| version              | N  | Kafka 集群版本。 默认值为 2.0.0.0                                                                                                                               | `0.10.2.0`                                                                                         |
| caCert               | N  | 证书颁发机构证书，使用 TLS 时需要。 可以用`secretKeyRef`来引用密钥。                                                                                                           | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientCert           | N  | Client certificate, required for `authType` `mtls`. 可以用`secretKeyRef`来引用密钥。                                                                            | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientKey            | N  | Client key, required for `authType` `mtls` Can be `secretKeyRef` to use a secret reference                                                             | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"` |
| skipVerify           | N  | 跳过 TLS 验证，不建议在生产中使用。 默认值为 `"false"`                                                                                                                    | `"true"`, `"false"`                                                                                |
| disableTls           | N  | Disable TLS for transport security. This is not recommended for use in production. 默认值为 `"false"`                                                      | `"true"`, `"false"`                                                                                |
| oidcTokenEndpoint    | N  | Full URL to an OAuth2 identity provider access token endpoint. Required when `authType` is set to `oidc`                                               | "https://identity.example.com/v1/token"                                                            |
| oidcClientID         | N  | The OAuth2 client ID that has been provisioned in the identity provider. Required when `authType is set to`oidc`|`dapr-kafka`                         |                                                                                                    |
| oidcClientSecret     | N  | The OAuth2 client secret that has been provisioned in the identity provider: Required when `authType` is set to `oidc`                                 | `"KeFg23!"`                                                                                        |
| oidcScopes           | N  | Comma-delimited list of OAuth2/OIDC scopes to request with the access token. Recommended when `authType` is set to `oidc`. Defaults to `"openid"`      | '"openid,kafka-prod"`                                                                             |


上面的 `secretKeyRef` 引用了一个 [kubernetes secrets 存储]({{< ref kubernetes-secret-store.md >}}) 来访问 tls 信息。 访问[此处]({{< ref setup-secret-store.md >}}) ，了解有关如何配置密钥存储组件的详细信息。

### Authentication

Kafka supports a variety of authentication schemes and Dapr supports several: SASL password, mTLS, OIDC/OAuth2. With the added authentication methods, the `authRequired` field has been deprecated from the v1.6 release and instead the `authType` field should be used. If `authRequired` is set to `true`, Dapr will attempt to configure `authType` correctly based on the value of `saslPassword`. There are four valid values for `authType`: `none`, `password`, `mtls`, and `oidc`. Note this is authentication only; authorization is still configured within Kafka.

#### None

Setting `authType` to `none` will disable any authentication. This is *NOT* recommended in production.

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

#### SASL Password

Setting `authType` to `password` enables [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) authentication using the **PLAIN** mechanism. This requires setting the `saslUsername` and `saslPassword` fields.

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

#### Mutual TLS

Setting `authType` to `mtls` uses a x509 client certificate (the `clientCert` field) and key (the `clientKey` field) to authenticate. Note that mTLS as an authentication mechanism is distinct from using TLS to secure the transport layer via encryption. mTLS requires TLS transport (meaning `disableTls` must be `false`), but securing the transport layer does not require using mTLS. See [Communication using TLS](#communication-using-tls) for configuring underlying TLS transport.

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

#### OAuth2 or OpenID Connect

Setting `authType` to `oidc` enables SASL authentication via the **OAUTHBEARER** mechanism. This supports specifying a bearer token from an external OAuth2 or [OIDC](https://en.wikipedia.org/wiki/OpenID) identity provider. Currenly only the **client_credentials** grant is supported. Configure `oidcTokenEndpoint` to the full URL for the identity provider access token endpoint. Set `oidcClientID` and `oidcClientSecret` to the client credentials provisioned in the identity provider. If `caCert` is specified in the component configuration, the certificate is appended to the system CA trust for verifying the identity provider certificate. Similarly, if `skipVerify` is specified in the component configuration, verification will also be skipped when accessing the identity provider. By default, the only scope requested for the token is `openid`; it is **highly** recommended that additional scopes be specified via `oidcScopes` in a comma-separated list and validated by the Kafka broker. If additional scopes are not used to narrow the validity of the access token, a compromised Kafka broker could replay the token to access other services as the Dapr clientID.

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

By default TLS is enabled to secure the transport layer to Kafka. To disable TLS, set `disableTls` to `true`. When TLS is enabled, you can control server certificate verification using `skipVerify` to disable verificaiton (*NOT* recommended in production environments) and `caCert` to specify a trusted TLS certificate authority (CA). If no `caCert` is specified, the system CA trust will be used. To also configure mTLS authentication, see the section under _Authentication_. Below is an example of a Kafka pubsub component configured to use transport layer TLS:

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

### Message headers

All other metadata key/value pairs (that are not `partitionKey`) are set as headers in the Kafka message. Here is an example setting a `correlationId` for the message.

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
