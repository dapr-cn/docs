---
type: docs
title: "MQTT绑定规范"
linkTitle: "MQTT"
description: "MQTT 组件绑定详细说明"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/mqtt/"
---

## 配置

需要创建一个`bindings.mqtt`类型的组件去设置MQTT绑定。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                |    必填    | 绑定支持  | 详情                                                                                                                              | 示例                                                                                                 |
| ----------------- |:--------:| ----- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| url               |    是     | 输入/输出 | MQTT broker地址. 可以用`secretKeyRef`来引用密钥。 <br> 使用 **`tcp://`** URI 格式进行非 TLS 通信。 <br> 使用 **`ssl://`** URI 格式进行 TLS 通信。 | `"tcp://\[username\]\[:password\]@host.domain[:port]"`                                         |
| topic             |    是     | 输入/输出 | 监听或者发送事件目标topic                                                                                                                 | `"mytopic"`                                                                                        |
| consumerID        |    否     | 输入/输出 | 用于连接到 MQTT 代理的客户端 ID。 默认为 Dapr 应用 ID。                                                                                           | `"myMqttClientApp"`                                                                                |
| qos               |    否     | 输入/输出 | 表示消息的服务质量等级（QoS）， 默认值 0 默认值为 `0`。                                                                                               | `1`                                                                                                |
| retain            |    否     | 输入/输出 | 定义消息是否被broker保存为指定主题的最后已知有效值 默认值为 `"false"` 默认值为 `"false"`.                                                                     | `"true"`, `"false"`                                                                                |
| cleanSession      |    否     | 输入/输出 | 如果为 `"true"`，设置连接到 MQTT 代理的连接消息中的 `clean_session` 标志。 默认为 `"true"`。                                                             | `"true"`, `"false"`                                                                                |
| caCert            | 使用TLS时需要 | 输入/输出 | 用于验证服务端TLS证书的PEM格式的Certificate Authority (CA) 证书                                                                                | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientCert        | 使用TLS时需要 | 输入/输出 | PEM格式的客户端TLS证书 必须同`clientKey`一起使用                                                                                               | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`           |
| clientKey         | 使用TLS时需要 | 输入/输出 | PEM格式的客户端TLS密钥。 必须同`clientCert`一起使用。 可以用`secretKeyRef`来引用密钥。                                                                    | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"` |
| backOffMaxRetries |    否     | 输入    | 返回错误前重试处理消息的最大次数。 默认为`"0"`, 即不尝试重试。 可以指定为`“-1”` ，表示应该无限期地重试消息，直到它们被成功处理或应用程序关闭。 组件在每次重试之前将等待5秒钟。                                | `"3"`                                                                                              |

### 使用 TLS 通信

要配置使用TLS进行通信，确保MQTT代理(例如mosquitto)配置为支持证书并且在组件配置中提供了`caCert`, `clientCert`, `clientKey`元数据。 例如:

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

备注： `caCert` and `clientCert`的值可能不是私密的，为了便利，他们也可以被Dapr秘钥存储引用。

### 消费共享主题

当消费一个共享主题时，每个消费者必须有一个唯一的标识符。 默认，应用ID会被用来作为每个消费者和发布者的唯一标识。 在自托管模式下，使用不通的应用ID调用每一个`dapr 运行时` 已经足够支持他们从同一个共享topic消费消息。 然而，在Kubernetes集群里，应用的多个实例POD将共享同一个应用ID，这将阻碍所有实例消费同一个话题。 为了客服这个问题，使用`{uuid}` 标签配置组件的`consumerID` 元数据，在实例启动时将为每个实例随机分配一个`consumerID`值。 例如:

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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持以下操作的 **输出**：

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
