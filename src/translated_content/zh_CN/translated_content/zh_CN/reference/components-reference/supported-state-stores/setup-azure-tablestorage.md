---
type: docs
title: "Azure Table Storage"
linkTitle: "Azure Table Storage"
description: Detailed information on the Azure Table Storage state store component which can be used to connect to Cosmos DB Table API and Azure Tables
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-azure-tablestorage/"
---

## Component format

To setup Azure Tablestorage state store create a component of type `state.azure.tablestorage`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.azure.tablestorage
  version: v1
  metadata:
  - name: accountName
    value: <REPLACE-WITH-ACCOUNT-NAME>
  - name: accountKey
    value: <REPLACE-WITH-ACCOUNT-KEY>
  - name: tableName
    value: <REPLACE-WITH-TABLE-NAME>
# - name: cosmosDbMode
#   value: false
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field             | Required | 详情                                                                                                                                                                                      | 示例                                                   |
| ----------------- |:--------:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `accountName`     |    是     | The storage account name                                                                                                                                                                | `"mystorageaccount"`.                                |
| `accountKey`      |    是     | Primary or secondary storage key                                                                                                                                                        | `"key"`                                              |
| `tableName`       |    是     | The name of the table to be used for Dapr state. The table will be created for you if it doesn't exist                                                                                  | `"table"`                                            |
| `cosmosDbMode`    |    否     | If enabled, connects to Cosmos DB Table API instead of Azure Tables (Storage Accounts). Defaults to `false`.                                                                            | `"false"`                                            |
| `serviceURL`      |    否     | The full storage service endpoint URL. Useful for Azure environments other than public cloud.                                                                                           | `"https://mystorageaccount.table.core.windows.net/"` |
| `skipCreateTable` |    否     | Skips the check for and, if necessary, creation of the specified storage table. This is useful when using active directory authentication with minimal privileges. Defaults to `false`. | `"true"`                                             |

### Microsoft Entra ID authentication

The Azure Cosmos DB state store component supports authentication using all Microsoft Entra ID mechanisms. For further information and the relevant component metadata fields to provide depending on the choice of Microsoft Entra ID authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

You can read additional information for setting up Cosmos DB with Microsoft Entra ID authentication in the [section below](#setting-up-cosmos-db-for-authenticating-with-azure-ad).

## Option 1: Setup Azure Table Storage

[Follow the instructions](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal) from the Azure documentation on how to create an Azure Storage Account.

If you wish to create a table for Dapr to use, you can do so beforehand. However, Table Storage state provider will create one for you automatically if it doesn't exist, unless the `skipCreateTable` option is enabled.

In order to setup Azure Table Storage as a state store, you will need the following properties:
- **AccountName**: The storage account name. For example: **mystorageaccount**.
- **AccountKey**: Primary or secondary storage key. Skip this if using Microsoft Entra ID authentication.
- **TableName**: The name of the table to be used for Dapr state. The table will be created for you if it doesn't exist, unless the `skipCreateTable` option is enabled.
- **cosmosDbMode**: Set this to `false` to connect to Azure Tables.

## Option 2: Setup Azure Cosmos DB Table API

[Follow the instructions](https://docs.microsoft.com/azure/cosmos-db/table/how-to-use-python?tabs=azure-portal#1---create-an-azure-cosmos-db-account) from the Azure documentation on creating a Cosmos DB account with Table API.

If you wish to create a table for Dapr to use, you can do so beforehand. However, Table Storage state provider will create one for you automatically if it doesn't exist, unless the `skipCreateTable` option is enabled.

In order to setup Azure Cosmos DB Table API as a state store, you will need the following properties:
- **AccountName**: The Cosmos DB account name. For example: **mycosmosaccount**.
- **AccountKey**: The Cosmos DB master key. Skip this if using Microsoft Entra ID authentication.
- **TableName**: The name of the table to be used for Dapr state. The table will be created for you if it doesn't exist, unless the `skipCreateTable` option is enabled.
- **cosmosDbMode**: Set this to `true` to connect to Azure Tables.


## Partitioning

The Azure Table Storage state store uses the `key` property provided in the requests to the Dapr API to determine the `row key`. Service Name is used for `partition key`. This provides best performance, as each service type stores state in it's own table partition.

This state store creates a column called `Value` in the table storage and puts raw state inside it.

For example, the following operation coming from service called `myservice`

```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```

will create the following record in a table:

| PartitionKey | RowKey  | 值     |
| ------------ | ------- | ----- |
| myservice    | nihilus | darth |

## 并发

Azure Table Storage state concurrency is achieved by using `ETag`s according to [the official documentation](https://docs.microsoft.com/azure/storage/common/storage-concurrency#managing-concurrency-in-table-storage).


## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
