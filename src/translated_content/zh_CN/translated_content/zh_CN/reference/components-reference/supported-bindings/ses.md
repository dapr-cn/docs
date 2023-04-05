---
type: docs
title: "AWS SES 绑定规范"
linkTitle: "AWS SES"
description: "AWS SES 绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/ses/"
---

## Component format

To setup AWS binding create a component of type `bindings.aws.ses`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

有关身份验证相关属性的信息，请参阅 [向 AWS 进行身份验证]({{< ref authenticating-aws.md >}})

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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field        | 必填 | 绑定支持   | 详情                                | 示例                  |
| ------------ |:--:| ------ | --------------------------------- | ------------------- |
| region       | 否  | Output | 指定的 AWS 区域（region）                | `"eu-west-1"`       |
| accessKey    | 否  | 输出     | 要访问此资源的 AWS 访问密钥                  | `"key"`             |
| secretKey    | 否  | 输出     | 要访问此资源的 AWS 密钥访问 Key              | `"secretAccessKey"` |
| sessionToken | 否  | 输出     | 要使用的 AWS 会话令牌                     | `"sessionToken"`    |
| emailFrom    | 否  | 输出     | 指定发件人地址 [另见](#example-request)    | `"me@example.com"`  |
| emailTo      | 否  | Output | 指定收件人地址。 [另见](#example-request)   | `"me@example.com"`  |
| emailCc      | 否  | Output | 指定抄送人地址。 [另见](#example-request)   | `"me@example.com"`  |
| emailBcc     | 否  | Output | 指定秘密抄送人地址。 [另见](#example-request) | `"me@example.com"`  |
| subject      | 否  | Output | 指定邮件信息的主题。 [另见](#example-request) | `"subject of mail"` |

{{% alert title="Important" color="warning" %}}
当在 EKS (AWS Kubernetes) 上与您的应用程序一起运行 Dapr sidecar (daprd) 时，如果您使用的node/pod 已附加到定义 AWS 资源访问权限的 IAM 策略，那么您 **不能**在正在使用的组件规范的定义中提供 AWS access-key、secret-key 和token。
{{% /alert %}}

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 请求示例

You can specify any of the following optional metadata properties with each request:

- `emailFrom`
- `emailTo`
- `emailCc`
- `emailBcc`
- `subject`

When sending an email, the metadata in the configuration and in the request is combined. The combined set of metadata must contain at least the `emailFrom`, `emailTo`, `emailCc`, `emailBcc` and `subject` fields.

The `emailTo`, `emailCc` and `emailBcc` fields can contain multiple email addresses separated by a semicolon.

示例︰
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
The `emailTo`, `emailCc` and `emailBcc` fields can contain multiple email addresses separated by a semicolon.
## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
