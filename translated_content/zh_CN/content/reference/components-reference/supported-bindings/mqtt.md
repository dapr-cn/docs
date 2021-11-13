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
    value: mqtt[s]://[username][:password]@host.domain[:port]
  - name: topic
    value: topic1
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段    | 必填 | 绑定支持         | 详情                                       | Example                                                |
| ----- |:--:| ------------ | ---------------------------------------- | ------------------------------------------------------ |
| url   | Y  | Input/Output | The MQTT broker url                      | `"mqtt[s]://[username][:password]@host.domain[:port]"` |
| topic | Y  | Input/Output | The topic to listen on or send events to | `"mytopic"`                                            |

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
