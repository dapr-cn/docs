---
type: docs
title: "Azure CosmosDBGremlinAPI 绑定规范"
linkTitle: "Azure CosmosDBGremlinAPI"
description: "有关 Azure CosmosDBGremlinAPI 绑定组件的详细文档"
---

## 配置

要设置 Azure CosmosDBGremlinAPI 绑定，请创建一个类型为 `bindings.azure.cosmosdb.gremlinapi` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.cosmosdb.gremlinapi
  version: v1
  metadata:
  - name: url
    value: wss://******.gremlin.cosmos.azure.com:443/
  - name: masterKey
    value: *****
  - name: username
    value: *****
  ```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段        | 必填 | 绑定支持 | 详情                              | 示例                                                      |
| --------- |:--:| ---- | ------------------------------- | ------------------------------------------------------- |
| url       | Y  | 输出   | CosmosDBGremlinAPI url          | `"wss://******.gremlin.cosmos.azure.com:443/"`          |
| masterKey | Y  | 输出   | CosmosDBGremlinAPI 帐户 masterKey | `"masterKey"`                                           |
| username  | Y  | 输出   | CosmosDBGremlinAPI 数据库的用户名      | `"/dbs/<database_name>/colls/<graph_name>"` |

更多详细信息，请参阅[快速入门：在 Azure Cosmos Graph DB 中使用 Gremlin](https://docs.microsoft.com/azure/cosmos-db/graph/create-graph-console)。

## 绑定支持

字段名为 `ttlInSeconds`。

- `query`

## 请求示例

```json
{
  "data": {
    "gremlin": "g.V().count()"
    },
  "operation": "query"
}
```

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
