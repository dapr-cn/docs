---
type: docs
title: "Azure Cosmos DB 绑定规范"
linkTitle: "Azure Cosmos DB"
description: "Azure Cosmos DB 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/cosmosdb/"
---

## 配置

要设置 Azure Cosmos DB 绑定，请创建一个类型为 `bindings.azure.cosmosdb` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.cosmosdb
  version: v1
  metadata:
  - name: url
    value: https://******.documents.azure.com:443/
  - name: masterKey
    value: *****
  - name: database
    value: db
  - name: collection
    value: collection
  - name: partitionKey
    value: message
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持 | 详情                                                           | 示例                                          |
| ------------ |:--:| ---- | ------------------------------------------------------------ | ------------------------------------------- |
| url          | 是  | 输出   | Cosmos DB 地址                                                 | `"https://******.documents.azure.com:443/"` |
| masterKey    | 是  | 输出   | Cosmos DB 账户主键                                               | `"master-key"`                              |
| database     | 是  | 输出   | Cosmos DB 数据库名                                               | `"OrderDb"`                                 |
| collection   | 是  | 输出   | 数据库中容器的名称。                                                   | `"Orders"`                                  |
| partitionKey | 是  | 输出   | 要从用作分区键的有效负载（要创建的文档）中提取键的名称。 此名称必须与创建 Cosmos DB 容器时指定的分区键匹配。 | `"OrderId"`, `"message"`                    |

欲了解更多信息，请参阅 [Azure Cosmos DB 资源模型](https://docs.microsoft.com/azure/cosmos-db/account-databases-containers-items)。

### Azure Active Directory (Azure AD) 认证

Azure Cosmos DB绑定组件支持使用所有Azure Active Directory机制进行认证。 更多信息和相关组件的元数据字段根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

您可以在</a>下面的
部分中阅读有关使用 Azure AD 身份验证设置 Cosmos DB 的其他信息。</p> 



## 绑定支持

该组件支持以下操作的 **输出绑定**：

- `create`



## 生产使用的最佳实践

Azure Cosmos DB 在单个 Azure Cosmos DB 账户下的所有数据库中共享严格的元数据请求速率限制。 对 Azure Cosmos DB 的新连接承担了很大比例的允许请求率限制。 （请参阅 [Cosmos DB 文档](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3)）

因此，必须应用多种策略来避免同时连接到 Azure Cosmos DB：

- 确保应用程序的 sidecar 仅在需要时加载 Azure Cosmos DB 组件，以避免不必要的数据库连接。 这可以通过[将组件的范围限定为特定应用程序]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes)来完成。
- 选择按顺序部署或启动应用程序的部署策略，以最大程度地减少 Azure Cosmos DB 账户新连接造成的影响。
- 避免对不相关的数据库或系统（甚至在 Dapr 外部）重用同一 Azure Cosmos DB 账户。 不同的 Azure Cosmos DB 账户具有不同的速率限制。
- 增加 `initTimeout` 值，以允许组件在 sidecar 初始化期间重试连接到 Azure Cosmos DB，最长5分钟。 默认值是 `5s` ，应该增加。 使用 Kubernetes 时，增加此值可能还需要更新您的 [Readiness 和 Liveness 探针](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。



```yaml
spec:
  type: bindings.azure.cosmosdb
  version: v1
  initTimeout: 5m
  metadata:
```




## 日期格式

**输出绑定** `创建` 操作需要以下键存在于要创建的每个文档的有效负载中：

- `id`: 要创建的文档的唯一 ID
- `<partitionKey>`: 通过组件定义中 `spec.partitionKey` 指定的分区键的名称。 这还必须与创建 Cosmos DB 容器时指定的分区键匹配。



## 设置 Cosmos DB 以使用 Azure AD 进行身份验证

当使用Dapr Cosmos DB绑定组件并使用Azure AD进行身份认证时，你需要执行一些额外的步骤去设置你的环境。

前期准备:

- 您需要按照[向Azure进行身份验证]({{< ref authenticating-azure.md >}}) 中的说明创建服务主体。 使用下列命令，需要服务主体的ID（注意 一点，这与应用的客户端ID或者在metadata中设置的`azureClientId` 的值都不同）。
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- 下面的脚本针对 bash 或 zsh shell 进行了优化



> 使用 Cosmos DB 绑定时，您 **不** 需要像在 Cosmos DB 状态存储中那样创建存储过程。



### 授予 Azure AD 应用程序对 Cosmos DB 的访问权限



> 你可以在[official documentation](https://docs.microsoft.com/azure/cosmos-db/how-to-setup-rbac), 查询到更多信息，包括分配更多精细权限的说明。

为了授予您的应用程序访问存储在 Cosmos DB 中的数据的权限，你需要为其分配 Cosmos DB 数据平面的自定义角色。 在此示例中，你将使用内置角色“Cosmos DB 内置数据参与者”，该角色授予应用程序对数据的完全读写访问权限; 您可以选择按照官方文档中的说明创建自定义的微调角色。



```sh
# Name of the Resource Group that contains your Cosmos DB
RESOURCE_GROUP="..."
# Name of your Cosmos DB account
ACCOUNT_NAME="..."
# ID of your Service Principal object
PRINCIPAL_ID="..."
# ID of the "Cosmos DB Built-in Data Contributor" role
# You can also use the ID of a custom role
ROLE_ID="00000000-0000-0000-0000-000000000002"

az cosmosdb sql role assignment create \
  --account-name "$ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --scope "/" \
  --principal-id "$PRINCIPAL_ID" \
  --role-definition-id "$ROLE_ID"
```




## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
