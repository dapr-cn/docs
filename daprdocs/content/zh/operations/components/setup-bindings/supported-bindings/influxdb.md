---
type: 文档
title: "InfluxDB binding spec"
linkTitle: "InfluxDB"
description: "Detailed documentation on the InfluxDB binding component"
---

## Introduction

To setup InfluxDB binding create a component of type `bindings.influx`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Input bindings

| 字段     | Required | Output Binding Supported Operations | Details                                                               | Example:                  |
| ------ |:--------:| ----------------------------------- | --------------------------------------------------------------------- | ------------------------- |
| url    |    Y     | Output                              | `url` is the URL for the InfluxDB instance. eg. http://localhost:8086 | `"http://localhost:8086"` |
| token  |    Y     | Output                              | `token` is the authorization token for InfluxDB.                      | `"mytoken"`               |
| org    |    Y     | Output                              | `org` is the InfluxDB organization.                                   | `"myorg"`                 |
| bucket |    Y     | Output                              | `bucket` bucket name to write to.                                     | `"mybucket"`              |

## Output bindings

This component supports **output binding** with the following operations:

- `create`

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
