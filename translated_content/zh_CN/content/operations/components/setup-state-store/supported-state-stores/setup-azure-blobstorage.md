---
type: docs
title: "Azure Blob Storage"
linkTitle: "Azure Blob Storage"
description: 关于Azure Blob Store状态存储组件的详细信息
---

## 配置

要设置 Azure Blobstorage状态存储，请创建一个类型为`state.azure.blobstorage`的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.blobstorage
  version: v1
  metadata:
  - name: accountName
    value: <REPLACE-WITH-ACCOUNT-NAME>
  - name: accountKey
    value: <REPLACE-WITH-ACCOUNT-KEY>
  - name: containerName
    value: <REPLACE-WITH-CONTAINER-NAME>
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 更推荐的方式是使用密钥储存，请参阅 [此处]({{< ref component-secrets.md >})。
{{% /alert %}}


## 元数据字段规范

| 字段            | 必填 | 详情                                                                                                                                                                       | Example               |
| ------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| accountName   | Y  | The storage account name                                                                                                                                                 | `"mystorageaccount"`. |
| accountKey    | Y  | Primary or secondary storage key                                                                                                                                         | `"key"`               |
| containerName | Y  | The name of the container to be used for Dapr state. The container will be created for you if it doesn't exist The container will be created for you if it doesn't exist | `"container"`         |

## Setup Azure Blobstorage

[Follow the instructions](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal) from the Azure documentation on how to create an Azure Storage Account.

If you wish to create a container for Dapr to use, you can do so beforehand. If you wish to create a container for Dapr to use, you can do so beforehand. However, Blob Storage state provider will create one for you automatically if it doesn't exist.

In order to setup Azure Blob Storage as a state store, you will need the following properties:
- **AccountName**: The storage account name. For example: **mystorageaccount**. For example: **mystorageaccount**.
- **AccountKey**: Primary or secondary storage key.
- **ContainerName**: The name of the container to be used for Dapr state. The container will be created for you if it doesn't exist. The container will be created for you if it doesn't exist.

## Apply the configuration

### In Kubernetes

To apply Azure Blob Storage state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f azureblob.yaml
```
### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.

This state store creates a blob file in the container and puts raw state inside it.

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

creates the blob file in the containter with `key` as filename and `value` as the contents of file.

## Concurrency

Azure Blob Storage state concurrency is achieved by using `ETag`s according to [the Azure Blob Storage documentation](https://docs.microsoft.com/en-us/azure/storage/common/storage-concurrency#managing-concurrency-in-blob-storage).

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
