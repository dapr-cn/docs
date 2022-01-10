---
type: docs
title: "MQTT binding spec"
linkTitle: "MQTT"
description: "Detailed documentation on the MQTT binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/mqtt/"
---

## 配置

To setup MQTT binding create a component of type `bindings.mqtt`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.mqtt
  version: v1
  metadata:
  - name: url
    value: "tcp://[username][:password]@host.domain[:port]"
  - name: topic
    value: "mytopic"
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

| 字段                |    必填    | 绑定支持         | 详情                                                                                                                                                                                                                                                                                                                                                          | 示例                                                                                                 |
| ----------------- |:--------:| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| url               |    Y     | Input/Output | MQTT broker地址. 可以用`secretKeyRef`来引用密钥。 <br> Use the **`tcp://`** URI scheme for non-TLS communication. <br> Use the **`ssl://`** URI scheme for TLS communication.                                                                                                                                                                              | `"tcp://\[username\]\[:password\]@host.domain[:port]"`                                         |
| topic             |    Y     | Input/Output | The topic to listen on or send events to.                                                                                                                                                                                                                                                                                                                   | `"mytopic"`                                                                                        |
| consumerID        |    N     | Input/Output | The client ID used to connect to the MQTT broker. Defaults to the Dapr app ID.                                                                                                                                                                                                                                                                              | `"myMqttClientApp"`                                                                                |
| qos               |    N     | Input/Output | 表示消息的服务质量等级（QoS）， 默认值 0 Defaults to `0`.                                                                                                                                                                                                                                                                                                                    | `1`                                                                                                |
| retain            |    N     | Input/Output | 定义消息是否被broker保存为指定主题的最后已知有效值 默认值为 `"false"` 默认值为 `"false"`.                                                                                                                                                                                                                                                                                                 | `"true"`, `"false"`                                                                                |
| cleanSession      |    N     | Input/Output | Sets the `clean_session` flag in the connection message to the MQTT broker if `"true"`. Defaults to `"true"`.                                                                                                                                                                                                                                               | `"true"`, `"false"`                                                                                |
| caCert            | 使用TLS时需要 | Input/Output | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates.                                                                                                                                                                                                                                                                 | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientCert        | 使用TLS时需要 | Input/Output | TLS client certificate in PEM format. Must be used with `clientKey`.                                                                                                                                                                                                                                                                                        | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientKey         | 使用TLS时需要 | Input/Output | TLS client key in PEM format. Must be used with `clientCert`. 可以用`secretKeyRef`来引用密钥。                                                                                                                                                                                                                                                                       | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"` |
| backOffMaxRetries |    N     | 输入           | The maximum number of retries to process the message before returning an error. Defaults to `"0"`, which means that no retries will be attempted. `"-1"` can be specified to indicate that messages should be retried indefinitely until they are successfully processed or the application is shutdown. The component will wait 5 seconds between retries. | `"3"`                                                                                              |

### 使用 TLS 通信

To configure communication using TLS, ensure that the MQTT broker (e.g. mosquitto) is configured to support certificates and provide the `caCert`, `clientCert`, `clientKey` metadata in the component configuration. 例如:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-binding
  namespace: default
spec:
  type: bindings.mqtt
  version: v1
  metadata:
  - name: url
    value: "ssl://host.domain[:port]"
  - name: topic
    value: "topic1"
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
  name: mqtt-binding
  namespace: default
spec:
  type: bindings.mqtt
  version: v1
  metadata:
  - name: consumerID
    value: "{uuid}"
  - name: url
    value: "tcp://admin:public@localhost:1883"
  - name: topic
    value: "topic1"
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

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

字段名为 `ttlInSeconds`。

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
