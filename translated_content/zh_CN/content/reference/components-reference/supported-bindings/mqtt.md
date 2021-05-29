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
    value: "topic1"
  - name: qos
    value: 1
  - name: retain
    value: "false"
  - name: cleanSession
    value: "false"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段           |    必填    | 绑定支持         | 详情                                                                      | Example                                                                                                                                                           |
| ------------ |:--------:| ------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| url          |    Y     | Input/Output | MQTT broker地址                                                           | 非TLS通信： `**tcp://**`，   TLS通信：`**tcps://**`。   Use`**ssl://**` scheme for TLS communication.  <br> "tcp://\[username\]\[:password\]@host.domain[:port]" |
| topic        |    Y     | Input/Output | The topic to listen on or send events to                                | `"mytopic"`                                                                                                                                                       |
| qos          |    N     | Input/Output | 表示消息的服务质量等级（QoS）， 默认值 0 默认值 0                                           | `1`                                                                                                                                                               |
| retain       |    N     | Input/Output | 定义消息是否被broker保存为指定主题的最后已知有效值 默认值为 `"false"` 默认值为 `"false"`              | `"true"`, `"false"`                                                                                                                                               |
| cleanSession |    N     | Input/Output | 将在客户端连接到MQTT broker时，在连接消息中设置 "clean session" 默认: `"true"` 默认: `"true"` | `"true"`, `"false"`                                                                                                                                               |
| caCert       | 使用TLS时需要 | Input/Output | 授权， 可以用`secretKeyRef`来引用密钥。                                             | `0123456789-0123456789`                                                                                                                                           |
| clientCert   | 使用TLS时需要 | Input/Output | 客户端证书， 可以用`secretKeyRef`来引用密钥。                                          | `0123456789-0123456789`                                                                                                                                           |
| clientKey    | 使用TLS时需要 | Input/Output | 客户端键， 可以用`secretKeyRef`来引用密钥。                                           | `012345`                                                                                                                                                          |

### 使用 TLS 通信
要配置使用 TLS 通信，需配置并确保mosquitto broker支持凭证。 前提条件包括`certficate authority certificate`、`ca issued client certificate`、`client private key`。 参见下面的示例。

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
