---
type: docs
title: "Azure Blob Storage"
linkTitle: "Azure Blob Storage"
description: 关于Azure Blob Store状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-azure-blobstorage/"
---

## Component format

要设置 Azure Blob Storage 状态存储，请创建一个类型为`state.azure.blobstorage`的组件。 See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field                |        必填        | 详情                                                                                                                                                                                                                                                                                                                                        | 示例                                                                                                          |
| -------------------- |:----------------:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `accountName`        |        是         | The storage account name                                                                                                                                                                                                                                                                                                                  | `"mystorageaccount"`.                                                                                       |
| `accountKey`         | 是（除非使用 Azure AD） | 主要或次要存储密钥                                                                                                                                                                                                                                                                                                                                 | `"key"`                                                                                                     |
| `containerName`      |        是         | Dapr 状态的容器名称， 如果容器不存在，将会自动创建.                                                                                                                                                                                                                                                                                                             | `"container"`                                                                                               |
| `azureEnvironment`   |        否         | Azure 环境的可选名称（如果使用其他 Azure 云）                                                                                                                                                                                                                                                                                                             | `"AZUREPUBLICCLOUD"` (default value), `"AZURECHINACLOUD"`, `"AZUREUSGOVERNMENTCLOUD"`, `"AZUREGERMANCLOUD"` |
| `终结点`                |        否         | Optional custom endpoint URL. This is useful when using the [Azurite emulator](https://github.com/Azure/azurite) or when using custom domains for Azure Storage (although this is not officially supported). The endpoint must be the full base URL, including the protocol (`http://` or `https://`), the IP or FQDN, and optional port. | `"http://127.0.0.1:10000"`                                                                                  |
| `ContentType`        |        否         | The blob's content type                                                                                                                                                                                                                                                                                                                   | `"text/plain"`                                                                                              |
| `ContentMD5`         |        否         | The blob's MD5 hash                                                                                                                                                                                                                                                                                                                       | `"vZGKbMRDAnMs4BIwlXaRvQ=="`                                                                                |
| `ContentEncoding`    |        否         | The blob's content encoding                                                                                                                                                                                                                                                                                                               | `"UTF-8"`                                                                                                   |
| `ContentLanguage`    |        否         | The blob's content language                                                                                                                                                                                                                                                                                                               | `"en-us"`                                                                                                   |
| `ContentDisposition` |        否         | The blob's content disposition. Conveys additional information about how to process the response payload                                                                                                                                                                                                                                  | `"attachment"`                                                                                              |
| `CacheControl`       |        否         | The blob's cache control                                                                                                                                                                                                                                                                                                                  | `"no-cache"`                                                                                                |

## 设置 Azure Blob Storage

[Follow the instructions](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal) from the Azure documentation on how to create an Azure Storage Account.

如果你想创建一个容器供Dapr使用，你可以事先这样做。 然而，如果它不存在，Blob Storage 提供程序将会为您自动创建一个。

要将 Azure Blob Storage配置为状态存储，你需要如下属性：

- **accountName**: The storage account name. For example: **mystorageaccount**.
- **accountKey**: Primary or secondary storage account key.
- **containerName**: The name of the container to be used for Dapr state. The container will be created for you if it doesn't exist.

### Authenticating with Azure AD

此组件支持使用 Azure AD 进行身份验证，作为使用账号密钥的替代方法。 为了利用更好的安全性、微调的访问控制以及在 Azure 上运行的引用程序使用托管表示的功能，建议您在生产系统中使用 Azure AD 进行身份验证。

> The following scripts are optimized for a bash or zsh shell and require the following apps installed:
> 
> - [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
> - [jq](https://stedolan.github.io/jq/download/)
> 
> 您还必须在 Azure CLI 中通过 Azure 身份验证。

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

3. 使用 RBAC，将角色分配给服务主体，以便它可以访问存储帐户内的数据。  
   在这种情况下，将分配"Storage blob Data Contributor"角色，该角色具有广泛的访问权限。也可以使用其他限制性更强的角色，具体取决于您的应用程序。

  ```sh
  RG_ID=$(az group show --resource-group ${RG_NAME} | jq -r ".id")
  az role assignment create \
    --assignee "${SERVICE_PRINCIPAL_ID}" \
    --role "Storage blob Data Contributor" \
    --scope "${RG_ID}/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT_NAME}"
  ```

使用 Azure AD 对组件进行身份验证时，不需要 `accountKey` 字段。 相反，请根据 [向 Azure进行身份验证]({{< ref authenticating-azure.md >}}) 文档，在组件的元数据 (如果有) 中指定所需的凭据。

For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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

### In Kubernetes

To apply Azure Blob Storage state store to Kubernetes, use the `kubectl` CLI:

```sh
kubectl apply -f azureblob.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--resources-path`.

This state store creates a blob file in the container and puts raw state inside it.

For example, the following operation coming from service called `myservice`:

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

这将在容器中创建文件名为 `key`，`value` 为内容的 blob 文件。

## 并发

Azure Blob Storage state concurrency is achieved by using `ETag`s according to [the Azure Blob Storage documentation](https://docs.microsoft.com/azure/storage/common/storage-concurrency#managing-concurrency-in-blob-storage).

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
