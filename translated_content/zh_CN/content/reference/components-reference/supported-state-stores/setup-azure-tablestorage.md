---
type: docs
title: "Azure Table Storage"
linkTitle: "Azure Table Storage"
description: 关于Azure Table Storage状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-azure-tablestorage/"
---

## 配置

要设置 Azure Tablestorage 状态存储，请创建一个类型为`state.azure.tablestorage`的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
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
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段          | 必填 | 详情                                                              | Example               |
| ----------- |:--:| --------------------------------------------------------------- | --------------------- |
| accountName | Y  | 存储帐户名称                                                          | `"mystorageaccount"`. |
| accountKey  | Y  | 主要或次要存储密钥                                                       | `"key"`               |
| tableName   | Y  | The name of the table to be used for Dapr state. 如果表不存在，将会自动创建. | `"table"`             |

## 安装Azure Table Storage

[请遵循 Azure 文档中关于如何创建 Azure Storage Account的说明](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal)。

如果你想创建一张表供Dapr使用，你可以事先这样做。 但是，当 Table Storage状态提供者会在其不存在时为你自动创建。

要将 Azure Table Storage配置为状态存储，你需要如下属性：
- **AccountName**：存储账户名称 举例：**mystorageaccount** 举例：**mystorageaccount**
- **AccountKey**：主要或次要存储密钥。
- **TableName**：用于Dapr状态的表名称。 如果表不存在，将会自动创建.

## 分区

Azure Table Storage状态存储使用在 Dapr API 请求中提供的 `key` 属性来确定 `行键`。 服务名称用于`分区键`。 这提供了最好的性能，因为每个服务类型将状态存储在它自己的表分区中。

这个状态存储在表存储中创建一个名为`Value`的列，并将原始状态放在里面。

例如，以下操作来自于名为`myservice`的服务

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

| PartitionKey | RowKey  | 值     |
| ------------ | ------- | ----- |
| myservice    | nihilus | darth |

## 并发（Concurrency）

Azure Table Storage state concurrency is achieved by using `ETag`s according to [the official documentation](https://docs.microsoft.com/en-us/azure/storage/common/storage-concurrency#managing-concurrency-in-table-storage).


## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
