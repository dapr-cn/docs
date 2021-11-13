---
type: docs
title: "Apache Kafka"
linkTitle: "Apache Kafka"
description: "关于Apache Kafka pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-apache-kafka/"
---

## 配置

要设置Apache Kafka pubsub，请创建一个`pubsub.kafka`类型的组件。 See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

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
      # Kafka broker connection setting
    - name: brokers
      value: "dapr-kafka.myapp.svc.cluster.local:9092"
    - name: authRequired
      value: "true"
    - name: saslUsername
      value: "adminuser"
    - name: saslPassword
      value: "KeFg23!"
    - name: maxMessageBytes
      value: 1024
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段              | 必填 | 详情                                                                                                                                                   | Example                                                     |
| --------------- |:--:| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| brokers         | Y  | 逗号分隔的kafka broker列表                                                                                                                                  | `localhost:9092`, `dapr-kafka.myapp.svc.cluster.local:9092` |
| authRequired    | N  | 在Kafka broker上启用验证。 默认值为 `"false"`.                                                                                                                  | `"true"`, `"false"`                                         |
| saslUsername    | N  | 用于认证的用户名。 只有当 authRequired 设置为 true 时才需要。                                                                                                            | `"adminuser"`                                               |
| saslPassword    | N  | 用于认证的密码。 可以用`secretKeyRef`来引用密钥。 只有当 authRequired 设置为 true 时才需要。 Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}) | `""`, `"KeFg23!"`                                           |
| maxMessageBytes | N  | 单条Kafka消息允许的最大消息大小。 默认值为 1024。                                                                                                                       | `2048`                                                      |

## 每次调用的元数据字段

### 分区键

当调用Kafka 发布/订阅时，可以通过在请求url中使用`metadata`查询参数来提供一个可选的分区键。

参数名是`partitionKey`。

You can run Kafka locally using [this](https://github.com/wurstmeister/kafka-docker) Docker image. To run without Docker, see the getting started guide [here](https://kafka.apache.org/quickstart).

```shell
curl -X POST http://localhost:3500/v1.0/publish/myKafka/myTopic?metadata.partitionKey=key1 \
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
- Read [this guide]({{< ref "howto-publish-subscribe.md##step-1-setup-the-pubsub-component" >}}) for instructions on configuring pub/sub components
- [发布/订阅构建块]({{< ref pubsub >}})