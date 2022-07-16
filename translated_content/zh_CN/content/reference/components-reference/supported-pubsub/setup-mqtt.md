---
type: docs
title: "MQTT"
linkTitle: "MQTT"
description: "关于MQTT pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-mqtt/"
---

## 配置

要安装MQTT pubsub，请创建一个类型为`pubsub.mqtt`的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。

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
    value: "true"
  - name: backOffMaxRetries
    value: "0"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                |    必填    | 详情                                                                                                                              | 示例                                                                                                 |
| ----------------- |:--------:| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| url               |    是     | MQTT broker地址. 可以用`secretKeyRef`来引用密钥。 <br> 使用 **`tcp://`** URI 格式进行非 TLS 通信。 <br> 使用 **`ssl://`** URI 格式进行 TLS 通信。 | `"tcp://\[username\]\[:password\]@host.domain[:port]"`                                         |
| consumerID        |    否     | 用于连接到 MQTT 代理的客户端 ID。 默认为 Dapr 应用 ID。                                                                                           | `"myMqttClientApp"`                                                                                |
| qos               |    否     | 表示消息的服务质量等级（QoS）， 默认值 0 默认值为 `0`。                                                                                               | `1`                                                                                                |
| retain            |    否     | 定义消息是否被broker保存为指定主题的最后已知有效值 默认值为 `"false"` 默认值为 `"false"`.                                                                     | `"true"`, `"false"`                                                                                |
| cleanSession      |    N     | 如果为 `"true"`，设置连接到 MQTT 代理的连接消息中的 `clean_session` 标志。 默认为 `"true"`。                                                             | `"true"`, `"false"`                                                                                |
| caCert            | 使用TLS时需要 | PEM 格式的证书颁发机构 （CA） 证书，用于验证服务器 TLS 证书。                                                                                           | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientCert        | 使用TLS时需要 | PEM格式的客户端TLS证书。 必须同`clientKey`一起使用。                                                                                             | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientKey         | 使用TLS时需要 | PEM格式的客户端TLS密钥。 Must be used with `clientCert`. 可以用`secretKeyRef`来引用密钥。                                                         | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"` |
| backOffMaxRetries |    N     | 返回错误前重试处理消息的最大次数。 默认为`"0"`, 即不尝试重试。 可以指定为`“-1”` ，表示应该无限期地重试消息，直到它们被成功处理或应用程序关闭。 组件在每次重试之前将等待5秒钟。                                | `"3"`                                                                                              |

### 使用 TLS 通信

要配置使用TLS进行通信，确保MQTT代理(例如mosquitto)配置为支持证书并且在组件配置中提供了`caCert`, `clientCert`, `clientKey`元数据。 例如:

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
    value: "ssl://host.domain[:port]"
  - name: qos
    value: 1
  - name: retain
    value: "false"
  - name: cleanSession
    value: "false"
  - name: backoffMaxRetries
    value: "0"
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

备注： `caCert` and `clientCert`的值可能不是私密的，为了便利，他们也可以被Dapr秘钥存储引用。

### 消费共享主题

当消费一个共享主题时，每个消费者必须有一个唯一的标识符。 默认情况下，应用程序 ID 用于唯一标识每个消费者和发布者。 在自我托管模式中，用不同的应用程序ID调用每个 `dapr run` ，就足以让它们从同一个共享主题中消费。 然而在Kubernetes上，一个有多个应用实例的pod共享同一个应用Id，这阻碍了所有实例消费同一个主题。 为了克服这个问题，请用`{uuid}`标签配置组件的`ConsumerID`元数据，使每个实例在启动时有一个随机生成的`ConsumerID`值。 例如:

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
    - name: backoffMaxRetries
      value: "0"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
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
