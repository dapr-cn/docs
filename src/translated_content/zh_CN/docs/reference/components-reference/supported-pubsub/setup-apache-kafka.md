---
type: docs
title: "Apache Kafka"
linkTitle: "Apache Kafka"
description: "Apache Kafka pubsub 组件的详细说明文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-apache-kafka/"
---

## 组件格式

要设置 Apache Kafka 的发布/订阅功能，您需要创建一个类型为 `pubsub.kafka` 的组件。请参阅 [pub/sub broker 组件文件]({{< ref setup-pubsub.md >}}) 了解 ConsumerID 是如何自动生成的。阅读 [如何：发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) 了解如何创建和应用发布/订阅配置。

所有组件的元数据字段值可以使用 [模板化的元数据值]({{< ref "component-schema.md#templated-metadata-values" >}})，这些值会在 Dapr sidecar 启动时解析。例如，您可以选择使用 `{namespace}` 作为 `consumerGroup`，以便在不同命名空间中使用相同的 `appId` 和主题，如 [本文]({{< ref "howto-namespace.md#with-namespace-consumer-groups">}}) 所述。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # 必需字段，Kafka broker 连接设置
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # 可选字段，用于输入绑定。
    value: "{namespace}"
  - name: consumerID # 可选字段。如果未提供，运行时将自动创建。
    value: "channel1"
  - name: clientID # 可选字段，用于 Kafka brokers 的客户端跟踪 ID。
    value: "my-dapr-app-id"
  - name: authType # 必需字段。
    value: "password"
  - name: saslUsername # 如果 authType 是 `password`，则必需。
    value: "adminuser"
  - name: saslPassword # 如果 authType 是 `password`，则必需。
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: saslMechanism
    value: "SHA-512"
  - name: maxMessageBytes # 可选字段。
    value: 1024
  - name: consumeRetryInterval # 可选字段。
    value: 200ms
  - name: heartbeatInterval # 可选字段。
    value: 5s
  - name: sessionTimeout # 可选字段。
    value: 15s
  - name: version # 可选字段。
    value: 2.0.0
  - name: disableTls # 可选字段。禁用 TLS。在生产环境中不安全！请阅读 `Mutual TLS` 部分以了解如何使用 TLS。
    value: "true"
  - name: consumerFetchMin # 可选字段。高级设置。请求中要获取的最小消息字节数 - broker 将等待直到至少有这么多可用。
    value: 1
  - name: consumerFetchDefault # 可选字段。高级设置。每个请求中从 broker 获取的默认消息字节数。
    value: 2097152
  - name: channelBufferSize # 可选字段。高级设置。内部和外部通道中要缓冲的事件数量。
    value: 512
  - name: schemaRegistryURL # 可选字段。当使用 Schema Registry Avro 序列化/反序列化时。Schema Registry URL。
    value: http://localhost:8081
  - name: schemaRegistryAPIKey # 可选字段。当使用 Schema Registry Avro 序列化/反序列化时。Schema Registry API Key。
    value: XYAXXAZ
  - name: schemaRegistryAPISecret # 可选字段。当使用 Schema Registry Avro 序列化/反序列化时。Schema Registry 凭证 API Secret。
    value: "ABCDEFGMEADFF"
  - name: schemaCachingEnabled # 可选字段。当使用 Schema Registry Avro 序列化/反序列化时。启用模式缓存。
    value: true
  - name: schemaLatestVersionCacheTTL # 可选字段。当使用 Schema Registry Avro 序列化/反序列化时。发布具有最新模式的消息时的模式缓存 TTL。
    value: 5m
  - name: escapeHeaders # 可选字段。
    value: false
