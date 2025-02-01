---
type: docs
title: "MQTT3 绑定规范"
linkTitle: "MQTT3"
description: "关于 MQTT3 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/mqtt3/"
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/mqtt/"
---

## 组件格式

要设置 MQTT3 绑定，需要创建一个类型为 `bindings.mqtt3` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.mqtt3
  version: v1
  metadata:
    - name: url
      value: "tcp://[username][:password]@host.domain[:port]"
    - name: topic
      value: "mytopic"
    - name: consumerID
      value: "myapp"
    # 以下字段是可选的：
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
    - name: backOffMaxRetries
      value: "0"
    - name: direction
      value: "input, output"
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用 secret 存储来保护这些信息，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|---------|
| `url`    | Y  | 输入/输出 | MQTT broker 的地址。可以使用 `secretKeyRef` 来引用 secret。<br> 对于非 TLS 通信，使用 **`tcp://`** URI 方案。<br> 对于 TLS 通信，使用 **`ssl://`** URI 方案。 | `"tcp://[username][:password]@host.domain[:port]"`
| `topic`  | Y | 输入/输出 | 要监听或发送事件的主题。 | `"mytopic"` |
| `consumerID` | Y | 输入/输出 | 用于连接到 MQTT broker 的客户端 ID。 | `"myMqttClientApp"`
| `retain` | N  | 输入/输出 | 定义消息是否由 broker 保存为指定主题的最后已知良好值。默认为 `"false"`。  | `"true"`, `"false"`
| `cleanSession` | N | 输入/输出 | 如果为 `"true"`，则在连接消息中设置 `clean_session` 标志到 MQTT broker。默认为 `"false"`。  | `"true"`, `"false"`
| `caCert` | 使用 TLS 时必需 | 输入/输出 | 用于验证服务器 TLS 证书的 PEM 格式的证书颁发机构 (CA) 证书。 | 见下例
| `clientCert`  | 使用 TLS 时必需 | 输入/输出 | PEM 格式的 TLS 客户端证书。必须与 `clientKey` 一起使用。 | 见下例
| `clientKey` | 使用 TLS 时必需 | 输入/输出 | PEM 格式的 TLS 客户端密钥。必须与 `clientCert` 一起使用。可以使用 `secretKeyRef` 来引用 secret。 | 见下例
| `backOffMaxRetries` | N | 输入 | 在返回错误之前处理消息的最大重试次数。默认为 `"0"`，表示不会尝试重试。可以指定 `"-1"` 表示消息应无限期重试，直到成功处理或应用程序关闭。组件将在重试之间等待 5 秒。 | `"3"`
| `direction` | N | 输入/输出 | 绑定的方向 | `"input"`, `"output"`, `"input, output"`

### 使用 TLS 进行通信

要配置使用 TLS 的通信，请确保 MQTT broker（例如 emqx）配置为支持证书，并在组件配置中提供 `caCert`、`clientCert`、`clientKey` 元数据。例如：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-binding
spec:
  type: bindings.mqtt3
  version: v1
  metadata:
    - name: url
      value: "ssl://host.domain[:port]"
    - name: topic
      value: "topic1"
    - name: consumerID
      value: "myapp"
    # TLS 配置
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
    # 以下字段是可选的：
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
    - name: backoffMaxRetries
      value: "0"
```

> 注意，虽然 `caCert` 和 `clientCert` 的值可能不是 secret，但为了方便起见，它们也可以从 Dapr secret 存储中引用。

### 消费共享主题

在消费共享主题时，每个消费者必须有一个唯一的标识符。如果运行多个应用程序实例，可以在组件的 `consumerID` 元数据中配置一个 `{uuid}` 标签，这将在启动时为每个实例提供一个随机生成的 `consumerID` 值。例如：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mqtt-binding
  namespace: default
spec:
  type: bindings.mqtt3
  version: v1
  metadata:
  - name: consumerID
    value: "{uuid}"
  - name: url
    value: "tcp://admin:public@localhost:1883"
  - name: topic
    value: "topic1"
  - name: retain
    value: "false"
  - name: cleanSession
    value: "true"
  - name: backoffMaxRetries
    value: "0"
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用 secret 存储来保护这些信息，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

> 在这种情况下，每次 Dapr 重启时，消费者 ID 的值都是随机的，因此您也应该将 `cleanSession` 设置为 `true`。

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

此组件支持以下操作的 **输出绑定**：

- `create`: 发布新消息

## 每次请求设置主题

您可以在每次请求时覆盖组件元数据中的主题：

```json
{
  "operation": "create",
  "metadata": {
    "topic": "myTopic"
  },
  "data": "<h1>测试 Dapr 绑定</h1>这是一个测试。<br>再见！"
}
```

## 每次请求设置保留属性

您可以在每次请求时覆盖组件元数据中的保留属性：

```json
{
  "operation": "create",
  "metadata": {
    "retain": "true"
  },
  "data": "<h1>测试 Dapr 绑定</h1>这是一个测试。<br>再见！"
}
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
