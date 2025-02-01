---
type: docs
title: "Azure Blob 存储"
linkTitle: "Azure Blob 存储"
description: 有关 Azure Blob 存储状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-azure-blobstorage/"
---

## 组件格式

要设置 Azure Blob 存储状态存储，请创建一个类型为 `state.azure.blobstorage` 的组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.azure.blobstorage
  # 支持 v1 和 v2。用户应始终默认使用 v2。没有从 v1 到 v2 的迁移路径，请参见下文的 `versioning`。
  version: v2
  metadata:
  - name: accountName
    value: "[your_account_name]"
  - name: accountKey
    value: "[your_account_key]"
  - name: containerName
    value: "[your_container_name]"
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 使用了明文字符串。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 版本控制

Dapr 提供了两个版本的 Azure Blob 存储状态存储组件：`v1` 和 `v2`。建议所有新应用程序使用 `v2`。`v1` 被视为遗留版本，仅为与现有应用程序的兼容性而保留。

在 `v1` 中，存在一个长期的实现问题，即组件错误地忽略了[键前缀]({{< ref howto-share-state.md >}})，导致 `keyPrefix` 始终被设置为 `none`。  
更新后的 `v2` 组件修复了此问题，使状态存储能够正确地使用 `keyPrefix` 属性。

虽然 `v1` 和 `v2` 具有相同的元数据字段，但它们在其他方面不兼容，`v1` 到 `v2` 没有自动数据迁移路径。

如果您正在使用此组件的 `v1`，建议继续使用 `v1`，直到创建新的状态存储。

## 规格元数据字段

| 字段             | 必需 | 详细信息 | 示例 |
|--------------------|:--------:|---------|---------|
| `accountName` | Y | 存储帐户名称 | `"mystorageaccount"`。 |
| `accountKey` | Y (除非使用 Microsoft Entra ID) | 主存储或辅助存储密钥 | `"key"` |
| `containerName` | Y | 用于 Dapr 状态的容器名称。如果不存在，Blob 存储状态提供者会自动为您创建 | `"container"` |
| `azureEnvironment` | N | 如果使用不同的 Azure 云，则为 Azure 环境的可选名称 | `"AZUREPUBLICCLOUD"` (默认值), `"AZURECHINACLOUD"`, `"AZUREUSGOVERNMENTCLOUD"` |
| `endpoint` | N | 可选的自定义端点 URL。这在使用 [Azurite 模拟器](https://github.com/Azure/azurite) 或使用 Azure 存储的自定义域时很有用（尽管这不是官方支持的）。端点必须是完整的基本 URL，包括协议 (`http://` 或 `https://`)、IP 或 FQDN 以及可选端口。 | `"http://127.0.0.1:10000"` 
| `ContentType` | N | Blob 的内容类型 | `"text/plain"` |
| `ContentMD5` | N | Blob 的 MD5 哈希 | `"vZGKbMRDAnMs4BIwlXaRvQ=="` |
| `ContentEncoding` | N | Blob 的内容编码 | `"UTF-8"` |
| `ContentLanguage` | N | Blob 的内容语言 | `"en-us"` |
| `ContentDisposition` | N | Blob 的内容处置。传达有关如何处理响应负载的附加信息 | `"attachment"` |
| `CacheControl`| N | Blob 的缓存控制 | `"no-cache"` |

## 设置 Azure Blob 存储

[按照 Azure 文档中的说明](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal)创建 Azure 存储帐户。

如果您希望为 Dapr 创建一个容器，可以事先进行。然而，如果不存在，Blob 存储状态提供者会自动为您创建。

为了将 Azure Blob 存储设置为状态存储，您将需要以下属性：

- **accountName**: 存储帐户名称。例如：**mystorageaccount**。
- **accountKey**: 主存储或辅助存储帐户密钥。
- **containerName**: 用于 Dapr 状态的容器名称。如果不存在，Blob 存储状态提供者会自动为您创建。

### 使用 Microsoft Entra ID 进行身份验证

此组件支持使用 Microsoft Entra ID 进行身份验证，作为使用帐户密钥的替代方案。无论何时可能，建议您在生产系统中使用 Microsoft Entra ID 进行身份验证，以利用更好的安全性、精细的访问控制以及在 Azure 上运行的应用程序中使用托管身份的能力。

> 以下脚本针对 bash 或 zsh shell 进行了优化，并需要安装以下应用程序：
>
> - [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
> - [jq](https://stedolan.github.io/jq/download/)
>
> 您还必须在 Azure CLI 中通过 Azure 进行身份验证。

1. 要开始使用 Microsoft Entra ID 进行 Blob 存储状态存储组件的身份验证，请确保您已创建 Microsoft Entra ID 应用程序和服务主体，如[身份验证到 Azure]({{< ref authenticating-azure.md >}})文档中所述。  
  完成后，设置一个变量以存储您创建的服务主体的 ID：

  ```sh
  SERVICE_PRINCIPAL_ID="[your_service_principal_object_id]"
  ```

2. 使用您的 Azure 存储帐户名称和其所在资源组的名称设置以下变量：  
  
  ```sh
  STORAGE_ACCOUNT_NAME="[your_storage_account_name]"
  RG_NAME="[your_resource_group_name]"
  ```

3. 使用 RBAC，为我们的服务主体分配一个角色，以便它可以访问存储帐户内的数据。  
  在这种情况下，您正在分配“存储 Blob 数据贡献者”角色，该角色具有广泛的访问权限；根据您的应用程序，也可以使用其他更具限制性的角色。

  ```sh
  RG_ID=$(az group show --resource-group ${RG_NAME} | jq -r ".id")
  az role assignment create \
    --assignee "${SERVICE_PRINCIPAL_ID}" \
    --role "Storage blob Data Contributor" \
    --scope "${RG_ID}/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT_NAME}"
  ```

当使用 Microsoft Entra ID 对您的组件进行身份验证时，不需要 `accountKey` 字段。请根据[身份验证到 Azure]({{< ref authenticating-azure.md >}})文档，在组件的元数据中指定所需的凭据（如果有）。

例如：

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

### 在 Kubernetes 中

要将 Azure Blob 存储状态存储应用于 Kubernetes，请使用 `kubectl` CLI：

```sh
kubectl apply -f azureblob.yaml
```

### 本地运行

要在本地运行，请创建一个包含 YAML 文件的 `components` 目录，并使用 `--resources-path` 标志将路径提供给 `dapr run` 命令。

此状态存储在容器中创建一个 Blob 文件，并将原始状态放入其中。

例如，以下操作来自名为 `myservice` 的服务：

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

这将在容器中创建一个以 `key` 为文件名、`value` 为文件内容的 Blob 文件。

## 并发

Azure Blob 存储状态并发是通过使用 `ETag` 实现的，具体请参见 [Azure Blob 存储文档](https://docs.microsoft.com/azure/storage/common/storage-concurrency#managing-concurrency-in-blob-storage)。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