```

> 有关使用 `secretKeyRef` 的详细信息，请参阅 [如何在组件中引用 secrets]({{< ref component-secrets.md >}}) 的指南。

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| brokers             | Y | 逗号分隔的 Kafka brokers 列表。 | `"localhost:9092,dapr-kafka.myapp.svc.cluster.local:9093"`
| consumerGroup       | N | 监听的 kafka 消费者组。发布到主题的每条记录都会传递给订阅该主题的每个消费者组中的一个消费者。如果提供了 `consumerGroup` 的值，则忽略 `consumerID` 的任何值 - 将为 `consumerID` 设置消费者组和随机唯一标识符的组合。 | `"group1"`
| consumerID       | N | 消费者 ID（消费者标签）将一个或多个消费者组织成一个组。具有相同消费者 ID 的消费者作为一个虚拟消费者工作；例如，消息仅由组中的一个消费者处理一次。如果未提供 `consumerID`，Dapr 运行时将其设置为 Dapr 应用程序 ID (`appID`) 值。如果提供了 `consumerGroup` 的值，则忽略 `consumerID` 的任何值 - 将为 `consumerID` 设置消费者组和随机唯一标识符的组合。  | 可以设置为字符串值（例如上例中的 `"channel1"`）或字符串格式值（例如 `"{podName}"` 等）。[查看您可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| clientID            | N | 用户提供的字符串，随每个请求发送到 Kafka brokers，用于日志记录、调试和审计。默认为 Kubernetes 模式的 `"namespace.appID"` 或 Self-Hosted 模式的 `"appID"`。 | `"my-namespace.my-dapr-app"`，`"my-dapr-app"`
| authRequired        | N | *已弃用* 启用 [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) 认证与 Kafka brokers。 | `"true"`，`"false"`
| authType            | Y | 配置或禁用认证。支持的值：`none`，`password`，`mtls`，`oidc` 或 `awsiam` | `"password"`，`"none"`
| saslUsername        | N | 用于认证的 SASL 用户名。仅在 `authType` 设置为 `"password"` 时需要。 | `"adminuser"`
| saslPassword        | N | 用于认证的 SASL 密码。可以是 `secretKeyRef` 以使用 [secret 引用]({{< ref component-secrets.md >}})。仅在 `authType` 设置为 `"password"` 时需要。 | `""`，`"KeFg23!"`
| saslMechanism      | N | 您希望使用的 SASL 认证机制。仅在 `authType` 设置为 `"password"` 时需要。默认为 `PLAINTEXT` | `"SHA-512", "SHA-256", "PLAINTEXT"`
| initialOffset       | N | 如果没有先前提交的偏移量，则使用的初始偏移量。应为 "newest" 或 "oldest"。默认为 "newest"。 | `"oldest"`
| maxMessageBytes     | N | 允许的单个 Kafka 消息的最大字节大小。默认为 1024。 | `2048`
| consumeRetryInterval | N | 尝试消费主题时的重试间隔。将没有后缀的数字视为毫秒。默认为 100ms。 | `200ms` |
| consumeRetryEnabled | N | 通过设置 `"false"` 禁用消费重试 | `"true"`，`"false"` |
| version               | N | Kafka 集群版本。默认为 2.0.0。请注意，如果您使用 Azure EventHubs 和 Kafka，则必须将其设置为 `1.0.0`。 | `0.10.2.0` |
| caCert | N | 证书颁发机构证书，使用 TLS 时需要。可以是 `secretKeyRef` 以使用 secret 引用 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert | N | 客户端证书，`authType` 为 `mtls` 时需要。可以是 `secretKeyRef` 以使用 secret 引用 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | N | 客户端密钥，`authType` 为 `mtls` 时需要。可以是 `secretKeyRef` 以使用 secret 引用 | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`
| skipVerify | N | 跳过 TLS 验证，不建议在生产中使用。默认为 `"false"` | `"true"`，`"false"` |
| disableTls | N | 禁用传输安全的 TLS。要禁用，您不需要将值设置为 `"true"`。不建议在生产中使用。默认为 `"false"`。 | `"true"`，`"false"` |
| oidcTokenEndpoint | N | OAuth2 身份提供者访问令牌端点的完整 URL。当 `authType` 设置为 `oidc` 时需要 | "https://identity.example.com/v1/token" |
| oidcClientID | N | 在身份提供者中配置的 OAuth2 客户端 ID。当 `authType` 设置为 `oidc` 时需要 | `dapr-kafka` |
| oidcClientSecret | N | 在身份提供者中配置的 OAuth2 客户端 secret：当 `authType` 设置为 `oidc` 时需要 | `"KeFg23!"` |
| oidcScopes | N | 用于请求访问令牌的 OAuth2/OIDC 范围的逗号分隔列表。当 `authType` 设置为 `oidc` 时推荐。默认为 `"openid"` | `"openid,kafka-prod"` |
| oidcExtensions | N | 包含 OAuth2/OIDC 扩展的 JSON 编码字典的字符串，用于请求访问令牌 | `{"cluster":"kafka","poolid":"kafkapool"}` |
| awsRegion | N | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中被弃用。请改用 'region'。Kafka 集群部署到的 AWS 区域。当 `authType` 设置为 `awsiam` 时需要 | `us-west-1` |
| awsAccessKey | N  |  这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中被弃用。请改用 'accessKey'。与 IAM 账户关联的 AWS 访问密钥。 | `"accessKey"`
| awsSecretKey | N  | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中被弃用。请改用 'secretKey'。与访问密钥关联的 secret 密钥。 | `"secretKey"`
| awsSessionToken | N  | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中被弃用。请改用 'sessionToken'。要使用的 AWS 会话令牌。仅在使用临时安全凭证时需要会话令牌。 | `"sessionToken"`
| awsIamRoleArn | N  | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中被弃用。请改用 'assumeRoleArn'。具有访问 AWS 管理的 Apache Kafka (MSK) 的 IAM 角色。这是除 AWS 凭证外的另一种与 MSK 认证的选项。 | `"arn:aws:iam::123456789:role/mskRole"`
| awsStsSessionName | N  | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中被弃用。请改用 'sessionName'。表示假设角色的会话名称。 | `"DaprDefaultSession"`
| schemaRegistryURL | N | 使用 Schema Registry Avro 序列化/反序列化时需要。Schema Registry URL。 | `http://localhost:8081` |
| schemaRegistryAPIKey | N | 使用 Schema Registry Avro 序列化/反序列化时。Schema Registry 凭证 API Key。 | `XYAXXAZ` |
| schemaRegistryAPISecret | N | 使用 Schema Registry Avro 序列化/反序列化时。Schema Registry 凭证 API Secret。 | `ABCDEFGMEADFF` |
| schemaCachingEnabled | N | 使用 Schema Registry Avro 序列化/反序列化时。启用模式缓存。默认为 `true` | `true` |
| schemaLatestVersionCacheTTL | N | 使用 Schema Registry Avro 序列化/反序列化时。发布具有最新模式的消息时的模式缓存 TTL。默认为 5 分钟 | `5m` |
| clientConnectionTopicMetadataRefreshInterval | N | 客户端连接的主题元数据与 broker 刷新的间隔，以 Go 持续时间表示。默认为 `9m`。 | `"4m"` |
| clientConnectionKeepAliveInterval | N | 客户端连接与 broker 保持活动的最长时间，以 Go 持续时间表示，然后关闭连接。零值（默认）表示无限期保持活动。 | `"4m"` |
| consumerFetchMin | N | 请求中要获取的最小消息字节数 - broker 将等待直到至少有这么多可用。默认值为 `1`，因为 `0` 会导致消费者在没有消息可用时旋转。相当于 JVM 的 `fetch.min.bytes`。 | `"2"` |
| consumerFetchDefault | N | 每个请求中从 broker 获取的默认消息字节数。默认值为 `"1048576"` 字节。 | `"2097152"` |
| channelBufferSize | N | 内部和外部通道中要缓冲的事件数量。这允许生产者和消费者在用户代码工作时继续在后台处理一些消息，从而大大提高吞吐量。默认为 `256`。 | `"512"` |
| heartbeatInterval | N | 向消费者协调器发送心跳的间隔。最多应将值设置为 `sessionTimeout` 值的 1/3。默认为 "3s"。 | `"5s"` |
| sessionTimeout | N | 使用 Kafka 的组管理功能时用于检测客户端故障的超时时间。如果 broker 在此会话超时之前未收到任何来自消费者的心跳，则消费者将被移除并启动重新平衡。默认为 "10s"。 | `"20s"` |
| escapeHeaders | N | 启用对消费者接收到的消息头值的 URL 转义。允许接收通常不允许在 HTTP 头中使用的特殊字符内容。默认为 `false`。 | `true` |

