---
type: docs
title: "HuaweiCloud Cloud Secret Management Service (CSMS)"
linkTitle: "HuaweiCloud Cloud Secret Management Service (CSMS)"
description: Detailed information on the HuaweiCloud Cloud Secret Management Service (CSMS) - secret store component
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/huaweicloud-csms/"
---

## Component format

To setup HuaweiCloud Cloud Secret Management Service (CSMS) secret store create a component of type `secretstores.huaweicloud.csms`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: huaweicloudcsms
spec:
  type: secretstores.huaweicloud.csms
  version: v1
  metadata:
  - name: region
    value: "[huaweicloud_region]"
  - name: accessKey 
    value: "[huaweicloud_access_key]"
  - name: secretAccessKey
    value: "[huaweicloud_secret_access_key]"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 建议将密钥存储在本地，如[Kubernetes密钥存储]({{< ref kubernetes-secret-store.md >}})或 [本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 元数据字段规范

| Field           | 必填 | 详情                                                               | 示例                  |
| --------------- |:--:| ---------------------------------------------------------------- | ------------------- |
| region          | 是  | The specific region the HuaweiCloud CSMS instance is deployed in | `"cn-north-4"`      |
| accessKey       | 是  | The HuaweiCloud Access Key to access this resource               | `"accessKey"`       |
| secretAccessKey | 是  | The HuaweiCloud Secret Access Key to access this resource        | `"secretAccessKey"` |

## Setup HuaweiCloud Cloud Secret Management Service (CSMS) instance

Setup HuaweiCloud Cloud Secret Management Service (CSMS) using the HuaweiCloud documentation: https://support.huaweicloud.com/intl/en-us/usermanual-dew/dew_01_9993.html.

## 相关链接

- [Secrets building block]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [Secret API 参考]({{< ref secrets_api.md >}})
