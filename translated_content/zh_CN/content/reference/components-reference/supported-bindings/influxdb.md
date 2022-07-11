---
type: docs
title: "InfluxDB 绑定规范"
linkTitle: "InfluxDB"
description: "有关 InfluxDB 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/influxdb/"
---

## 配置

要设置 InfluxDB 绑定，请创建一个类型为 `bindings.influx` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段     | 必填 | 绑定支持 | 详情               | 示例                        |
| ------ |:--:| ---- | ---------------- | ------------------------- |
| url    | 是  | 输出   | InfluxDB 实例的 URL | `"http://localhost:8086"` |
| token  | 是  | 输出   | InfluxDB 的授权令牌   | `"mytoken"`               |
| org    | 是  | 输出   | InfluxDB 组织      | `"myorg"`                 |
| bucket | 是  | 输出   | 要写入的存储桶名称        | `"mybucket"`              |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
