---
type: docs
title: "MQTT3"
linkTitle: "MQTT3"
description: "Detailed documentation on the MQTT3 pubsub component"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-mqtt3/"
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-mqtt/"
---

## Component format

To set up a MQTT3 pub/sub, create a component of type `pubsub.mqtt3`. See the [pub/sub broker component file]({{< ref setup-pubsub.md >}}) to learn how ConsumerID is automatically generated. Read the [How-to: Publish and Subscribe guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration.

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
    # Optional
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
    - name: qos
      value: "1"
    - name: consumerID
      value: "channel1"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field          | Required | 详情                                                                                                                                                                                                                   | 示例                                                 |
| -------------- |:--------:| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `url`          |    是     | Address of the MQTT broker. Can be `secretKeyRef` to use a secret reference. <br> Use the **`tcp://`** URI scheme for non-TLS communication. <br> Use the **`ssl://`** URI scheme for TLS communication. | `"tcp://[username][:password]@host.domain[:port]"` |
| `consumerID`   |    否     | 用于连接到 MQTT 代理的客户端 ID。 默认为 Dapr 应用 ID。                                                                                                                                                                                | `"myMqttClientApp"`                                |
| `retain`       |    否     | 定义消息是否被broker保存为指定主题的最后已知有效值 默认值为 `"false"` Defaults to `"false"`.                                                                                                                                                   | `"true"`, `"false"`                                |
| `cleanSession` |    否     | Sets the `clean_session` flag in the connection message to the MQTT broker if `"true"` ([more info](http://www.steves-internet-guide.com/mqtt-clean-sessions-example/)). Defaults to `"false"`.                      | `"true"`, `"false"`                                |
| `caCert`       | 使用TLS时需要 | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates.                                                                                                                          | See example below                                  |
| `clientCert`   | 使用TLS时需要 | TLS client certificate in PEM format. Must be used with `clientKey`.                                                                                                                                                 | See example below                                  |
| `clientKey`    | 使用TLS时需要 | TLS client key in PEM format. Must be used with `clientCert`. Can be `secretKeyRef` to use a secret reference.                                                                                                       | See example below                                  |
| `qos`          |    否     | Indicates the Quality of Service Level (QoS) of the message ([more info](https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/)). Defaults to `1`.                                      | `0`, `1`, `2`                                      |

### Communication using TLS

To configure communication using TLS, ensure that the MQTT broker (for example, emqx) is configured to support certificates and provide the `caCert`, `clientCert`, `clientKey` metadata in the component configuration. 例如：

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
  # TLS configuration
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
    # Optional
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
    - name: qos
      value: 1
```

备注： `caCert` 和 `clientCert`的值可能不是私密的，为了便利，他们也可以被Dapr秘钥存储引用。

### 消费共享主题

When consuming a shared topic, each consumer must have a unique identifier. 默认情况下，应用程序 ID 用于唯一标识每个消费者和发布者。 在自我托管模式中，用不同的应用程序ID调用每个 `dapr run` ，就足以让它们从同一个共享主题中消费。 然而在Kubernetes上，一个有多个应用实例的pod共享同一个应用Id，这阻碍了所有实例消费同一个主题。 To overcome this, configure the component's `consumerID` metadata with a `{uuid}` tag (which will give each instance a randomly generated value on start up) or `{podName}` (which will use the Pod's name on Kubernetes). For example:

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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

Note that in the case, the value of the consumer ID is random every time Dapr restarts, so you should set `cleanSession` to `true` as well.

It is recommended to use [StatefulSets]({{< ref "howto-subscribe-statefulset.md" >}}) with shared subscriptions.

## Create a MQTT3 broker

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run a MQTT broker like emqx [locally using Docker](https://hub.docker.com/_/emqx):

```bash
docker run -d -p 1883:1883 --name mqtt emqx:latest
```

You can then interact with the server using the client port: `tcp://localhost:1883`
{{% /codetab %}}

{{% codetab %}}
You can run a MQTT3 broker in kubernetes using following yaml:

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

You can then interact with the server using the client port: `tcp://mqtt-broker.default.svc.cluster.local:1883`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
