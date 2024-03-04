---
type: docs
title: "Azure Cosmos DB (Gremlin API) binding spec"
linkTitle: "Azure Cosmos DB (Gremlin API)"
description: "Detailed documentation on the Azure Cosmos DB (Gremlin API) binding component"
---

## Component format

To setup an Azure Cosmos DB (Gremlin API) binding create a component of type `bindings.azure.cosmosdb.gremlinapi`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field       | Required | 绑定支持   | 详情                                     | 示例                                                      |
| ----------- |:--------:| ------ | -------------------------------------- | ------------------------------------------------------- |
| `url`       |    是     | Output | The Cosmos DB url for Gremlin APIs     | `"wss://******.gremlin.cosmos.azure.com:443/"`          |
| `masterKey` |    是     | 输出     | The Cosmos DB account master key       | `"masterKey"`                                           |
| `username`  |    是     | 输出     | The username of the Cosmos DB database | `"/dbs/<database_name>/colls/<graph_name>"` |

For more information see [Quickstart: Azure Cosmos Graph DB using Gremlin](https://docs.microsoft.com/azure/cosmos-db/graph/create-graph-console).

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

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

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
