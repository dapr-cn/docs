---
type: docs
title: "Azure CosmosDB 绑定规范"
linkTitle: "Azure CosmosDB"
description: "Azure CosmosDB 绑定组件的详细文档"
---

## 配置

要设置 Azure CosmosDB 绑定，请创建一个类型为 `bindings.azure.cosmosdb` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
以上示例将密钥明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持 | 详情                               | 示例                                          |
| ------------ |:--:| ---- | -------------------------------- | ------------------------------------------- |
| url          | 是  | 输出   | CosmosDB 地址                      | `"https://******.documents.azure.com:443/"` |
| masterKey    | 是  | 输出   | CosmosDB 账户主键                    | `"master-key"`                              |
| database     | 是  | 输出   | CosmosDB 数据库名                    | `"OrderDb"`                                 |
| collection   | 是  | 输出   | 数据库中容器的名称。                       | `"Orders"`                                  |
| partitionKey | 是  | 输出   | 要从有效负载中提取并在容器中使用的partitionKey的名称 | `"OrderId"`, `"message"`                    |

欲了解更多信息，请参阅 [Azure Cosmos DB 资源模型](https://docs.microsoft.com/en-us/azure/cosmos-db/account-databases-containers-items)。

## 绑定支持

该组件支持**输出绑定**，其操作如下:

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
