---
type: docs
title: "Azure Cosmos DB"
linkTitle: "Azure Cosmos DB"
description: 关于 Azure CosmosDB 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-azure-cosmosdb/"
---

## 配置

要设置 Azure CosmosDb 状态存储，请创建一个类型为 `state.azure.cosmosdb` 的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.cosmosdb
  version: v1
  metadata:
  - name: url
    value: <REPLACE-WITH-URL>
  - name: masterKey
    value: <REPLACE-WITH-MASTER-KEY>
  - name: database
    value: <REPLACE-WITH-DATABASE>
  - name: collection
    value: <REPLACE-WITH-COLLECTION>
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

如果您想要使用 CosmosDb 作为 Actor 存储，请在 yaml 上附上以下内容。

```yaml
  - name: actorStateStore
    value: "true"
```

## 元数据字段规范

| 字段              | 必填 | 详情                                 | 示例                                           |
| --------------- |:--:| ---------------------------------- | -------------------------------------------- |
| url             | Y  | CosmosDB 地址                        | `"https://******.documents.azure.com:443/"`. |
| masterKey       | Y  | 认证到CosmosDB 账户的密钥                  | `"key"`                                      |
| database        | Y  | 数据库名称                              | `"db"`                                       |
| collection      | Y  | 要使用的集合名称                           | `"collection"`                               |
| actorStateStore | N  | 是否将此状态存储给 Actor 使用。 默认值为 `"false"` | `"true"`, `"false"`                          |

### Azure Active Directory (AAD) 认证
The Azure Cosmos DB state store component supports authentication using all Azure Active Directory mechanisms. 更多信息和相关组件的元数据字段根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

## 安装Azure Cosmos DB

[请遵循 Azure 文档中关于如何创建 Azure CosmosDB 帐户的说明](https://docs.microsoft.com/azure/cosmos-db/how-to-manage-database-account)。  在为Dapr所使用之前，必须先在CosmosDB中创建数据库和集合。

**注意：集合的分区键必须命名为"/partitionKey"。  注意：这是区分大小写的。**

为了配置CosmosDB作为状态存储，你需要以下属性：
- **URL**: the CosmosDB url. 示例: https://******.documents.azure.com:443/
- **Master Key**: 用于验证 CosmosDB 账户的密钥
- **Database**: 数据库的名称
- **Collection**: 集合的名称

## 生产使用的最佳实践

Azure Cosmos DB 在单个 Azure Cosmos DB 帐户中的所有数据库中共享严格的元数据请求速率限制。 与 Azure Cosmos DB 的新连接会占用很大比例的速率限制。 （请参阅 [CosmosDB 文档](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3)）

因此，必须应用多种策略来避免同时连接到 Azure Cosmos DB：

- 确保应用程序的 sidecar 仅在需要时加载 Azure Cosmos DB 组件，以避免不必要的数据库连接。 这可以通过[将组件的范围限定为特定应用程序]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes)来完成。
- 选择按顺序部署或启动应用程序的部署策略，以最大程度地减少 Azure Cosmos DB 帐户新连接造成的影响。
- 避免对不相关的数据库或系统（甚至在 Dapr 外部）重用同一 Azure Cosmos DB 帐户。 不同的 Azure Cosmos DB 帐户具有不同的速率限制。
- 增加 `initTimeout` 值，以允许组件在 sidecar 初始化期间重试连接到 Azure Cosmos DB，最长5分钟。 默认值是 `5s` ，应该增加。 使用 Kubernetes 时，增加此值可能还需要更新您的 [Readiness 和 Liveness 探针](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。

```yaml
spec:
  type: state.azure.cosmosdb
  version: v1
  initTimeout: 5m
  metadata:
```

## 日期格式

要使用CosmosDB状态存储，你的数据必须以JSON序列化的方式发送到Dapr。  让它仅仅是JSON *可序列化* 是不行的。

如果您使用的是Dapr SDKs (例如https://github.com/dapr/dotnet-sdk)，SDK会将您的数据序列化为json。

例子请看[分区键](#partition-keys)部分的 curl 操作。

## 分区键

对于**non-actor**状态操作，Azure Cosmos DB状态存储将使用向Dapr API发出的请求中提供的`key`属性来确定Cosmos DB分区键。  这可以通过在请求中指定一个元数据字段来覆盖，该字段的键为`partitionKey`，值为所需的分区。

以下操作将使用`nihilus`作为发送到CosmosDB的分区键值：

```shell
curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```

对于**non-actor**状态操作，如果你想控制CosmosDB分区，你可以在元数据中指定它。  重用上面的例子，下面是如何把它放在`mypartition`分区下的方法：

```shell
curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth",
          "metadata": {
            "partitionKey": "mypartition"
          }
        }
      ]'
```


对于**actor**状态的操作，Dapr使用`appId`、actor类型和actor id生成分区键，这样同一个actor的数据最终总是在同一个分区下（你不需要指定它）。  这是因为actor状态操作必须使用事务，而在CosmosDB中，事务中的项必须在同一个分区上。

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
