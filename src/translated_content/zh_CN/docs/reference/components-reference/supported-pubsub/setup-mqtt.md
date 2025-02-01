---
type: docs
title: "MQTT"
linkTitle: "MQTT"
description: "MQTT pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-mqtt/"
---

## 组件格式

要配置MQTT pub/sub，您需要创建一个类型为`pubsub.mqtt`的组件。请参阅[pub/sub broker组件文件]({{< ref setup-pubsub.md >}})以了解ConsumerID的自动生成方式。阅读[操作指南：发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})以了解如何创建和应用pub/sub配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt
  version: v1
  metadata:
  - name: url
    value: "tcp://[username][:password]@host.domain[:port]"
  - name: qos
    value: 1
  - name: retain
    value: "false"
  - name: cleanSession
    value: "false"
  - name: consumerID
    value: "channel1"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保护密钥，详情请参阅[这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| url    | Y  | MQTT broker的地址。可以使用`secretKeyRef`来引用密钥。<br> 对于非TLS通信，使用**`tcp://`** URI方案。<br> 对于TLS通信，使用**`ssl://`** URI方案。 | `"tcp://[username][:password]@host.domain[:port]"`
| consumerID | N | 用于连接到MQTT broker的消费者连接的客户端ID。默认为Dapr应用ID。<br>注意：如果未设置`producerID`，则在此值后附加`-consumer`用于消费者连接 | 可以设置为字符串值（如上例中的`"channel1"`）或字符串格式值（如`"{podName}"`等）。[查看可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| producerID | N | 用于连接到MQTT broker的生产者连接的客户端ID。默认为`{consumerID}-producer`。 | `"myMqttProducerApp"`
| qos    | N  | 表示消息的服务质量级别（QoS）（[更多信息](https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/)）。默认为`1`。 |`0`, `1`, `2`
| retain | N  | 定义broker是否将消息保存为指定主题的最后已知良好值。默认为`"false"`。  | `"true"`, `"false"`
| cleanSession | N | 如果为`"true"`，则在连接消息中设置`clean_session`标志到MQTT broker（[更多信息](http://www.steves-internet-guide.com/mqtt-clean-sessions-example/)）。默认为`"false"`。  | `"true"`, `"false"`
| caCert | 使用TLS时必需 | 用于验证服务器TLS证书的证书颁发机构（CA）证书，格式为PEM。 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert  | 使用TLS时必需 | TLS客户端证书，格式为PEM。必须与`clientKey`一起使用。 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | 使用TLS时必需 | TLS客户端密钥，格式为PEM。必须与`clientCert`一起使用。可以使用`secretKeyRef`来引用密钥。 | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`

### 启用消息传递重试

MQTT pub/sub组件不支持内置的重试策略。这意味着sidecar只会向服务发送一次消息。如果服务标记消息为未处理，则消息不会被确认回broker。只有当broker重新发送消息时，才会重试。

要使Dapr使用更复杂的重试策略，可以将[重试弹性策略]({{< ref "policies.md#retries" >}})应用于MQTT pub/sub组件。

两种重试方式之间有一个关键区别：

1. 未确认消息的重新传递完全依赖于broker。Dapr不保证这一点。一些broker如[emqx](https://www.emqx.io/)、[vernemq](https://vernemq.com/)等支持它，但它不是[MQTT3规范](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718103)的一部分。

2. 使用[重试弹性策略]({{< ref "policies.md#retries" >}})使得同一个Dapr sidecar重试重新传递消息。因此是同一个Dapr sidecar和同一个应用接收相同的消息。

### 使用TLS进行通信

要配置使用TLS进行通信，请确保MQTT broker（例如，mosquitto）配置为支持证书，并在组件配置中提供`caCert`、`clientCert`、`clientKey`元数据。例如：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt
  version: v1
  metadata:
  - name: url
    value: "ssl://host.domain[:port]"
  - name: qos
    value: 1
  - name: retain
    value: "false"
  - name: cleanSession
    value: "false"
  - name: caCert
    value: ${{ myLoadedCACert }}
  - name: clientCert
    value: ${{ myLoadedClientCert }}
  - name: clientKey
    secretKeyRef:
      name: myMqttClientKey
      key: myMqttClientKey
auth:
  secretStore: <SECRET_STORE_NAME>
```

注意，虽然`caCert`和`clientCert`值可能不是密钥，但为了方便起见，它们也可以从Dapr密钥存储中引用。

### 消费共享主题

在消费共享主题时，每个消费者必须有一个唯一标识符。默认情况下，应用ID用于唯一标识每个消费者和发布者。在selfhost模式下，调用每个`dapr run`时使用不同的应用ID即可使它们从同一个共享主题中消费。然而，在Kubernetes上，应用pod的多个实例将共享相同的应用ID，禁止所有实例消费同一个主题。为了解决这个问题，配置组件的`consumerID`元数据为`{uuid}`标签，这将在启动时为每个实例提供一个随机生成的`consumerID`值。例如：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt
  version: v1
  metadata:
    - name: consumerID
      value: "{uuid}"
    - name: url
      value: "tcp://admin:public@localhost:1883"
    - name: qos
      value: 1
    - name: retain
      value: "false"
    - name: cleanSession
      value: "true"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保护密钥，详情请参阅[这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

注意，在这种情况下，每次Dapr重启时，consumer ID的值都是随机的，因此我们也将`cleanSession`设置为true。

## 创建MQTT broker

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
您可以[使用Docker本地运行](https://hub.docker.com/_/eclipse-mosquitto)MQTT broker：

```bash
docker run -d -p 1883:1883 -p 9001:9001 --name mqtt eclipse-mosquitto:1.6
```

然后您可以使用客户端端口与服务器交互：`mqtt://localhost:1883`
{{% /codetab %}}

{{% codetab %}}
您可以在kubernetes中使用以下yaml运行MQTT broker：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mqtt-broker
  labels:
    app-name: mqtt-broker
spec:
  replicas: 1
  selector:
    matchLabels:
      app-name: mqtt-broker
  template:
    metadata:
      labels:
        app-name: mqtt-broker
    spec:
      containers:
        - name: mqtt
          image: eclipse-mosquitto:1.6
          imagePullPolicy: IfNotPresent
          ports:
            - name: default
              containerPort: 1883
              protocol: TCP
            - name: websocket
              containerPort: 9001
              protocol: TCP
---
apiVersion: v1
kind: Service
metadata:
  name: mqtt-broker
  labels:
    app-name: mqtt-broker
spec:
  type: ClusterIP
  selector:
    app-name: mqtt-broker
  ports:
    - port: 1883
      targetPort: default
      name: default
      protocol: TCP
    - port: 9001
      targetPort: websocket
      name: websocket
      protocol: TCP
```

然后您可以使用客户端端口与服务器交互：`tcp://mqtt-broker.default.svc.cluster.local:1883`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Dapr组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})以获取配置pub/sub组件的说明
- [Pub/Sub构建块]({{< ref pubsub >}})
