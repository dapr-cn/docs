---
type: docs
title: "Azure CosmosDBGremlinAPI binding spec"
linkTitle: "Azure CosmosDBGremlinAPI"
description: "Detailed documentation on the Azure CosmosDBGremlinAPI binding component"
---

## 配置

To setup Azure CosmosDBGremlinAPI binding create a component of type `bindings.azure.cosmosdb.gremlinapi`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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

| 字段        | 必填 | 绑定支持 | 详情                                              | 示例                                             |
| --------- |:--:| ---- | ----------------------------------------------- | ---------------------------------------------- |
| url       | Y  | 输出   | The CosmosDBGremlinAPI url                      | `"wss://******.gremlin.cosmos.azure.com:443/"` |
| masterKey | Y  | 输出   | The CosmosDBGremlinAPI account master key       | `"masterKey"`                                  |
| database  | Y  | 输出   | The username of the CosmosDBGremlinAPI database | `"username"`                                   |

For more information see [Quickstart: Azure Cosmos Graph DB using Gremlin ](https://docs.microsoft.com/azure/cosmos-db/graph/create-graph-console).

## 绑定支持

字段名为 `ttlInSeconds`。

- `query`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
