---
type: docs
title: "MQTT"
linkTitle: "MQTT"
description: "关于MQTT pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-mqtt/"
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
    value: "true"
  - name: backOffMaxRetries
    value: "0"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段                |    必填    | 详情                                                                                                                                                                                                                                                                                                                                                          | 示例                                                                                                 |
| ----------------- |:--------:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| url               |    Y     | MQTT broker地址. 可以用`secretKeyRef`来引用密钥。 <br> Use the **`tcp://`** URI scheme for non-TLS communication. <br> Use the **`ssl://`** URI scheme for TLS communication.                                                                                                                                                                              | `"tcp://\[username\]\[:password\]@host.domain[:port]"`                                         |
| consumerID        |    N     | The client ID used to connect to the MQTT broker. Defaults to the Dapr app ID.                                                                                                                                                                                                                                                                              | `"myMqttClientApp"`                                                                                |
| qos               |    N     | 表示消息的服务质量等级（QoS）， 默认值 0 Defaults to `0`.                                                                                                                                                                                                                                                                                                                    | `1`                                                                                                |
| retain            |    N     | 定义消息是否被broker保存为指定主题的最后已知有效值 默认值为 `"false"` 默认值为 `"false"`.                                                                                                                                                                                                                                                                                                 | `"true"`, `"false"`                                                                                |
| cleanSession      |    N     | Sets the `clean_session` flag in the connection message to the MQTT broker if `"true"`. Defaults to `"true"`.                                                                                                                                                                                                                                               | `"true"`, `"false"`                                                                                |
| caCert            | 使用TLS时需要 | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates.                                                                                                                                                                                                                                                                 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientCert        | 使用TLS时需要 | TLS client certificate in PEM format. Must be used with `clientKey`.                                                                                                                                                                                                                                                                                        | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientKey         | 使用TLS时需要 | TLS client key in PEM format. Must be used with `clientCert`. 可以用`secretKeyRef`来引用密钥。                                                                                                                                                                                                                                                                       | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"` |
| backOffMaxRetries |    N     | The maximum number of retries to process the message before returning an error. Defaults to `"0"`, which means that no retries will be attempted. `"-1"` can be specified to indicate that messages should be retried indefinitely until they are successfully processed or the application is shutdown. The component will wait 5 seconds between retries. | `"3"`                                                                                              |

### 使用 TLS 通信

To configure communication using TLS, ensure that the MQTT broker (e.g. mosquitto) is configured to support certificates and provide the `caCert`, `clientCert`, `clientKey` metadata in the component configuration. 例如:

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

Note that while the `caCert` and `clientCert` values may not be secrets, they can be referenced from a Dapr secret store as well for convenience.

### 消费共享主题

当消费一个共享主题时，每个消费者必须有一个唯一的标识符。 By default, the application ID is used to uniquely identify each consumer and publisher. In self-hosted mode, invoking each `dapr run` with a different application ID is sufficient to have them consume from the same shared topic. However, on Kubernetes, multiple instances of an application pod will share the same application ID, prohibiting all instances from consuming the same topic. To overcome this, configure the component's `consumerID` metadata with a `{uuid}` tag, which will give each instance a randomly generated `consumerID` value on start up. 例如:

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
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
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
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [发布/订阅构建块]({{< ref pubsub >}})
