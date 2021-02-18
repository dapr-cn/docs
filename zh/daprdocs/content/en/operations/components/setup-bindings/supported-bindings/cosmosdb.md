---
type: 文档
title: "Azure CosmosDB binding spec"
linkTitle: "Azure CosmosDB"
description: "Detailed documentation on the Azure CosmosDB binding component"
---

## Setup Dapr component

To setup Azure CosmosDB binding create a component of type `bindings.azure.cosmosdb`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.cosmosdb
  version: v1
  metadata:
  - name: url
    value: https://******.documents.azure.com:443/
  - name: masterKey
    value: *****
  - name: database
    value: db
  - name: collection
    value: collection
  - name: partitionKey
    value: message
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Output Binding Supported Operations

| 字段           | Required | Output Binding Supported Operations | Details                                                                     | Example:                                    |
| ------------ |:--------:| ----------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------- |
| url          |    Y     | Output                              | `url` is the CosmosDB url.                                                  | `"https://******.documents.azure.com:443/"` |
| masterKey    |    Y     | Output                              | `masterKey` is the CosmosDB account master key.                             | `"master-key"`                              |
| database     |    Y     | Output                              | `database` is the name of the CosmosDB database.                            | `"OrderDb"`                                 |
| collection   |    Y     | Output                              | `collection` is name of the collection inside the database.                 | `"Orders"`                                  |
| partitionKey |    Y     | Output                              | `partitionKey` is the name of the partitionKey to extract from the payload. | `"OrderId"`, `"message"`                    |

For more information see [Azure Cosmos DB resource model](https://docs.microsoft.com/en-us/azure/cosmos-db/account-databases-containers-items).

## Output bindings

字段名为 `ttlInSeconds`。

- `create`

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
