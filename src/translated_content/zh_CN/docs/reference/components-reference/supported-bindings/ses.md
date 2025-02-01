---
type: docs
title: "AWS SES 绑定说明"
linkTitle: "AWS SES"
description: "AWS SES 绑定组件的详细介绍"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/ses/"
---

## 组件格式

要配置 AWS 绑定，请创建一个类型为 `bindings.aws.ses` 的组件。有关如何创建和应用绑定配置的详细信息，请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})。

关于身份验证的更多信息，请参阅[身份验证到 AWS]({{< ref authenticating-aws.md >}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: ses
spec:
  type: bindings.aws.ses
  version: v1
  metadata:
  - name: accessKey
    value: *****************
  - name: secretKey
    value: *****************
  - name: region
    value: "eu-west-1"
  - name: sessionToken
    value: mysession
  - name: emailFrom
    value: "sender@example.com"
  - name: emailTo
    value: "receiver@example.com"
  - name: emailCc
    value: "cc@example.com"
  - name: emailBcc
    value: "bcc@example.com"
  - name: subject
    value: "subject"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保存密钥，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `region`             | 否        | 输出 |  AWS 区域 | `"eu-west-1"`       |
| `accessKey`          | 否        | 输出 | 访问资源的 AWS 访问密钥                              | `"key"`             |
| `secretKey`          | 否        | 输出 | 访问资源的 AWS 秘密访问密钥                       | `"secretAccessKey"` |
| `sessionToken`       | 否        | 输出 | 使用的 AWS 会话令牌                                            | `"sessionToken"`    |
| `emailFrom` | 否 | 输出 | 发件人的电子邮件地址 | `"me@example.com"` |
| `emailTo` | 否 | 输出 | 收件人的电子邮件地址 | `"me@example.com"` |
| `emailCc` | 否 | 输出 | 抄送的电子邮件地址 | `"me@example.com"` |
| `emailBcc` | 否 | 输出 | 密送的电子邮件地址 | `"me@example.com"` |
| `subject` | 否 | 输出 | 电子邮件的主题 | `"subject of mail"` |

{{% alert title="重要" color="warning" %}}
在 EKS（AWS Kubernetes）上运行 Dapr sidecar（daprd）时，如果节点/Pod 已附加了访问 AWS 资源的 IAM 策略，则**不应**在组件规范中提供 AWS 访问密钥、秘密密钥和令牌。
{{% /alert %}}

## 绑定支持

此组件支持以下操作的**输出绑定**：

- `create`

## 示例请求

在每个请求中，您可以指定以下任意可选元数据属性：

- `emailFrom`
- `emailTo`
- `emailCc`
- `emailBcc`
- `subject`

发送电子邮件时，配置中的元数据和请求中的元数据将合并。合并后的元数据集必须至少包含 `emailFrom`、`emailTo`、`emailCc`、`emailBcc` 和 `subject` 字段。

`emailTo`、`emailCc` 和 `emailBcc` 字段可以包含多个用分号分隔的电子邮件地址。

示例：
```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "dapr-smtp-binding@example.net",
    "emailCc": "cc1@example.net",
    "subject": "Email subject"
  },
  "data": "Testing Dapr SMTP Binding"
}
```
`emailTo`、`emailCc` 和 `emailBcc` 字段可以包含多个用分号分隔的电子邮件地址。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})