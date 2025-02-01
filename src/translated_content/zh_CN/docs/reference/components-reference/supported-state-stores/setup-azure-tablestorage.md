---
type: docs
title: "Azure 表存储"
linkTitle: "Azure 表存储"
description: 详细介绍 Azure 表存储状态组件，该组件可用于连接到 Cosmos DB 表 API 和 Azure 表
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-azure-tablestorage/"
---

## 组件格式

要配置 Azure 表存储状态组件，请创建一个类型为 `state.azure.tablestorage` 的组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

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

{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用 secret 存储来保护 secret，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:----:|------|------|
| `accountName`        | 是   | 存储帐户名称 | `"mystorageaccount"` |
| `accountKey`         | 是   | 主存储或辅助存储密钥 | `"key"` |
| `tableName`          | 是   | 用于 Dapr 状态的表名。如果不存在，将自动创建 | `"table"` |
| `cosmosDbMode`       | 否   | 启用后，将连接到 Cosmos DB 表 API 而非 Azure 表。默认为 `false` | `"false"` |
| `serviceURL`         | 否   | 完整的存储服务端点 URL，适用于非公共云的 Azure 环境 | `"https://mystorageaccount.table.core.windows.net/"` |
| `skipCreateTable`    | 否   | 跳过检查并在必要时创建指定的存储表，适用于最低权限的活动目录身份验证。默认为 `false` | `"true"` |

### Microsoft Entra ID 认证

Azure Cosmos DB 状态组件支持所有 Microsoft Entra ID 认证机制。有关更多信息以及如何选择适合的组件元数据字段，请参阅[Azure 认证文档]({{< ref authenticating-azure.md >}})。

您可以在[下面的部分](#setting-up-cosmos-db-for-authenticating-with-azure-ad)了解更多关于使用 Microsoft Entra ID 认证设置 Cosmos DB 的信息。

## 选项 1：设置 Azure 表存储

[按照说明](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal)从 Azure 文档中了解如何创建 Azure 存储帐户。

如果您希望为 Dapr 创建一个表，可以提前进行。然而，表存储状态组件会自动为您创建一个表（如果它不存在），除非启用了 `skipCreateTable` 选项。

要将 Azure 表存储设置为状态存储，您需要以下属性：
- **AccountName**：存储帐户名称，例如：**mystorageaccount**。
- **AccountKey**：主存储或辅助存储密钥。如果使用 Microsoft Entra ID 认证，请跳过此步骤。
- **TableName**：用于 Dapr 状态的表名。如果不存在，将自动创建，除非启用了 `skipCreateTable` 选项。
- **cosmosDbMode**：设置为 `false` 以连接到 Azure 表。

## 选项 2：设置 Azure Cosmos DB 表 API

[按照说明](https://docs.microsoft.com/azure/cosmos-db/table/how-to-use-python?tabs=azure-portal#1---create-an-azure-cosmos-db-account)从 Azure 文档中了解如何使用表 API 创建 Cosmos DB 帐户。

如果您希望为 Dapr 创建一个表，可以提前进行。然而，表存储状态组件会自动为您创建一个表（如果它不存在），除非启用了 `skipCreateTable` 选项。

要将 Azure Cosmos DB 表 API 设置为状态存储，您需要以下属性：
- **AccountName**：Cosmos DB 帐户名称，例如：**mycosmosaccount**。
- **AccountKey**：Cosmos DB 主密钥。如果使用 Microsoft Entra ID 认证，请跳过此步骤。
- **TableName**：用于 Dapr 状态的表名。如果不存在，将自动创建，除非启用了 `skipCreateTable` 选项。
- **cosmosDbMode**：设置为 `true` 以连接到 Cosmos DB 表 API。

## 分区

Azure 表存储状态组件使用请求中提供的 `key` 属性来确定 `row key`，而服务名称用于 `partition key`。这提供了最佳性能，因为每种服务类型在其自己的表分区中存储状态。

此状态存储在表存储中创建一个名为 `Value` 的列，并将原始状态放入其中。

例如，来自名为 `myservice` 的服务的以下操作

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

将在表中创建以下记录：

| PartitionKey | RowKey  | Value |
| ------------ | ------- | ----- |
| myservice    | nihilus | darth |

## 并发

Azure 表存储状态的并发通过使用 `ETag` 实现，具体请参阅[官方文档](https://docs.microsoft.com/azure/storage/common/storage-concurrency#managing-concurrency-in-table-storage)。

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取有关配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
