---
type: docs
title: "Azure Cosmos DB"
linkTitle: "Azure Cosmos DB"
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
| url             | 是  | Cosmos DB 地址                       | `"https://******.documents.azure.com:443/"`. |
| masterKey       | 是  | 认证到CosmosDB 账户的密钥                  | `"key"`                                      |
| database        | 是  | 数据库名称                              | `"db"`                                       |
| collection      | 是  | 要使用的集合（容器）名称                       | `"collection"`                               |
| actorStateStore | 否  | 是否将此状态存储给 Actor 使用。 默认值为 `"false"` | `"true"`, `"false"`                          |

### Azure Active Directory (Azure AD) 认证

Azure Cosmos DB状态存储组件支持使用所有Azure Active Directory机制进行认证。 关于更多信息和相关组件的元数据字段请根据选择的Azure AD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

您可以在</a>下面的
部分中阅读有关使用 Azure AD 身份验证设置 Cosmos DB 的其他信息。</p> 



## 设置Azure Cosmos DB

[请遵循 Azure 文档中关于如何创建 Azure CosmosDB 账户的说明](https://docs.microsoft.com/azure/cosmos-db/how-to-manage-database-account)。  在为 Dapr 所使用之前，必须先在 CosmosDB 中创建数据库和集合。

**重要提示：集合的分区键必须命名为 `/partitionKey` （注意：这是区分大小写的）。**

为了配置 CosmosDB 作为状态存储，你需要以下属性：

- **URL**: the CosmosDB url. 例如： `https://******.documents.azure.com:443/`
- **Master Key**: 用于验证 CosmosDB 账户的密钥
- **Database**: 数据库的名称
- **Collection**: 集合（或者容器）的名称



## 生产使用的最佳实践

Azure Cosmos DB 在单个 Azure Cosmos DB 账户下的所有数据库中共享严格的元数据请求速率限制。 对 Azure Cosmos DB 的新连接承担了很大比例的允许请求率限制。 （请参阅 [Cosmos DB 文档](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3)）

因此，必须应用多种策略来避免同时连接到 Azure Cosmos DB：

- 确保应用程序的 sidecar 仅在需要时加载 Azure Cosmos DB 组件，以避免不必要的数据库连接。 这可以通过[将组件的范围限定为特定应用程序]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes)来完成。
- 选择按顺序部署或启动应用程序的部署策略，以最大程度地减少 Azure Cosmos DB 账户新连接造成的影响。
- 避免对不相关的数据库或系统（甚至在 Dapr 外部）重用同一 Azure Cosmos DB 账户。 不同的 Azure Cosmos DB 账户具有不同的速率限制。
- 增加 `initTimeout` 值，以允许组件在 sidecar 初始化期间重试连接到 Azure Cosmos DB，最长5分钟。 默认值是 `5s` ，应该增加。 使用 Kubernetes 时，增加此值可能还需要更新您的 [Readiness 和 Liveness 探针](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。



```yaml
spec:
  type: state.azure.cosmosdb
  version: v1
  initTimeout: 5m
  metadata:
```




## 日期格式

要使用CosmosDB状态存储，你的数据必须以JSON序列化的方式发送到Dapr。 让它仅仅是JSON *可序列化* 是不行的。

如果您使用 Dapr SDK（例如 [.NET SDK](https://github.com/dapr/dotnet-sdk)），SDK 会自动将您的数据序列化为 JSON。

如果您想直接调用 Dapr 的 HTTP 端点，请查看下面 [Partition keys](#partition-keys) 部分中的示例（使用 curl）。



## 分区键

对于**non-actor**状态操作，Azure Cosmos DB状态存储将使用向Dapr API发出的请求中提供的`key`属性来确定Cosmos DB分区键。 这可以通过在请求中指定一个元数据字段来覆盖，该字段的键为`partitionKey`，值为所需的分区。

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


对于**actor**状态的操作，Dapr使用`appId`、actor类型和actor id生成分区键，这样同一个actor的数据最终总是在同一个分区下（你不需要指定它）。 这是因为actor状态操作必须使用事务，而在CosmosDB中，事务中的项必须在同一个分区上。



## 设置 Cosmos DB 以使用 Azure AD 进行身份验证

当使用Dapr Cosmos DB状态存储组件并使用Azure AD进行身份认证时，你需要执行一些额外的步骤去设置你的环境。

前期准备:

- 您需要按照[向Azure进行身份验证]({{< ref authenticating-azure.md >}}) 中的说明创建服务主体。 使用下列命令，需要服务主体的ID（注意 一点，这与应用的客户端ID或者在metadata中设置的`azureClientId` 的值都不同）。
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- 下面的脚本针对 bash 或 zsh shell 进行了优化



### 授予 Azure AD 应用程序对 Cosmos DB 的访问权限



> 你可以在[official documentation](https://docs.microsoft.com/azure/cosmos-db/how-to-setup-rbac), 查询到更多信息，包括分配更多精细权限的说明。

为了授予您的应用程序访问存储在 Cosmos DB 中的数据的权限，你需要为其分配 Cosmos DB 数据平面的自定义角色。 在此示例中，你将使用内置角色“Cosmos DB 内置数据参与者”，该角色授予应用程序对数据的完全读写访问权限; 您可以选择按照官方文档中的说明创建自定义的微调角色。



```sh
# Name of the Resource Group that contains your Cosmos DB
RESOURCE_GROUP="..."
# Name of your Cosmos DB account
ACCOUNT_NAME="..."
# ID of your Service Principal object
PRINCIPAL_ID="..."
# ID of the "Cosmos DB Built-in Data Contributor" role
# You can also use the ID of a custom role
ROLE_ID="00000000-0000-0000-0000-000000000002"

az cosmosdb sql role assignment create \
  --account-name "$ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --scope "/" \
  --principal-id "$PRINCIPAL_ID" \
  --role-definition-id "$ROLE_ID"
```




### 为 Dapr 创建存储过程

当使用 Cosmos DB 作为 Dapr 的状态存储时，我们需要在您的集合中创建两个存储过程。 当您使用“master key”配置状态存储时，Dapr 会自动为您创建这些。 但是，当状态存储使用 Azure AD 向 Cosmos DB 进行身份验证时，由于平台中的限制，我们无法自动执行此操作。

如果使用 Azure AD 对 Cosmos DB 状态存储进行身份验证，但尚未创建存储过程（或者如果使用的是存储过程的过时版本），则 Dapr sidecar 将无法启动，并且将在日志中看到类似于以下内容的错误：



```text
Dapr requires stored procedures created in Cosmos DB before it can be used as state store. Those stored procedures are currently not existing or are using a different version than expected. When you authenticate using Azure AD we cannot automatically create them for you: please start this state store with a Cosmos DB master key just once so we can create the stored procedures for you; otherwise, you can check our docs to learn how to create them yourself: https://aka.ms/dapr/cosmosdb-aad
```


要解决此问题，您有两种选择：

1. 将您的组件配置为仅使用“master key”进行一次身份验证，以让 Dapr 自动为您初始化存储过程。 虽然您需要在首次启动应用程序时使用“master key”，但您应该能够删除它并在之后使用 Azure AD 凭据（包括托管身份）。
2. 或者，您可以按照以下步骤手动创建存储过程。 必须先执行这些步骤，然后才能第一次启动应用程序。

要手动创建存储过程，您可以使用以下命令。

首先，下载您正在使用的 Dapr 版本的存储过程的代码。 这将在工作目录中创建两个 `.js` 文件：



```sh
# Set this to the version of Dapr that you're using
DAPR_VERSION="release-{{% dapr-latest-version short="true" %}}"
curl -LfO "https://raw.githubusercontent.com/dapr/components-contrib/${DAPR_VERSION}/state/azure/cosmosdb/storedprocedures/__daprver__.js"
curl -LfO "https://raw.githubusercontent.com/dapr/components-contrib/${DAPR_VERSION}/state/azure/cosmosdb/storedprocedures/__dapr_v2__.js"
```




> 每次更新 Dapr 时都不需要更新存储过程的代码。 尽管存储过程的代码不会经常更改，但有时我们可能会对其进行更新：当这种情况发生时，如果您使用 Azure AD 身份验证，您的 Dapr sidecar 将无法启动，直到您更新存储过程，重新运行上面的命令。

然后，使用 Azure CLI 在 Cosmos DB 中为您的账户、数据库和集合（或容器）创建存储过程：



```sh
# Name of the Resource Group that contains your Cosmos DB
RESOURCE_GROUP="..."
# Name of your Cosmos DB account
ACCOUNT_NAME="..."
# Name of your database in the Cosmos DB account
DATABASE_NAME="..."
# Name of the container (collection) in your database
CONTAINER_NAME="..."

az cosmosdb sql stored-procedure create \
  --resource-group "$RESOURCE_GROUP" \
  --account-name "$ACCOUNT_NAME" \
  --database-name "$DATABASE_NAME" \
  --container-name "$CONTAINER_NAME" \
  --name "__daprver__" \
  --body @__daprver__.js
az cosmosdb sql stored-procedure create \
  --resource-group "$RESOURCE_GROUP" \
  --account-name "$ACCOUNT_NAME" \
  --database-name "$DATABASE_NAME" \
  --container-name "$CONTAINER_NAME" \
  --name "__dapr_v2__" \
  --body @__dapr_v2__.js
```




## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
