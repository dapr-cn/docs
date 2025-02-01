---
type: docs
title: "华为云密钥管理服务 (CSMS)"
linkTitle: "华为云密钥管理服务 (CSMS)"
description: 详细介绍华为云密钥管理服务 (CSMS) - 密钥存储组件
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/huaweicloud-csms/"
---

## 组件格式

要配置华为云密钥管理服务 (CSMS) 的密钥存储，需创建一个类型为 `secretstores.huaweicloud.csms` 的组件。请参阅[本指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})了解如何创建和应用密钥存储配置。有关如何[引用密钥]({{< ref component-secrets.md >}})以在 Dapr 组件中检索和使用密钥的信息，请参阅本指南。

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

{{% alert title="警告" color="warning" %}}
上述示例中，密钥以明文字符串形式使用。建议使用本地密钥存储，例如 [Kubernetes 密钥存储]({{< ref kubernetes-secret-store.md >}})或[本地文件]({{< ref file-secret-store.md >}})来确保密钥的安全存储。
{{% /alert %}}

## 元数据字段说明

| 字段             | 必需 | 详细信息                                                        | 示例                |
| --------------- | :--: | --------------------------------------------------------------- | ------------------- |
| region          |  是  | 华为云 CSMS 实例所在的具体区域                                  | `"cn-north-4"`      |
| accessKey       |  是  | 用于访问此资源的华为云访问密钥                                  | `"accessKey"`       |
| secretAccessKey |  是  | 用于访问此资源的华为云密钥访问密钥                              | `"secretAccessKey"` |

## 可选的每请求元数据属性

在从此密钥存储检索密钥时，可以提供以下[可选查询参数]({{< ref "secrets_api#query-parameters" >}})：

查询参数 | 描述
--------- | -----------
`metadata.version_id` | 指定密钥的版本。

## 设置华为云密钥管理服务 (CSMS) 实例

请参考华为云文档以设置华为云密钥管理服务 (CSMS)：https://support.huaweicloud.com/intl/en-us/usermanual-dew/dew_01_9993.html。

## 相关链接

- [密钥构建块]({{< ref secrets >}})
- [操作指南：检索密钥]({{< ref "howto-secrets.md" >}})
- [操作指南：在 Dapr 组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
