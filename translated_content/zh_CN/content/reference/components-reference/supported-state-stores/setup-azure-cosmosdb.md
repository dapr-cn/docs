---
type: docs
title: "Azure Cosmos DB"
linkTitle: "Azure Cosmos DB"
description: Detailed information on the Azure Cosmos DB state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-azure-cosmosdb/"
---

## 配置

To setup Azure Cosmos DB state store create a component of type `state.azure.cosmosdb`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

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

If you wish to use Cosmos DB as an actor store, append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```

## 元数据字段规范

| 字段              | 必填 | 详情                                               | 示例                                           |
| --------------- |:--:| ------------------------------------------------ | -------------------------------------------- |
| url             | Y  | The Cosmos DB url                                | `"https://******.documents.azure.com:443/"`. |
| masterKey       | Y  | The key to authenticate to the Cosmos DB account | `"key"`                                      |
| database        | Y  | 数据库名称                                            | `"db"`                                       |
| collection      | Y  | The name of the collection (container)           | `"collection"`                               |
| actorStateStore | N  | 是否将此状态存储给 Actor 使用。 默认值为 `"false"`               | `"true"`, `"false"`                          |

### Azure Active Directory (Azure AD) authentication

The Azure Cosmos DB state store component supports authentication using all Azure Active Directory mechanisms. For further information and the relevant component metadata fields to provide depending on the choice of Azure AD authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

You can read additional information for setting up Cosmos DB with Azure AD authentication in the [section below](#setting-up-cosmos-db-for-authenticating-with-azure-ad).

## Setup Azure Cosmos DB

[Follow the instructions](https://docs.microsoft.com/azure/cosmos-db/how-to-manage-database-account) from the Azure documentation on how to create an Azure Cosmos DB account.  The database and collection must be created in Cosmos DB before Dapr can use it.

**Important: The partition key for the collection must be named `/partitionKey` (note: this is case-sensitive).**

In order to setup Cosmos DB as a state store, you need the following properties:

- **URL**: the Cosmos DB url. for example: `https://******.documents.azure.com:443/`
- **Master Key**: The key to authenticate to the Cosmos DB account
- **Database**: 数据库的名称
- **Collection**: The name of the collection (or container)

## 生产使用的最佳实践

Azure Cosmos DB shares a strict metadata request rate limit across all databases in a single Azure Cosmos DB account. New connections to Azure Cosmos DB assume a large percentage of the allowable request rate limit. (See the [Cosmos DB documentation](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3))

Therefore several strategies must be applied to avoid simultaneous new connections to Azure Cosmos DB:

