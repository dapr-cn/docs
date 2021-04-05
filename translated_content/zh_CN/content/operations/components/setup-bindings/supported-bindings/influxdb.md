---
type: docs
title: "InfluxDB binding spec"
linkTitle: "InfluxDB"
description: "Detailed documentation on the InfluxDB binding component"
---

## Component format

To setup InfluxDB binding create a component of type `bindings.influx`. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.influx
  version: v1
  metadata:
  - name: url # Required
    value: <INFLUX-DB-URL>
  - name: token # Required
    value: <TOKEN>
  - name: org # Required
    value: <ORG>
  - name: bucket # Required
    value: <BUCKET>
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段     | Required | Binding support | Details                              | Example                   |
| ------ |:--------:| --------------- | ------------------------------------ | ------------------------- |
| url    |    Y     | Output          | The URL for the InfluxDB instance    | `"http://localhost:8086"` |
| token  |    Y     | Output          | The authorization token for InfluxDB | `"mytoken"`               |
| org    |    Y     | Output          | The InfluxDB organization            | `"myorg"`                 |
| bucket |    Y     | Output          | Bucket name to write to              | `"mybucket"`              |

## 相关链接

This component supports **output binding** with the following operations:

- `create`

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
