---
type: docs
title: "Azure Cosmos DB (Gremlin API) 绑定组件说明"
linkTitle: "Azure Cosmos DB (Gremlin API)"
description: "关于 Azure Cosmos DB (Gremlin API) 绑定组件的详细文档"
---

## 组件格式

要配置 Azure Cosmos DB (Gremlin API) 绑定，请创建一个类型为 `bindings.azure.cosmosdb.gremlinapi` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.cosmosdb.gremlinapi
  version: v1
  metadata:
  - name: url
    value: "wss://******.gremlin.cosmos.azure.com:443/"
  - name: masterKey
    value: "*****"
  - name: username
    value: "*****"
```

{{% alert title="警告" color="warning" %}}
上述示例使用了明文形式的字符串作为密钥。建议使用密钥存储来存储密钥，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规范元数据字段

| 字段              | 是否必需 | 支持的绑定类型 | 说明 | 示例 |
|--------------------|:--------:|--------|---------|---------|
| `url` | Y | 输出 | Gremlin API 的 Cosmos DB URL | `"wss://******.gremlin.cosmos.azure.com:443/"` |
| `masterKey` | Y | 输出 | Cosmos DB 账户的主密钥 | `"masterKey"` |
| `username` | Y | 输出 | Cosmos DB 数据库的用户名 | `"/dbs/<database_name>/colls/<graph_name>"` |

更多信息请参见[快速入门：使用 Gremlin 的 Azure Cosmos 图数据库](https://docs.microsoft.com/azure/cosmos-db/graph/create-graph-console)。

## 绑定支持

此组件支持以下操作的**输出绑定**：

- `query`

## 请求示例负载

```json
{
  "data": {
    "gremlin": "g.V().count()"
    },
  "operation": "query"
}
```

## 相关文档

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [bindings 构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用bindings与外部资源接口]({{< ref howto-bindings.md >}})
- [bindings API 参考]({{< ref bindings_api.md >}})
