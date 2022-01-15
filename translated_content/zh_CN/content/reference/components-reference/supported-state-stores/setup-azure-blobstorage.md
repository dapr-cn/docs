---
type: docs
title: "Azure Blob Storage"
linkTitle: "Azure Blob Storage"
description: 关于Azure Blob Store状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-azure-blobstorage/"
---

## 配置

To setup the Azure Blob Storage state store create a component of type `state.azure.blobstorage`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

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
    value: "[your_account_name]"
  - name: accountKey
    value: "[your_account_key]"
  - name: containerName
    value: "[your_container_name]"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                 |            必填             | 详情                                                                                                       | 示例                                                                                                          |
| ------------------ |:-------------------------:| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| accountName        |             Y             | 存储帐户名称                                                                                                   | `"mystorageaccount"`.                                                                                       |
| accountKey         | Y (unless using Azure AD) | 主要或次要存储密钥                                                                                                | `"key"`                                                                                                     |
| containerName      |             Y             | Dapr 状态的容器名称， 如果容器不存在，将会自动创建.                                                                            | `"container"`                                                                                               |
| `azureEnvironment` |             N             | Optional name for the Azure environment if using a different Azure cloud                                 | `"AZUREPUBLICCLOUD"` (default value), `"AZURECHINACLOUD"`, `"AZUREUSGOVERNMENTCLOUD"`, `"AZUREGERMANCLOUD"` |
| ContentType        |             N             | The blob's content type                                                                                  | `"text/plain"`                                                                                              |
| ContentMD5         |             N             | The blob's MD5 hash                                                                                      | `"vZGKbMRDAnMs4BIwlXaRvQ=="`                                                                                |
| ContentEncoding    |             N             | The blob's content encoding                                                                              | `"UTF-8"`                                                                                                   |
| ContentLanguage    |             N             | The blob's content language                                                                              | `"en-us"`                                                                                                   |
| ContentDisposition |             N             | The blob's content disposition. Conveys additional information about how to process the response payload | `"attachment"`                                                                                              |
| CacheControl       |             N             | The blob's cache control                                                                                 | `"no-cache"`                                                                                                |

## Setup Azure Blob Storage

[请遵循 Azure 文档中关于如何创建 Azure Storage Account的说明](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal)。

如果你想创建一个容器供Dapr使用，你可以事先这样做。 However, the Blob Storage state provider will create one for you automatically if it doesn't exist.

要将 Azure Blob Storage配置为状态存储，你需要如下属性：

- **AccountName**：存储账户名称 举例：**mystorageaccount** 举例：**mystorageaccount**
- **accountKey**: Primary or secondary storage account key.
- **ContainerName**：用于Dapr状态的容器名称。 如果容器不存在，将会自动创建.

### Authenticating with Azure AD

This component supports authentication with Azure AD as an alternative to use account keys. Whenever possible, it is recommended that you use  Azure AD for authentication in production systems, to take advantage of better security, fine-tuned access control, and the ability to use managed identities for apps running on Azure.

> The following scripts are optimized for a bash or zsh shell and require the following apps installed:
> 
> - [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
> - [jq](https://stedolan.github.io/jq/download/)
> 
> You must also be authenticated with Azure in your Azure CLI.

1. To get started with using Azure AD for authenticating the Blob Storage state store component, make sure you've created an Azure AD application and a Service Principal as explained in the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.  
   Once done, set a variable with the ID of the Service Principal that you created:

  ```sh
  SERVICE_PRINCIPAL_ID="[your_service_principal_object_id]"
  ```

2. Set the following variables with the name of your Azure Storage Account and the name of the Resource Group where it's located:

  ```sh
  STORAGE_ACCOUNT_NAME="[your_storage_account_name]"
  RG_NAME="[your_resource_group_name]"
  ```

3. Using RBAC, assign a role to our Service Principal so it can access data inside the Storage Account.  
   In this case, you are assigning the "Storage blob Data Contributor" role, which has broad access; other more restrictive roles can be used as well, depending on your application.

  ```sh
  RG_ID=$(az group show --resource-group ${RG_NAME} | jq -r ".id")
  az role assignment create \
    --assignee "${SERVICE_PRINCIPAL_ID}" \
    --role "Storage blob Data Contributor" \
    --scope "${RG_ID}/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT_NAME}"
  ```

When authenticating your component using Azure AD, the `accountKey` field is not required. Instead, please specify the required credentials in the component's metadata (if any) according to the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.

例如:

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
    value: "[your_account_name]"
  - name: containerName
    value: "[your_container_name]"
  - name: azureTenantId
    value: "[your_tenant_id]"
  - name: azureClientId
    value: "[your_client_id]"
  - name: azureClientSecret
    value : "[your_client_secret]"
```

## 应用配置

### 在Kubernetes中

要将 Azure Blob Storage状态存储应用到Kubernetes，请执行如下`kubectl` CLI：

```sh
kubectl apply -f azureblob.yaml
```

### 本地运行

要在本地运行，创建一个包含YAML文件的`components`目录，并提供`dapr run`命令的路径，标志为`--components-path`。

这个状态存储在容器中创建一个blob文件，并将原始状态放在里面。

例如，以下操作来自于名为`myservice`的服务:

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

This creates the blob file in the container with `key` as filename and `value` as the contents of file.

## 并发（Concurrency）

根据[Azure Blob Storage文档](https://docs.microsoft.com/azure/storage/common/storage-concurrency#managing-concurrency-in-blob-storage)，通过使用`ETag`实现Azure Blob Storage状态并发。

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