上面的 `secretKeyRef` 引用了一个 [kubernetes secrets store]({{< ref kubernetes-secret-store.md >}}) 以访问 tls 信息。访问 [此处]({{< ref setup-secret-store.md >}}) 了解有关如何配置 secret store 组件的更多信息。

#### 注意
使用 Azure EventHubs 和 Kafka 时，元数据 `version` 必须设置为 `1.0.0`。

### 认证

Kafka 支持多种认证方案，Dapr 支持几种：SASL 密码、mTLS、OIDC/OAuth2。随着添加的认证方法，`authRequired` 字段已从 v1.6 版本中弃用，取而代之的是 `authType` 字段。如果 `authRequired` 设置为 `true`，Dapr 将尝试根据 `saslPassword` 的值正确配置 `authType`。`authType` 的有效值为：
- `none`
- `password`
- `certificate`
- `mtls`
- `oidc`
- `awsiam`

{{% alert title="注意" color="primary" %}}
`authType` 仅用于 _认证_。_授权_ 仍在 Kafka 内配置，除了 `awsiam`，它还可以驱动在 AWS IAM 中配置的授权决策。
{{% /alert %}}

#### None

将 `authType` 设置为 `none` 将禁用任何认证。这在生产中*不推荐*。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-noauth
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # 必需字段，Kafka broker 连接设置
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # 可选字段，用于输入绑定。
    value: "group1"
  - name: clientID # 可选字段，用于 Kafka brokers 的客户端跟踪 ID。
    value: "my-dapr-app-id"
  - name: authType # 必需字段。
    value: "none"
  - name: maxMessageBytes # 可选字段。
    value: 1024
  - name: consumeRetryInterval # 可选字段。
    value: 200ms
  - name: heartbeatInterval # 可选字段。
    value: 5s
  - name: sessionTimeout # 可选字段。
    value: 15s
  - name: version # 可选字段。
    value: 0.10.2.0
  - name: disableTls
    value: "true"
