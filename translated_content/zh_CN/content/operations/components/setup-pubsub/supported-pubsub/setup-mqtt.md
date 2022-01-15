---
type: docs
title: "MQTT"
linkTitle: "MQTT"
description: "关于MQTT pubsub组件的详细文档"
---

## 配置

要安装MQTT pubsub，请创建一个类型为`pubsub.mqtt`的组件。 See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
  namespace: default
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
```
## 元数据字段规范

| 字段           |    必填    | 详情                                                                      | 示例                                                                                                                                       |
| ------------ |:--------:| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| url          |    Y     | MQTT broker地址                                                           | 非TLS通信： `**tcp://**`，   TLS通信：`**tcps://**`。   TLS通信：`**tcps://**`。  <br> "tcp://\[username\]\[:password\]@host.domain[:port]" |
| qos          |    否     | 表示消息的服务质量等级（QoS）， 默认值 0 默认值 0                                           | `1`                                                                                                                                      |
| retain       |    否     | 定义消息是否被broker保存为指定主题的最后已知有效值 默认值为 `"false"` 默认值为 `"false"`              | `"true"`, `"false"`                                                                                                                      |
| cleanSession |    否     | 将在客户端连接到MQTT broker时，在连接消息中设置 "clean session" 默认: `"true"` 默认: `"true"` | `"true"`, `"false"`                                                                                                                      |
| caCert       | 使用TLS时需要 | 授权， 授权， 可以用`secretKeyRef`来引用                                            | `0123456789-0123456789`                                                                                                                  |
| clientCert   | 使用TLS时需要 | 客户端证书， 可以用`secretKeyRef`来引用                                             | `0123456789-0123456789`                                                                                                                  |
| clientKey    | 使用TLS时需要 | 客户端键， 可以用`secretKeyRef`来引用                                              | `012345`                                                                                                                                 |


### 使用 TLS 通信
要配置使用 TLS 通信，需配置并确保mosquitto broker支持凭证。 前提条件包括`certficate authority certificate`、`ca issued client certificate`、`client private key`。 参见下面的示例。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-pubsub
  namespace: default
spec:
  type: pubsub.mqtt
  version: v1
  metadata:
  - name: url
    value: "tcps://host.domain[:port]"
  - name: qos
    value: 1
  - name: retain
    value: "false"
  - name: cleanSession
    value: "false"
  - name: caCert
    value: ''
  - name: clientCert
    value: ''
  - name: clientKey
    value: ''
```

### 消费共享主题

当消费一个共享主题时，每个消费者必须有一个唯一的标识符。 默认情况下，应用ID用于唯一标识每个消费者和发布者。 在自托管模式下，用不同的应用程序Id运行每个Dapr运行就足以让它们从同一个共享主题消费。 然而在Kubernetes上，一个有多个应用实例的pod共享同一个应用Id，这阻碍了所有实例消费同一个主题。 为了克服这个问题，请用`{uuid}`标签配置组件的`ConsumerID`元数据，使每个实例在启动时有一个随机生成的`ConsumerID`值。 例如:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
  namespace: default
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
      value: "false"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}


## 创建一个 MQTT broker

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
你可以使用Docker[本地运行MQTT broker](https://hub.docker.com/_/eclipse-mosquitto):

```bash
docker run -d -p 1883:1883 -p 9001:9001 --name mqtt eclipse-mosquitto:1.6.9
```
然后你可以通过`mqtt://localhost:1883`与服务器交互
{{% /codetab %}}

{{% codetab %}}
你可以使用下面的yaml在kubernetes中运行一个MQTT broker:

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
          image: eclipse-mosquitto:1.6.9
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
然后你可以通过`tcp://mqtt-broker.default.svc.cluster.local:1883`与服务器交互。
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
