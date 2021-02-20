---
type: 文档
title: "MQTT binding spec"
linkTitle: "MQTT"
description: "Detailed documentation on the MQTT binding component"
---

## Introduction

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
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Input bindings

| 字段    | Required | Output Binding Supported Operations | Details                                              | Example:                                               |
| ----- |:--------:| ----------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| url   |    Y     | Input/Output                        | `url` is the MQTT broker url.                        | `"mqtt[s]://[username][:password]@host.domain[:port]"` |
| topic |    Y     | Input/Output                        | `topic` is the topic to listen on or send events to. | `"mytopic"`                                            |

## Output bindings

For input bindings, where the query matching Tweets are streamed to the user service, the above component has to also include a query:

字段名为 `ttlInSeconds`。

- `create`
## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
