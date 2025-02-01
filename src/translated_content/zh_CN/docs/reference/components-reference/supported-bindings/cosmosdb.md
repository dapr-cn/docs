---
type: docs
title: "Azure Cosmos DB (SQL API) 绑定说明"
linkTitle: "Azure Cosmos DB (SQL API)"
description: "关于 Azure Cosmos DB (SQL API) 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/cosmosdb/"
---

## 组件配置格式

要设置 Azure Cosmos DB 绑定，请创建一个类型为 `bindings.azure.cosmosdb` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.cosmosdb
  version: v1
  metadata:
  - name: url
    value: "https://******.documents.azure.com:443/"
  - name: masterKey
    value: "*****"
  - name: database
    value: "OrderDb"
  - name: collection
    value: "Orders"
  - name: partitionKey
    value: "<message>"
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 | 详情 | 示例 |
|--------------------|:--------:|--------|---------|---------|
| `url` | Y | 输出 | Cosmos DB 的 URL | `"https://******.documents.azure.com:443/"` |
| `masterKey` | Y | 输出 | Cosmos DB 帐户的主密钥 | `"master-key"` |
| `database` | Y | 输出 | Cosmos DB 数据库的名称 | `"OrderDb"` |
| `collection` | Y | 输出 | 数据库容器的名称。  | `"Orders"` |
| `partitionKey` | Y | 输出 | 从文档负载中提取的分区键的名称。此名称必须与创建 Cosmos DB 容器时指定的分区键一致。 | `"OrderId"`, `"message"` |

有关更多信息，请参阅 [Azure Cosmos DB 资源模型](https://docs.microsoft.com/azure/cosmos-db/account-databases-containers-items)。

### Microsoft Entra 身份认证

Azure Cosmos DB 绑定组件支持使用所有 Microsoft Entra 身份认证机制。有关更多信息以及根据选择的 Microsoft Entra 身份认证机制提供的相关组件元数据字段，请参阅[认证到 Azure 的文档]({{< ref authenticating-azure.md >}})。

您可以在[下面的部分](#setting-up-cosmos-db-for-authenticating-with-azure-ad)阅读有关使用 Azure AD 认证设置 Cosmos DB 的更多信息。

## 绑定支持

此组件支持具有以下操作的**输出绑定**：

- `create`

## 生产环境最佳实践

Azure Cosmos DB 在单个 Azure Cosmos DB 帐户中的所有数据库之间共享严格的元数据请求速率限制。新的 Azure Cosmos DB 连接会占用允许的请求速率限制的大部分。（请参阅 [Cosmos DB 文档](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3)）

因此，必须采取一些策略来避免同时建立新的 Azure Cosmos DB 连接：

- 确保应用程序的 sidecar 仅在需要时加载 Azure Cosmos DB 组件，以避免不必要的数据库连接。这可以通过[将组件限定到特定应用程序]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes)来实现。
- 选择按顺序部署或启动应用程序的部署策略，以最大限度地减少对 Azure Cosmos DB 帐户的新连接突发。
- 避免为不相关的数据库或系统（即使在 Dapr 之外）重用同一个 Azure Cosmos DB 帐户。不同的 Azure Cosmos DB 帐户具有不同的速率限制。
- 增加 `initTimeout` 值，以允许组件在 sidecar 初始化期间重试连接到 Azure Cosmos DB，最长可达 5 分钟。默认值为 `5s`，应增加。当使用 Kubernetes 时，增加此值可能还需要更新您的[就绪和存活探针](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。

```yaml
spec:
  type: bindings.azure.cosmosdb
  version: v1
  initTimeout: 5m
  metadata:
```

## 数据格式

**输出绑定** `create` 操作要求在每个要创建的文档的负载中存在以下键：

- `id`: 要创建的文档的唯一 ID
- `<partitionKey>`: 在组件定义中通过 `spec.partitionKey` 指定的分区键的名称。这也必须与创建 Cosmos DB 容器时指定的分区键一致。

## 设置 Cosmos DB 以使用 Azure AD 进行认证

使用 Dapr Cosmos DB 绑定并使用 Azure AD 进行认证时，您需要执行一些额外步骤来设置您的环境。

先决条件：

- 您需要根据[认证到 Azure]({{< ref authenticating-azure.md >}})页面中的说明创建一个服务主体。您需要服务主体的 ID 以用于下面的命令（请注意，这与应用程序的客户端 ID 或您在元数据中使用的 `azureClientId` 值不同）。
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- 以下脚本针对 bash 或 zsh shell 进行了优化

> 使用 Cosmos DB 绑定时，您**不需要**像在 Cosmos DB state 存储的情况下那样创建存储过程。

### 授予您的 Azure AD 应用程序访问 Cosmos DB 的权限

> 您可以在[官方文档](https://docs.microsoft.com/azure/cosmos-db/how-to-setup-rbac)中找到更多信息，包括分配更细粒度权限的说明。

为了授予您的应用程序访问存储在 Cosmos DB 中的数据的权限，您需要为 Cosmos DB 数据平面分配一个自定义角色。在此示例中，您将使用内置角色 "Cosmos DB Built-in Data Contributor"，该角色授予您的应用程序对数据的完全读写访问权限；您可以选择按照官方文档中的说明创建自定义的、精细调整的角色。

```sh
# 包含您的 Cosmos DB 的资源组的名称
RESOURCE_GROUP="..."
# 您的 Cosmos DB 帐户的名称
ACCOUNT_NAME="..."
# 您的服务主体对象的 ID
PRINCIPAL_ID="..."
# "Cosmos DB Built-in Data Contributor" 角色的 ID
# 您也可以使用自定义角色的 ID
ROLE_ID="00000000-0000-0000-0000-000000000002"

az cosmosdb sql role assignment create \
  --account-name "$ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --scope "/" \
  --principal-id "$PRINCIPAL_ID" \
  --role-definition-id "$ROLE_ID"
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
