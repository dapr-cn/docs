---
type: docs
title: "Azure Cosmos DB binding spec"
linkTitle: "Azure Cosmos DB"
description: "Detailed documentation on the Azure Cosmos DB binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/cosmosdb/"
---

## 配置

To setup Azure Cosmos DB binding create a component of type `bindings.azure.cosmosdb`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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

| 字段           | 必填 | 绑定支持 | 详情                                                                                                                      | 示例                                          |
| ------------ |:--:| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| url          | Y  | 输出   | The Cosmos DB url                                                                                                       | `"https://******.documents.azure.com:443/"` |
| masterKey    | Y  | 输出   | The Cosmos DB account master key                                                                                        | `"master-key"`                              |
| database     | Y  | 输出   | The name of the Cosmos DB database                                                                                      | `"OrderDb"`                                 |
| collection   | Y  | 输出   | 数据库中容器的名称。                                                                                                              | `"Orders"`                                  |
| partitionKey | Y  | 输出   | 要从用作分区键的有效负载（要创建的文档）中提取键的名称。 This name must match the partition key specified upon creation of the Cosmos DB container. | `"OrderId"`, `"message"`                    |

For more information see [Azure Cosmos DB resource model](https://docs.microsoft.com/azure/cosmos-db/account-databases-containers-items).

### Azure Active Directory (Azure AD) authentication

The Azure Cosmos DB binding component supports authentication using all Azure Active Directory mechanisms. 更多信息和相关组件的元数据字段根据选择的AAD认证机制，参考[Azure认证文档]({{< ref authenticating-azure.md >}})。

You can read additional information for setting up Cosmos DB with Azure AD authentication in the [section below](#setting-up-cosmos-db-for-authenticating-with-azure-ad).

## 绑定支持

字段名为 `ttlInSeconds`。

- `create`

## 生产使用的最佳实践

Azure Cosmos DB shares a strict metadata request rate limit across all databases in a single Azure Cosmos DB account. New connections to Azure Cosmos DB assume a large percentage of the allowable request rate limit. (See the [Cosmos DB documentation](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3))

Therefore several strategies must be applied to avoid simultaneous new connections to Azure Cosmos DB:

- Ensure sidecars of applications only load the Azure Cosmos DB component when they require it to avoid unnecessary database connections. 这可以通过[将组件的范围限定为特定应用程序]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes)来完成。
- Choose deployment strategies that sequentially deploy or start your applications to minimize bursts in new connections to your Azure Cosmos DB accounts.
- Avoid reusing the same Azure Cosmos DB account for unrelated databases or systems (even outside of Dapr). Distinct Azure Cosmos DB accounts have distinct rate limits.
- Increase the `initTimeout` value to allow the component to retry connecting to Azure Cosmos DB during side car initialization for up to 5 minutes. 默认值是 `5s` ，应该增加。 使用 Kubernetes 时，增加此值可能还需要更新您的 [Readiness 和 Liveness 探针](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。

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
- `<partitionKey>`: 通过组件定义中 `spec.partitionKey` 指定的分区键的名称。 This must also match the partition key specified upon creation of the Cosmos DB container.

## Setting up Cosmos DB for authenticating with Azure AD

When using the Dapr Cosmos DB binding and authenticating with Azure AD, you need to perform a few additional steps to set up your environment.

前期准备:

- You need a Service Principal created as per the instructions in the [authenticating to Azure]({{< ref authenticating-azure.md >}}) page. You need the ID of the Service Principal for the commands below (note that this is different from the client ID of your application, or the value you use for `azureClientId` in the metadata).
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- The scripts below are optimized for a bash or zsh shell

> When using the Cosmos DB binding, you **don't** need to create stored procedures as you do in the case of the Cosmos DB state store.

### Granting your Azure AD application access to Cosmos DB

> You can find more information on the [official documentation](https://docs.microsoft.com/azure/cosmos-db/how-to-setup-rbac), including instructions to assign more granular permissions.

In order to grant your application permissions to access data stored in Cosmos DB, you need to assign it a custom role for the Cosmos DB data plane. In this example you're going to use a built-in role, "Cosmos DB Built-in Data Contributor", which grants your application full read-write access to the data; you can optionally create custom, fine-tuned roles following the instructions in the official docs.

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
