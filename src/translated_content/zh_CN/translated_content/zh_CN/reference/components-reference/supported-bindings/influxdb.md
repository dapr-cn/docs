---
type: docs
title: "InfluxDB 绑定规范"
linkTitle: "InfluxDB"
description: "有关 InfluxDB 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/influxdb/"
---

## Component format

To setup InfluxDB binding create a component of type `bindings.influx`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field  | 必填 | 绑定支持   | 详情                                | 示例                        |
| ------ |:--:| ------ | --------------------------------- | ------------------------- |
| url    | 是  | Output | The URL for the InfluxDB instance | `"http://localhost:8086"` |
| token  | 是  | 输出     | InfluxDB 的授权令牌                    | `"mytoken"`               |
| org    | 是  | 输出     | InfluxDB 组织                       | `"myorg"`                 |
| bucket | 是  | 输出     | 要写入的存储桶名称                         | `"mybucket"`              |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`
- `query`

### 查询

为了查询 InfluxDB，在调用的元数据中使用 `query` 操作和 `raw` 键，查询结果为：

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

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
