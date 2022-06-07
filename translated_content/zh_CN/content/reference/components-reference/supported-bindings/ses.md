---
type: docs
title: "AWS SES binding spec"
linkTitle: "AWS SES"
description: "Detailed documentation on the AWS SES binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/ses/"
---

## 配置

要设置 AWS 绑定，请创建一个类型为 `bindings.aws.ses` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

有关身份验证相关属性的信息，请参阅 [向 AWS 进行身份验证]({{< ref authenticating-aws.md >}})

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: ses
  namespace: default
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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持 | 详情                                | 示例                  |
| ------------ |:--:| ---- | --------------------------------- | ------------------- |
| region       | Y  | 输出   | 指定的 AWS 区域（region）                | `"eu-west-1"`       |
| accessKey    | Y  | 输出   | 要访问此资源的 AWS 访问密钥                  | `"key"`             |
| secretKey    | Y  | 输出   | 要访问此资源的 AWS 密钥访问 Key              | `"secretAccessKey"` |
| sessionToken | 否  | 输出   | 要使用的 AWS 会话令牌                     | `"sessionToken"`    |
| emailFrom    | N  | 输出   | 指定发件人地址 [另见](#example-request)    | `"me@example.com"`  |
| emailTo      | N  | 输出   | 指定收件人地址。 [另见](#example-request)   | `"me@example.com"`  |
| emailCc      | N  | 输出   | 指定抄送人地址。 [另见](#example-request)   | `"me@example.com"`  |
| emailBcc     | N  | 输出   | 指定秘密抄送人地址。 [另见](#example-request) | `"me@example.com"`  |
| subject      | N  | 输出   | 指定邮件信息的主题。 [另见](#example-request) | `"subject of mail"` |



## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 请求示例

您可以为每个请求指定以下任何可选元数据属性：

- `emailFrom`
- `emailTo`
- `emailCc`
- `emailBcc`
- `subject`

发送电子邮件时，配置和请求中的元数据会合并。 元数据的合集必须至少包含 `emailFrom`、 `emailTo`、 `emailCc`、 `emailBcc` 和 `subject` 字段。

`emailTo`、 `emailCc` 和 `emailBcc` 字段可以包含多个电子邮件地址，以分号分隔。

示例:
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
`emailTo`、 `emailCc` 和 `emailBcc` 字段可以包含多个电子邮件地址，以分号分隔。
## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
