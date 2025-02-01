---
type: docs
title: "MQTT3"
linkTitle: "MQTT3"
description: "MQTT3 发布订阅组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-mqtt3/"
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-mqtt/"
---

## 组件格式

要配置一个MQTT3发布/订阅组件，请创建一个类型为`pubsub.mqtt3`的组件。请参阅[发布/订阅代理组件文件]({{< ref setup-pubsub.md >}})以了解如何自动生成ConsumerID。阅读[操作指南：发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})以了解如何创建和应用发布/订阅配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt3
  version: v1
  metadata:
    - name: url
      value: "tcp://[username][:password]@host.domain[:port]"
    # 可选
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
    - name: qos
      value: "1"
    - name: consumerID
      value: "channel1"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来管理密钥，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `url`    | Y  | MQTT broker的地址。可以使用`secretKeyRef`来引用密钥。<br> 对于非TLS通信，使用**`tcp://`** URI方案。<br> 对于TLS通信，使用**`ssl://`** URI方案。 | `"tcp://[username][:password]@host.domain[:port]"`
| `consumerID` | N | 用于连接到MQTT broker的客户端ID。默认为Dapr应用ID。 | 可以设置为字符串值（如上例中的`"channel1"`）或字符串格式值（如`"{podName}"`等）。[查看您可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| `retain` | N  | 定义消息是否由broker保存为指定主题的最后已知良好值。默认为`"false"`。 | `"true"`，`"false"`
| `cleanSession` | N | 如果为`"true"`，则在连接消息中设置`clean_session`标志到MQTT broker（[更多信息](http://www.steves-internet-guide.com/mqtt-clean-sessions-example/)）。默认为`"false"`。 | `"true"`，`"false"`
| `caCert` | 使用TLS时必需 | 用于验证服务器TLS证书的PEM格式的证书颁发机构（CA）证书。 | 参见下面的示例
| `clientCert`  | 使用TLS时必需 | PEM格式的TLS客户端证书。必须与`clientKey`一起使用。 | 参见下面的示例
| `clientKey` | 使用TLS时必需 | PEM格式的TLS客户端密钥。必须与`clientCert`一起使用。可以使用`secretKeyRef`来引用密钥。 | 参见下面的示例
| `qos`    | N  | 表示消息的服务质量级别（QoS）（[更多信息](https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/)）。默认为`1`。 |`0`，`1`，`2`

### 使用TLS进行通信

要配置使用TLS进行通信，请确保MQTT broker（例如emqx）配置为支持证书，并在组件配置中提供`caCert`，`clientCert`，`clientKey`元数据。例如：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt3
  version: v1
  metadata:
    - name: url
      value: "ssl://host.domain[:port]"
  # TLS配置
    - name: caCert
      value: |
        -----BEGIN CERTIFICATE-----
        ...
        -----END CERTIFICATE-----
    - name: clientCert
      value: |
        -----BEGIN CERTIFICATE-----
        ...
        -----END CERTIFICATE-----
    - name: clientKey
      secretKeyRef:
        name: myMqttClientKey
        key: myMqttClientKey
    # 可选
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
    - name: qos
      value: 1
```

请注意，虽然`caCert`和`clientCert`的值可能不是密钥，但为了方便起见，它们也可以从Dapr密钥存储中引用。

### 消费共享主题

在消费共享主题时，每个消费者必须有一个唯一标识符。默认情况下，应用ID用于唯一标识每个消费者和发布者。在selfhost模式下，调用每个`dapr run`时使用不同的应用ID即可让它们从同一个共享主题中消费。然而，在Kubernetes上，应用Pod的多个实例将共享相同的应用ID，禁止所有实例消费相同的主题。为了解决这个问题，可以在组件的`consumerID`元数据中配置一个`{uuid}`标签（这将在启动时为每个实例生成一个随机值）或`{podName}`（这将在Kubernetes上使用Pod的名称）。例如：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
spec:
  type: pubsub.mqtt3
  version: v1
  metadata:
    - name: consumerID
      value: "{uuid}"
    - name: cleanSession
      value: "true"
    - name: url
      value: "tcp://admin:public@localhost:1883"
    - name: qos
      value: 1
    - name: retain
      value: "false"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来管理密钥，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

请注意，在这种情况下，每次Dapr重启时，consumer ID的值都是随机的，因此您也应该将`cleanSession`设置为`true`。

建议使用[StatefulSets]({{< ref "howto-subscribe-statefulset.md" >}})进行共享订阅。

## 创建一个MQTT3 broker

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
您可以使用Docker在本地运行一个像emqx这样的MQTT broker：

```bash
docker run -d -p 1883:1883 --name mqtt emqx:latest
```

然后您可以使用客户端端口与服务器交互：`tcp://localhost:1883`
{{% /codetab %}}

{{% codetab %}}
您可以使用以下yaml在Kubernetes中运行一个MQTT3 broker：

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
          image: emqx:latest
          imagePullPolicy: IfNotPresent
          ports:
            - name: default
              containerPort: 1883
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
```

然后您可以使用客户端端口与服务器交互：`tcp://mqtt-broker.default.svc.cluster.local:1883`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Dapr组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})以获取配置发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