```

#### SASL 密码

将 `authType` 设置为 `password` 启用 [SASL](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer) 认证。这需要设置 `saslUsername` 和 `saslPassword` 字段。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-sasl
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # 必需字段，Kafka broker 连接设置
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # 可选字段，用于输入绑定。
    value: "group1"
  - name: clientID # 可选字段，用于 Kafka brokers 的客户端跟踪 ID。
    value: "my-dapr-app-id"
  - name: authType # 必需字段。
    value: "password"
  - name: saslUsername # 如果 authType 是 `password`，则必需。
    value: "adminuser"
  - name: saslPassword # 如果 authType 是 `password`，则必需。
    secretKeyRef:
      name: kafka-secrets
      key: saslPasswordSecret
  - name: saslMechanism
    value: "SHA-512"
  - name: maxMessageBytes # 可选字段。
    value: 1024
  - name: consumeRetryInterval # 可选字段。
    value: 200ms
  - name: heartbeatInterval # 可选字段。
    value: 5s
  - name: sessionTimeout # 可选字段。
    value: 15s
  - name: version # 可选字段。
    value: 0.10.2.0
  - name: caCert
    secretKeyRef:
      name: kafka-tls
      key: caCert
```

#### Mutual TLS

将 `authType` 设置为 `mtls` 使用 x509 客户端证书（`clientCert` 字段）和密钥（`clientKey` 字段）进行认证。请注意，mTLS 作为认证机制与通过加密保护传输层的 TLS 使用是不同的。mTLS 需要 TLS 传输（意味着 `disableTls` 必须为 `false`），但保护传输层不需要使用 mTLS。请参阅 [使用 TLS 进行通信](#communication-using-tls) 以配置底层 TLS 传输。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-mtls
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # 必需字段，Kafka broker 连接设置
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # 可选字段，用于输入绑定。
    value: "group1"
  - name: clientID # 可选字段，用于 Kafka brokers 的客户端跟踪 ID。
    value: "my-dapr-app-id"
  - name: authType # 必需字段。
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
  - name: maxMessageBytes # 可选字段。
    value: 1024
  - name: consumeRetryInterval # 可选字段。
    value: 200ms
  - name: heartbeatInterval # 可选字段。
    value: 5s
  - name: sessionTimeout # 可选字段。
    value: 15s
  - name: version # 可选字段。
    value: 0.10.2.0
```

#### OAuth2 或 OpenID Connect

将 `authType` 设置为 `oidc` 启用通过 **OAUTHBEARER** 机制的 SASL 认证。这支持从外部 OAuth2 或 [OIDC](https://en.wikipedia.org/wiki/OpenID) 身份提供者指定一个持有者令牌。目前，仅支持 **client_credentials** 授权。

配置 `oidcTokenEndpoint` 为身份提供者访问令牌端点的完整 URL。

设置 `oidcClientID` 和 `oidcClientSecret` 为在身份提供者中配置的客户端凭证。

如果在组件配置中指定了 `caCert`，则证书将附加到系统 CA 信任中以验证身份提供者证书。同样，如果在组件配置中指定了 `skipVerify`，则在访问身份提供者时也将跳过验证。

默认情况下，令牌请求的唯一范围是 `openid`；强烈建议通过 `oidcScopes` 以逗号分隔的列表指定其他范围，并由 Kafka broker 验证。如果不使用其他范围来缩小访问令牌的有效性，
被破坏的 Kafka broker 可能会重放令牌以访问其他服务作为 Dapr clientID。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # 必需字段，Kafka broker 连接设置
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # 可选字段，用于输入绑定。
    value: "group1"
  - name: clientID # 可选字段，用于 Kafka brokers 的客户端跟踪 ID。
    value: "my-dapr-app-id"
  - name: authType # 必需字段。
    value: "oidc"
  - name: oidcTokenEndpoint # 如果 authType 是 `oidc`，则必需。
    value: "https://identity.example.com/v1/token"
  - name: oidcClientID      # 如果 authType 是 `oidc`，则必需。
    value: "dapr-myapp"
  - name: oidcClientSecret  # 如果 authType 是 `oidc`，则必需。
    secretKeyRef:
      name: kafka-secrets
      key: oidcClientSecret
  - name: oidcScopes        # 如果 authType 是 `oidc`，则推荐。
    value: "openid,kafka-dev"
  - name: caCert            # 也应用于验证 OIDC 提供者证书
    secretKeyRef:
      name: kafka-tls
      key: caCert
  - name: maxMessageBytes # 可选字段。
    value: 1024
  - name: consumeRetryInterval # 可选字段。
    value: 200ms
  - name: heartbeatInterval # 可选字段。
    value: 5s
  - name: sessionTimeout # 可选字段。
    value: 15s
  - name: version # 可选字段。
    value: 0.10.2.0
```

#### AWS IAM

支持使用 MSK 进行 AWS IAM 认证。将 `authType` 设置为 `awsiam` 使用 AWS SDK 生成认证令牌进行认证。
{{% alert title="注意" color="primary" %}}
唯一必需的元数据字段是 `region`。如果没有提供 `acessKey` 和 `secretKey`，您可以使用 AWS IAM 角色为服务账户提供无密码认证到您的 Kafka 集群。
{{% /alert %}}

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-awsiam
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # 必需字段，Kafka broker 连接设置
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # 可选字段，用于输入绑定。
    value: "group1"
  - name: clientID # 可选字段，用于 Kafka brokers 的客户端跟踪 ID。
    value: "my-dapr-app-id"
  - name: authType # 必需字段。
    value: "awsiam"
  - name: region # 必需字段。
    value: "us-west-1"
  - name: accessKey # 可选字段。
    value: <AWS_ACCESS_KEY>
  - name: secretKey # 可选字段。
    value: <AWS_SECRET_KEY>
  - name: sessionToken # 可选字段。
    value: <AWS_SESSION_KEY>
  - name: assumeRoleArn # 可选字段。
    value: "arn:aws:iam::123456789:role/mskRole"
  - name: sessionName # 可选字段。
    value: "DaprDefaultSession"
```

### 使用 TLS 进行通信

默认情况下，启用 TLS 以保护到 Kafka 的传输层。要禁用 TLS，请将 `disableTls` 设置为 `true`。启用 TLS 时，您可以
使用 `skipVerify` 控制服务器证书验证以禁用验证（*不推荐在生产环境中使用*）和 `caCert` 指定受信任的 TLS 证书颁发机构（CA）。如果没有指定 `caCert`，将使用系统 CA 信任。要配置 mTLS 认证，
请参阅 _认证_ 部分。
下面是一个配置为使用传输层 TLS 的 Kafka pubsub 组件示例：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # 必需字段，Kafka broker 连接设置
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # 可选字段，用于输入绑定。
    value: "group1"
  - name: clientID # 可选字段，用于 Kafka brokers 的客户端跟踪 ID。
    value: "my-dapr-app-id"
  - name: authType # 必需字段。
    value: "certificate"
  - name: consumeRetryInterval # 可选字段。
    value: 200ms
  - name: heartbeatInterval # 可选字段。
    value: 5s
  - name: sessionTimeout # 可选字段。
    value: 15s
  - name: version # 可选字段。
    value: 0.10.2.0
  - name: maxMessageBytes # 可选字段。
    value: 1024
  - name: caCert # 证书颁发机构证书。
    secretKeyRef:
      name: kafka-tls
      key: caCert
auth:
  secretStore: <SECRET_STORE_NAME>
```

## 从多个主题消费

当使用单个 pub/sub 组件从多个主题消费时，无法保证您的消费者组中的消费者如何在主题分区之间平衡。

例如，假设您订阅了两个主题，每个主题有 10 个分区，并且您有 20 个服务副本从这两个主题消费。无法保证 10 个将分配给第一个主题，10 个将分配给第二个主题。相反，分区可能会不均匀地划分，超过 10 个分配给第一个主题，其余分配给第二个主题。

这可能导致第一个主题的消费者空闲，而第二个主题的消费者过度扩展，反之亦然。当使用自动缩放器（如 HPA 或 KEDA）时，也可以观察到这种行为。

如果您遇到此特定问题，建议您为每个主题配置一个单独的 pub/sub 组件，并为每个组件定义唯一的消费者组。这可以确保您的服务的所有副本都完全分配给唯一的消费者组，其中每个消费者组针对一个特定主题。

例如，您可以定义两个 Dapr 组件，具有以下配置：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-topic-one
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: consumerGroup
    value: "{appID}-topic-one"
```

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-topic-two
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: consumerGroup
    value: "{appID}-topic-two"
```

## 发送和接收多条消息

Apache Kafka 组件支持使用批量 Pub/sub API 在单个操作中发送和接收多条消息。

### 配置批量订阅

订阅主题时，您可以配置 `bulkSubscribe` 选项。有关更多详细信息，请参阅 [批量订阅消息]({{< ref "pubsub-bulk#subscribing-messages-in-bulk" >}})。了解更多关于 [批量订阅 API]({{< ref pubsub-bulk.md >}}) 的信息。

Apache Kafka 支持以下批量元数据选项：

| 配置 | 默认值 |
|----------|---------|
| `maxBulkAwaitDurationMs` | `10000` (10s) |
| `maxBulkSubCount` | `80` |

## 每次调用的元数据字段

### 分区键

调用 Kafka pub/sub 时，可以通过在请求 URL 中使用 `metadata` 查询参数提供可选的分区键。

参数名称可以是 `partitionKey` 或 `__key`

示例：

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

所有其他元数据键/值对（不是 `partitionKey` 或 `__key`）都设置为 Kafka 消息中的头。以下是为消息设置 `correlationId` 的示例。

```shell
curl -X POST http://localhost:3500/v1.0/publish/myKafka/myTopic?metadata.correlationId=myCorrelationID&metadata.partitionKey=key1 \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```
### Kafka Pubsub 在消费者端接收到的特殊消息头

消费消息时，特殊消息元数据会自动作为头传递。这些是：
- `__key`：如果可用，消息键
- `__topic`：消息的主题
- `__partition`：消息的分区号
- `__offset`：消息在分区中的偏移量
- `__timestamp`：消息的时间戳

您可以在消费者端点中访问它们，如下所示：
{{< tabs "Python (FastAPI)" >}}

{{% codetab %}}

```python
from fastapi import APIRouter, Body, Response, status
import json
import sys

app = FastAPI()

router = APIRouter()


@router.get('/dapr/subscribe')
def subscribe():
    subscriptions = [{'pubsubname': 'pubsub',
                      'topic': 'my-topic',
                      'route': 'my_topic_subscriber',
                      }]
    return subscriptions

@router.post('/my_topic_subscriber')
def my_topic_subscriber(
      key: Annotated[str, Header(alias="__key")],
      offset: Annotated[int, Header(alias="__offset")],
      event_data=Body()):
    print(f"key={key} - offset={offset} - data={event_data}", flush=True)
      return Response(status_code=status.HTTP_200_OK)

app.include_router(router)

```

{{% /codetab %}}
{{< /tabs >}}

## 接收带有特殊字符的消息头

消费者应用程序可能需要接收包含特殊字符的消息头，这可能会导致 HTTP 协议验证错误。
HTTP 头值必须遵循规范，使得某些字符不被允许。[了解更多关于协议的信息](https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2)。
在这种情况下，您可以启用 `escapeHeaders` 配置设置，该设置使用 URL 转义在消费者端对头值进行编码。

{{% alert title="注意" color="primary" %}}
使用此设置时，接收到的消息头是 URL 转义的，您需要对其进行 URL "反转义" 以获得原始值。
{{% /alert %}}

将 `escapeHeaders` 设置为 `true` 以进行 URL 转义。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub-escape-headers
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers # 必需字段，Kafka broker 连接设置
    value: "dapr-kafka.myapp.svc.cluster.local:9092"
  - name: consumerGroup # 可选字段，用于输入绑定。
    value: "group1"
  - name: clientID # 可选字段，用于 Kafka brokers 的客户端跟踪 ID。
    value: "my-dapr-app-id"
  - name: authType # 必需字段。
    value: "none"
  - name: escapeHeaders
    value: "true"
```

## Avro Schema Registry 序列化/反序列化
您可以配置 pub/sub 以使用 [Avro 二进制序列化](https://avro.apache.org/docs/) 发布或消费数据，利用 [Apache Schema Registry](https://developer.confluent.io/courses/apache-kafka/schema-registry/)（例如，[Confluent Schema Registry](https://developer.confluent.io/courses/apache-kafka/schema-registry/)，[Apicurio](https://www.apicur.io/registry/)）。

### 配置

{{% alert title="重要" color="warning" %}}
目前，仅支持消息值的序列化/反序列化。由于不支持云事件，发布 Avro 消息时必须传递 `rawPayload=true` 元数据。
请注意，消费者不应设置 `rawPayload=true`，因为消息值将被包装到 CloudEvent 中并进行 base64 编码。将 `rawPayload` 保持为默认值（即 `false`）将以 JSON 负载的形式将 Avro 解码的消息发送到应用程序。
{{% /alert %}}

配置 Kafka pub/sub 组件元数据时，您必须定义：
- Schema Registry URL
- API key/secret（如果适用）

模式主题是根据主题名称自动派生的，使用标准命名约定。例如，对于名为 `my-topic` 的主题，模式主题将是 `my-topic-value`。
在服务中与消息负载交互时，它是 JSON 格式。负载在 Dapr 组件中透明地序列化/反序列化。
日期/日期时间字段必须作为其 [Epoch Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 等效值传递（而不是典型的 Iso8601）。例如：
- `2024-01-10T04:36:05.986Z` 应传递为 `1704861365986`（自 1970 年 1 月 1 日以来的毫秒数）
- `2024-01-10` 应传递为 `19732`（自 1970 年 1 月 1 日以来的天数）

### 发布 Avro 消息
为了向 Kafka pub/sub 组件指示消息应使用 Avro 序列化，必须在 `metadata` 中设置 `valueSchemaType` 为 `Avro`。

{{< tabs curl "Python SDK">}}

{{% codetab %}}
```bash
curl -X "POST" http://localhost:3500/v1.0/publish/pubsub/my-topic?metadata.rawPayload=true&metadata.valueSchemaType=Avro -H "Content-Type: application/json" -d '{"order_number": "345", "created_date": 1704861365986}'
```
{{% /codetab %}}

{{% codetab %}}
```python
from dapr.clients import DaprClient

with DaprClient() as d:
    req_data = {
        'order_number': '345',
        'created_date': 1704861365986
    }
    # 创建一个带有内容类型和主体的类型化消息
    resp = d.publish_event(
        pubsub_name='pubsub',
        topic_name='my-topic',
        data=json.dumps(req_data),
        publish_metadata={'rawPayload': 'true', 'valueSchemaType': 'Avro'}
    )
    # 打印请求
    print(req_data, flush=True)
```
{{% /codetab %}}

{{< /tabs >}}


### 订阅 Avro 主题
为了向 Kafka pub/sub 组件指示消息应使用 Avro 进行反序列化，必须在订阅元数据中设置 `valueSchemaType` 为 `Avro`。

{{< tabs "Python (FastAPI)" >}}

{{% codetab %}}

```python
from fastapi import APIRouter, Body, Response, status
import json
import sys

app = FastAPI()

router = APIRouter()


@router.get('/dapr/subscribe')
def subscribe():
    subscriptions = [{'pubsubname': 'pubsub',
                      'topic': 'my-topic',
                      'route': 'my_topic_subscriber',
                      'metadata': {
                          'valueSchemaType': 'Avro',
                      } }]
    return subscriptions

@router.post('/my_topic_subscriber')
def my_topic_subscriber(event_data=Body()):
    print(event_data, flush=True)
      return Response(status_code=status.HTTP_200_OK)

app.include_router(router)

```

{{% /codetab %}}

{{< /tabs >}} 



## 创建一个 Kafka 实例

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
您可以使用 [这个](https://github.com/wurstmeister/kafka-docker) Docker 镜像在本地运行 Kafka。
要在没有 Docker 的情况下运行，请参阅 [此处](https://kafka.apache.org/quickstart) 的入门指南。
{{% /codetab %}}

{{% codetab %}}
要在 Kubernetes 上运行 Kafka，您可以使用任何 Kafka operator，例如 [Strimzi](https://strimzi.io/quickstarts/)。
{{% /codetab %}}

{{< /tabs >}}


## 相关链接
- [Dapr 组件的基本模式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md##step-1-setup-the-pubsub-component" >}}) 了解配置 pub/sub 组件的说明
- [Pub/Sub 构建块]({{< ref pubsub >}})
