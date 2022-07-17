---
type: docs
title: "InfluxDB binding spec"
linkTitle: "InfluxDB"
description: "Detailed documentation on the InfluxDB binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/influxdb/"
---

## 配置

To setup InfluxDB binding create a component of type `bindings.influx`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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

| 字段     | 必填 | 绑定支持 | 详情                                   | 示例                        |
| ------ |:--:| ---- | ------------------------------------ | ------------------------- |
| url    | Y  | 输出   | The URL for the InfluxDB instance    | `"http://localhost:8086"` |
| token  | Y  | 输出   | The authorization token for InfluxDB | `"mytoken"`               |
| org    | Y  | 输出   | The InfluxDB organization            | `"myorg"`                 |
| bucket | Y  | 输出   | Bucket name to write to              | `"mybucket"`              |

## 绑定支持

字段名为 `ttlInSeconds`。

- `create`
- `query`

### Query

In order to query InfluxDB, use a `query` operation along with a `raw` key in the call's metadata, with the query as the value:

```
curl -X POST http://localhost:3500/v1.0/bindings/myInfluxBinding \
  -H "Content-Type: application/json" \
  -d "{
        \"metadata\": {
          \"raw\": "SELECT * FROM 'sith_lords'"
        },
        \"operation\": \"query\"
      }"
```

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
