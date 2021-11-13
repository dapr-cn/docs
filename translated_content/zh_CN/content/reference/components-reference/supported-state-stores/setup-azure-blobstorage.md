---
type: docs
title: "Azure Blob Storage"
linkTitle: "Azure Blob Storage"
description: 关于Azure Blob Store状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-azure-blobstorage/"
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
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}


## 元数据字段规范

| 字段            | 必填 | 详情                            | Example               |
| ------------- |:--:| ----------------------------- | --------------------- |
| accountName   | Y  | 存储帐户名称                        | `"mystorageaccount"`. |
| accountKey    | Y  | 主要或次要存储密钥                     | `"key"`               |
| containerName | Y  | Dapr 状态的容器名称， 如果容器不存在，将会自动创建. | `"container"`         |

## 安装Azure Blobstorage

[请遵循 Azure 文档中关于如何创建 Azure Storage Account的说明](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal)。

如果你想创建一个容器供Dapr使用，你可以事先这样做。 但是，当 Blob Storage状态提供者会在其不存在时为你自动创建。

要将 Azure Blob Storage配置为状态存储，你需要如下属性：
- **AccountName**：存储账户名称 举例：**mystorageaccount** 举例：**mystorageaccount**
- **AccountKey**：主要或次要存储密钥。
- **ContainerName**：用于Dapr状态的容器名称。 如果容器不存在，将会自动创建.

## 应用配置

### 在Kubernetes中

要将 Azure Blob Storage状态存储应用到Kubernetes，请执行如下`kubectl` CLI：

```
kubectl apply -f azureblob.yaml
```
### 本地运行

要在本地运行，创建一个包含YAML文件的`components`目录，并提供`dapr run`命令的路径，标志为`--components-path`。

这个状态存储在容器中创建一个blob文件，并将原始状态放在里面。

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

在容器中创建blob文件，文件名为`key`，文件内容为`value`。

## 并发（Concurrency）

根据[Azure Blob Storage文档](https://docs.microsoft.com/en-us/azure/storage/common/storage-concurrency#managing-concurrency-in-blob-storage)，通过使用`ETag`实现Azure Blob Storage状态并发。

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
