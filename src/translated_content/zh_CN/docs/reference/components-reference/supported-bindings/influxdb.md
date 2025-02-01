---
type: docs
title: "InfluxDB 绑定规范"
linkTitle: "InfluxDB"
description: "关于 InfluxDB 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/influxdb/"
---

## 组件格式

为了设置 InfluxDB 绑定，请创建一个类型为 `bindings.influx` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.influx
  version: v1
  metadata:
  - name: url # 必需
    value: "<INFLUX-DB-URL>"
  - name: token # 必需
    value: "<TOKEN>"
  - name: org # 必需
    value: "<ORG>"
  - name: bucket # 必需
    value: "<BUCKET>"
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 使用了明文字符串。建议使用 secret 存储来保护这些信息，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `url`  | Y | 输出 | InfluxDB 实例的 URL | `"http://localhost:8086"` |
| `token` | Y | 输出 | InfluxDB 的授权令牌 | `"mytoken"` |
| `org` | Y | 输出 | InfluxDB 组织 | `"myorg"` |
| `bucket` | Y | 输出 | 要写入的桶名称 | `"mybucket"` |

## 绑定功能

此组件支持以下**输出绑定**操作：

- `create`
- `query`

### 查询

要查询 InfluxDB，请使用 `query` 操作，并在调用的元数据中使用 `raw` 键，将查询语句作为其值：

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

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