- Ensure sidecars of applications only load the Azure Cosmos DB component when they require it to avoid unnecessary database connections. 这可以通过[将组件的范围限定为特定应用程序]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes)来完成。
- Choose deployment strategies that sequentially deploy or start your applications to minimize bursts in new connections to your Azure Cosmos DB accounts.
- Avoid reusing the same Azure Cosmos DB account for unrelated databases or systems (even outside of Dapr). Distinct Azure Cosmos DB accounts have distinct rate limits.
- Increase the `initTimeout` value to allow the component to retry connecting to Azure Cosmos DB during side car initialization for up to 5 minutes. 默认值是 `5s` ，应该增加。 使用 Kubernetes 时，增加此值可能还需要更新您的 [Readiness 和 Liveness 探针](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。

```yaml
spec:
  type: state.azure.cosmosdb
  version: v1
  initTimeout: 5m
  metadata:
```

## 日期格式

To use the Cosmos DB state store, your data must be sent to Dapr in JSON-serialized format. 让它仅仅是JSON *可序列化* 是不行的。

If you are using the Dapr SDKs (for example the [.NET SDK](https://github.com/dapr/dotnet-sdk)), the SDK automatically serializes your data to JSON.

If you want to invoke Dapr's HTTP endpoint directly, take a look at the examples (using curl) in the [Partition keys](#partition-keys) section below.

## 分区键

For **non-actor state** operations, the Azure Cosmos DB state store will use the `key` property provided in the requests to the Dapr API to determine the Cosmos DB partition key. 这可以通过在请求中指定一个元数据字段来覆盖，该字段的键为`partitionKey`，值为所需的分区。

The following operation uses `nihilus` as the partition key value sent to Cosmos DB:

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

For **non-actor** state operations, if you want to control the Cosmos DB partition, you can specify it in metadata.  重用上面的例子，下面是如何把它放在`mypartition`分区下的方法：

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

对于**actor**状态的操作，Dapr使用`appId`、actor类型和actor id生成分区键，这样同一个actor的数据最终总是在同一个分区下（你不需要指定它）。 This is because actor state operations must use transactions, and in Cosmos DB the items in a transaction must be on the same partition.

## Setting up Cosmos DB for authenticating with Azure AD

When using the Dapr Cosmos DB state store and authenticating with Azure AD, you need to perform a few additional steps to set up your environment.

前期准备:

- You need a Service Principal created as per the instructions in the [authenticating to Azure]({{< ref authenticating-azure.md >}}) page. You need the ID of the Service Principal for the commands below (note that this is different from the client ID of your application, or the value you use for `azureClientId` in the metadata).
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- The scripts below are optimized for a bash or zsh shell

### Granting your Azure AD application access to Cosmos DB

> You can find more information on the [official documentation](https://docs.microsoft.com/azure/cosmos-db/how-to-setup-rbac), including instructions to assign more granular permissions.

In order to grant your application permissions to access data stored in Cosmos DB, you need to assign it a custom role for the Cosmos DB data plane. In this example you're going to use a built-in role, "Cosmos DB Built-in Data Contributor", which grants your application full read-write access to the data; you can optionally create custom, fine-tuned roles following the instructions in the official docs.

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

### Creating the stored procedures for Dapr

When using Cosmos DB as a state store for Dapr, we need to create two stored procedures in your collection. When you configure the state store using a "master key", Dapr creates those for you, automatically. However, when your state store authenticates with Cosmos DB using Azure AD, because of limitations in the platform we are not able to do it automatically.

If you are using Azure AD to authenticate your Cosmos DB state store and have not created the stored procedures (or if you are using an outdated version of them), your Dapr sidecar will fail to start and you will see an error similar to this in your logs:

```text
Dapr requires stored procedures created in Cosmos DB before it can be used as state store. Those stored procedures are currently not existing or are using a different version than expected. When you authenticate using Azure AD we cannot automatically create them for you: please start this state store with a Cosmos DB master key just once so we can create the stored procedures for you; otherwise, you can check our docs to learn how to create them yourself: https://aka.ms/dapr/cosmosdb-aad
```

To fix this issue, you have two options:

1. Configure your component to authenticate with the "master key" just once, to have Dapr automatically initialize the stored procedures for you. While you need to use a "master key" the first time you launch your application, you should be able to remove that and use Azure AD credentials (including Managed Identities) after.
2. Alternatively, you can follow the steps below to create the stored procedures manually. These steps must be performed before you can start your application the first time.

To create the stored procedures manually, you can use the commands below.

First, download the code of the stored procedures for the version of Dapr that you're using. This will create two `.js` files in your working directory:

```sh
# Set this to the version of Dapr that you're using
DAPR_VERSION="release-{{% dapr-latest-version short="true" %}}"
curl -LfO "https://raw.githubusercontent.com/dapr/components-contrib/${DAPR_VERSION}/state/azure/cosmosdb/storedprocedures/__daprver__.js"
curl -LfO "https://raw.githubusercontent.com/dapr/components-contrib/${DAPR_VERSION}/state/azure/cosmosdb/storedprocedures/__dapr_v2__.js"
```

> You won't need to update the code for the stored procedures every time you update Dapr. Although the code for the stored procedures doesn't change often, sometimes we may make updates to that: when that happens, if you're using Azure AD authentication your Dapr sidecar will fail to launch until you update the stored procedures, re-running the commands above.

Then, using the Azure CLI create the stored procedures in Cosmos DB, for your account, database, and collection (or container):

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
