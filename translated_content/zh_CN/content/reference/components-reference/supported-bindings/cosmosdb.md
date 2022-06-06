---
type: docs
title: "Azure CosmosDB 绑定规范"
linkTitle: "Azure CosmSDB"
description: "Azure CosmosDB 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/cosmosdb/"
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持 | 详情                                                           | 示例                                          |
| ------------ |:--:| ---- | ------------------------------------------------------------ | ------------------------------------------- |
| url          | Y  | 输出   | CosmosDB 地址                                                  | `"https://******.documents.azure.com:443/"` |
| masterKey    | Y  | 输出   | CosmosDB 账户主键                                                | `"master-key"`                              |
| database     | Y  | 输出   | CosmosDB 数据库名                                                | `"OrderDb"`                                 |
| collection   | Y  | 输出   | 数据库中容器的名称。                                                   | `"Orders"`                                  |
| partitionKey | Y  | 输出   | 要从用作分区键的有效负载（要创建的文档）中提取键的名称。 此名称必须与创建 Cosmos DB 容器时指定的分区键匹配。 | `"OrderId"`, `"message"`                    |

欲了解更多信息，请参阅 [Azure Cosmos DB 资源模型](https://docs.microsoft.com/azure/cosmos-db/account-databases-containers-items)。

### Azure Active Directory (AAD) 认证
Azure Cosmos DB绑定组件支持使用所有Azure Active Directory机制进行认证。 关于更多信息和相关组件的元数据字段请根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 生产使用的最佳实践

Azure Cosmos DB 在单个 Azure Cosmos DB 帐户中的所有数据库中共享严格的元数据请求速率限制。 与 Azure Cosmos DB 的新连接会占用很大比例的速率限制。 （请参阅 [CosmosDB 文档](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3)）

因此，必须应用多种策略来避免同时连接到 Azure Cosmos DB：

- 确保应用程序的 sidecar 仅在需要时加载 Azure Cosmos DB 组件，以避免不必要的数据库连接。 这可以通过[将组件的范围限定为特定应用程序]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes)来完成。
- 选择按顺序部署或启动应用程序的部署策略，以最大程度地减少 Azure Cosmos DB 帐户新连接造成的影响。
- 避免对不相关的数据库或系统（甚至在 Dapr 外部）重用同一 Azure Cosmos DB 帐户。 不同的 Azure Cosmos DB 帐户具有不同的速率限制。
- 增加 `initTimeout` 值，以允许组件在 sidecar 初始化期间重试连接到 Azure Cosmos DB，最长5分钟。 默认值是 `5s` ，应该增加。 使用 Kubernetes 时，增加此值可能还需要更新您的 [Readiness 和 Liveness 探针](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。

```yaml
spec:
  type: bindings.azure.cosmosdb
  version: v1
  initTimeout: 5m
  metadata:
```

## 日期格式

**输出绑定** `创建` 操作需要以下键存在于要创建的每个文档的有效负载中：
- `id`: 要创建的文档的唯一 ID
- `<partitionKey>`: 通过组件定义中 `spec.partitionKey` 指定的分区键的名称。 这还必须与创建 Cosmos DB 容器时指定的分区键匹配。

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
