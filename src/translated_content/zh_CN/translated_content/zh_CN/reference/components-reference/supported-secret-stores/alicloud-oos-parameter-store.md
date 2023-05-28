---
type: docs
title: "阿里云 OOS 参数存储"
linkTitle: "阿里云 OOS 参数存储"
description: 有关阿里云 OOS 参数存储 -secret store 组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/alibabacloud-oos-parameter-store/"
---

## Component format

要设置 阿里云 OOS 参数存储secret store，请创建一个类型为`secretstores.alicloud.parameterstore`的组件。 See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 建议将密钥存储在本地，如[Kubernetes密钥存储]({{< ref kubernetes-secret-store.md >}})或 [本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 元数据字段规范

| Field           | 必填 | 详情                    | 示例                  |
| --------------- |:--:| --------------------- | ------------------- |
| regionId        | 是  | 阿里云 OOS 参数存储实例部署的特定区域 | `"cn-hangzhou"`     |
| accessKeyId     | 是  | 用于访问此资源的阿里云访问密钥 ID    | `"accessKeyId"`     |
| accessKeySecret | 是  | 访问此资源的阿里云访问密钥密钥       | `"accessKeySecret"` |
| securityToken   | 否  | 要使用的阿里云安全token        | `"securityToken"`   |

## 创建阿里云OOS参数存储实例

使用阿里云文档设置阿里云OOS参数存储：https://www.alibabacloud.com/help/en/doc-detail/186828.html。

## 相关链接

- [Secrets building block]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [Secret API 参考]({{< ref secrets_api.md >}})