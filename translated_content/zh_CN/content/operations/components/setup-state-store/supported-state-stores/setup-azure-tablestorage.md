---
type: docs
title: "Azure Table Storage"
linkTitle: "Azure Table Storage"
description: Detailed information on the Azure Table Storage state store component
---

## Component format

To setup Azure Tablestorage state store create a component of type `state.azure.tablestorage`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration. To setup SQL Server state store create a component of type `state.sqlserver`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

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
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段          | Required | Details                                                                                                                                                      | Example               |
| ----------- |:--------:| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| accountName |    Y     | The storage account name                                                                                                                                     | `"mystorageaccount"`. |
| accountKey  |    Y     | Primary or secondary storage key                                                                                                                             | `"key"`               |
| tableName   |    Y     | The name of the table to be used for Dapr state. The table will be created for you if it doesn't exist The table will be created for you if it doesn't exist | `"table"`             |

## Setup Azure Table Storage

[Follow the instructions](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal) from the Azure documentation on how to create an Azure Storage Account.

If you wish to create a table for Dapr to use, you can do so beforehand. If you wish to create a table for Dapr to use, you can do so beforehand. However, Table Storage state provider will create one for you automatically if it doesn't exist.

In order to setup Azure Table Storage as a state store, you will need the following properties:
- **AccountName**: The storage account name. For example: **mystorageaccount**. For example: **mystorageaccount**.
- **AccountKey**: Primary or secondary storage key.
- **TableName**: The name of the table to be used for Dapr state. The table will be created for you if it doesn't exist. The table will be created for you if it doesn't exist.

## Partitioning

The Azure Table Storage state store uses the `key` property provided in the requests to the Dapr API to determine the `row key`. Service Name is used for `partition key`. This provides best performance, as each service type stores state in it's own table partition. Service Name is used for `partition key`. This provides best performance, as each service type stores state in it's own table partition.

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

| PartitionKey | RowKey  | Value |
| ------------ | ------- | ----- |
| myservice    | nihilus | darth |

## Concurrency

Azure Table Storage state concurrency is achieved by using `ETag`s according to [the official documenation](https://docs.microsoft.com/en-us/azure/storage/common/storage-concurrency#managing-concurrency-in-table-storage).


## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
