---
type: docs
title: "MQTT binding spec"
linkTitle: "MQTT"
description: "Detailed documentation on the MQTT binding component"
---

## Component format

To setup MQTT binding create a component of type `bindings.mqtt`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段    | Required | Binding support | Details                                  | Example                                                |
| ----- |:--------:| --------------- | ---------------------------------------- | ------------------------------------------------------ |
| url   |    Y     | Input/Output    | The MQTT broker url                      | `"mqtt[s]://[username][:password]@host.domain[:port]"` |
| topic |    Y     | Input/Output    | The topic to listen on or send events to | `"mytopic"`                                            |

## 相关链接

This component supports both **input and output** binding interfaces.

字段名为 `ttlInSeconds`。

- `create`
## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
