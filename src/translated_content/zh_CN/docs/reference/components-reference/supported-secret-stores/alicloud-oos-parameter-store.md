---
type: docs
title: "阿里云 OOS 参数存储"
linkTitle: "阿里云 OOS 参数存储"
description: 详细介绍阿里云 OOS 参数存储的密钥存储组件
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/alibabacloud-oos-parameter-store/"
---

## 组件格式

要配置阿里云 OOS 参数存储的密钥存储，需创建一个类型为 `secretstores.alicloud.parameterstore` 的组件。请参阅[本指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})了解如何创建和应用密钥存储配置。请参阅本指南，了解如何在 Dapr 组件中引用和使用 secret。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: alibabacloudparameterstore
spec:
  type: secretstores.alicloud.parameterstore
  version: v1
  metadata:
  - name: regionId
    value: "[alicloud_region_id]"
  - name: accessKeyId 
    value: "[alicloud_access_key_id]"
  - name: accessKeySecret
    value: "[alicloud_access_key_secret]"
  - name: securityToken
    value: "[alicloud_security_token]"
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用本地密钥存储，例如 [Kubernetes 密钥存储]({{< ref kubernetes-secret-store.md >}})或[本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详细信息                                                                 | 示例             |
|--------------------|:--------:|-------------------------------------------------------------------------|---------------------|
| regionId           | Y        | 部署阿里云 OOS 参数存储实例的特定区域 | `"cn-hangzhou"`     |
| accessKeyId        | Y        | 访问此资源的阿里云访问密钥 ID                  | `"accessKeyId"`      |
| accessKeySecret    | Y        | 访问此资源的阿里云访问密钥 Secret              | `"accessKeySecret"`  |
| securityToken      | N        | 使用的阿里云安全令牌                                  | `"securityToken"`    |

## 可选的每请求元数据属性

在从此密钥存储检索 secret 时，可以提供以下[可选查询参数]({{< ref "secrets_api.md#query-parameters" >}})：

查询参数 | 描述
--------- | -----------
`metadata.version_id` | 指定 secret 密钥的版本
`metadata.path` | （仅用于批量请求）元数据中的路径。如果未设置，默认为根路径（所有 secret）。

## 创建阿里云 OOS 参数存储实例

请参考阿里云文档，了解如何设置阿里云 OOS 参数存储：https://www.alibabacloud.com/help/en/doc-detail/186828.html。

## 相关链接

- [Secret 构建块]({{< ref secrets >}})
- [操作指南：检索 secret]({{< ref "howto-secrets.md" >}})
- [操作指南：在 Dapr 组件中引用 secret]({{< ref component-secrets.md >}})
- [Secret API 参考]({{< ref secrets_api.md >}})
