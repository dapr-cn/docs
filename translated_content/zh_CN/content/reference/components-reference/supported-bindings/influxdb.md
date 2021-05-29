---
type: docs
title: "InfluxDB binding spec"
linkTitle: "InfluxDB"
description: "Detailed documentation on the InfluxDB binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/influxdb/"
---

## 配置

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
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段     | 必填 | 绑定支持 | 详情                                   | Example                   |
| ------ |:--:| ---- | ------------------------------------ | ------------------------- |
| url    | Y  | 输出   | The URL for the InfluxDB instance    | `"http://localhost:8086"` |
| token  | Y  | 输出   | The authorization token for InfluxDB | `"mytoken"`               |
| org    | Y  | 输出   | The InfluxDB organization            | `"myorg"`                 |
| bucket | Y  | 输出   | Bucket name to write to              | `"mybucket"`              |

## 绑定支持

字段名为 `ttlInSeconds`。

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
