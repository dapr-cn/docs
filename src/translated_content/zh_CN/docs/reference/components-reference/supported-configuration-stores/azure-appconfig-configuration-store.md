---
type: docs
title: "Azure 应用配置"
linkTitle: "Azure 应用配置"
description: 详细介绍 Azure 应用配置组件
aliases:
  - "/zh-hans/operations/components/setup-configuration-store/supported-configuration-stores/setup-azure-appconfig/"
---

## 组件格式

要设置 Azure 应用配置，需创建一个类型为 `configuration.azure.appconfig` 的组件。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: configuration.azure.appconfig
  version: v1
  metadata:
  - name: host # 使用 Azure 身份验证时应使用此项。
    value: <HOST>
  - name: connectionString # 使用 Azure 身份验证时不应使用此项。
    value: <CONNECTIONSTRING>
  - name: maxRetries
    value: # 可选
  - name: retryDelay
    value: # 可选
  - name: maxRetryDelay
    value: # 可选
  - name: azureEnvironment # 可选，默认为 AZUREPUBLICCLOUD
    value: "AZUREPUBLICCLOUD"
  # 请参阅下方的身份验证部分以了解所有选项
  - name: azureTenantId # 可选
    value: "[your_service_principal_tenant_id]"
  - name: azureClientId # 可选
    value: "[your_service_principal_app_id]"
  - name: azureCertificateFile # 可选
    value : "[pfx_certificate_file_fully_qualified_local_path]"
  - name: subscribePollInterval # 可选
    value: #可选 [格式示例 - 24h]

```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用 secret 存储来存储 secret，详见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段                      | 必需 | 详情 | 示例 |
|----------------------------|:--------:|---------|---------|
| connectionString  | Y*       | Azure 应用配置实例的连接字符串。无默认值。可以使用 `secretKeyRef` 引用 secret。*与 host 字段互斥。*在使用 [Azure 身份验证](https://docs.dapr.io/developing-applications/integrations/azure/azure-authentication/authenticating-azure/) 时不使用 | `Endpoint=https://foo.azconfig.io;Id=osOX-l9-s0:sig;Secret=00000000000000000000000000000000000000000000`
| host              | N*       | Azure 应用配置实例的端点。无默认值。*与 connectionString 字段互斥。*在使用 [Azure 身份验证](https://docs.dapr.io/developing-applications/integrations/azure/azure-authentication/authenticating-azure/) 时使用 | `https://dapr.azconfig.io`
| maxRetries                 | N        | 最大重试次数，默认为 `3` | `5`, `10`
| retryDelay                 | N        | 初始重试延迟时间，默认为 `4` 秒；`"-1"` 禁用重试延迟。延迟会随着每次重试呈指数增长，直到达到 maxRetryDelay 指定的最大值。 | `4s`
| maxRetryDelay              | N        | 允许的最大重试延迟时间，通常大于或等于 retryDelay。默认为 `120` 秒；`"-1"` 禁用限制 | `120s`
| subscribePollInterval      | N        | 轮询订阅键以检测更改的间隔时间（以纳秒为单位）。未来将更新为 Go 时间格式。默认间隔为 `24` 小时。 | `24h`

**注意**：必须指定 `host` 或 `connectionString`。

## 使用连接字符串进行身份验证

通过连接字符串访问应用配置实例，该字符串可在 Azure 门户中获取。由于连接字符串包含敏感信息，建议将其视为 secret 并[使用 secret 存储]({{< ref component-secrets.md >}})。

## 使用 Microsoft Entra ID 进行身份验证

Azure 应用配置组件还支持使用 Microsoft Entra ID 进行身份验证。在启用此组件之前：
- 阅读[Azure 身份验证]({{< ref authenticating-azure.md >}})文档。
- 创建一个 Microsoft Entra ID 应用程序（也称为服务主体）。
- 或者，为您的应用程序平台创建托管身份。

## 设置 Azure 应用配置

您需要一个 Azure 订阅来设置 Azure 应用配置。

1. [启动 Azure 应用配置创建流程](https://ms.portal.azure.com/#create/Microsoft.Azconfig)。如有必要，请登录。
1. 点击 **创建** 以启动 Azure 应用配置实例的部署。
1. 创建实例后，获取 **端点** 或 **连接字符串**：
   - 对于端点：导航到资源的 **概览** 并复制 **端点**。
   - 对于连接字符串：导航到 **设置** > **访问密钥** 并复制连接字符串。
1. 将端点或连接字符串添加到 Dapr 的 `azappconfig.yaml` 文件中。
     
   将 `host` 键设置为 `[Endpoint]` 或将 `connectionString` 键设置为您之前保存的值。
   
   {{% alert title="注意" color="primary" %}}
   在生产环境中，请遵循[秘密管理]({{< ref component-secrets.md >}})说明以安全管理您的 secret。
   {{% /alert %}}

## Azure 应用配置请求元数据 

在 Azure 应用配置中，您可以为同一键定义不同标签的值。例如，您可以为开发和生产环境定义不同的值。您可以指定在连接到应用配置时要加载的标签。

Azure 应用配置组件支持以下可选的 `label` 元数据属性：

`label`：要检索的配置的标签。如果不存在，配置存储将返回指定键和空标签的配置。

标签可以通过请求 URL 中的查询参数指定：

```bash
GET curl http://localhost:<daprPort>/v1.0/configuration/<store-name>?key=<key name>&metadata.label=<label value>
```

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [配置构建块]({{< ref configuration-api-overview >}})
