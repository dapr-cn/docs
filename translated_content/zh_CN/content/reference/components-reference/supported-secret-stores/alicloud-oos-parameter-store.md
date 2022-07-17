---
type: docs
title: "AlibabaCloud OOS Parameter Store"
linkTitle: "AlibabaCloud OOS Parameter Store"
description: Detailed information on the AlibabaCloud OOS Parameter Store - secret store component
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/alibabacloud-oos-parameter-store/"
---

## 配置

To setup AlibabaCloud OOS Parameter Store secret store create a component of type `secretstores.alicloud.parameterstore`. 有关如何创建和应用 secretstore 配置，请参阅[本指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})。 有关如何在 Dapr 组件中检索和使用 secret，请参阅 [引用 secrets]({{< ref component-secrets.md >}}) 指南。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: alibabacloudparameterstore
  namespace: default
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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 建议将密钥存储在本地，如[Kubernetes密钥存储]({{< ref kubernetes-secret-store.md >}})或 [本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 元数据字段规范

| 字段              | 必填 | 详情                                                                               | 示例                  |
| --------------- |:--:| -------------------------------------------------------------------------------- | ------------------- |
| regionId        | Y  | The specific region the AlibabaCloud OOS Parameter Store instance is deployed in | `"cn-hangzhou"`     |
| accessKeyId     | Y  | The AlibabaCloud Access Key ID to access this resource                           | `"accessKeyId"`     |
| accessKeySecret | Y  | The AlibabaCloud Access Key Secret to access this resource                       | `"accessKeySecret"` |
| securityToken   | 否  | The AlibabaCloud Security Token to use                                           | `"securityToken"`   |

## Create an AlibabaCloud OOS Parameter Store instance

Setup AlibabaCloud OOS Parameter Store using the AlibabaCloud documentation: https://www.alibabacloud.com/help/en/doc-detail/186828.html.

## 相关链接

- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
