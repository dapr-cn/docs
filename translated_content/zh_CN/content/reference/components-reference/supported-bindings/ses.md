---
type: docs
title: "AWS SES binding spec"
linkTitle: "AWS SES"
description: "Detailed documentation on the AWS SES binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/ses/"
---

## 配置

To setup AWS binding create a component of type `bindings.aws.ses`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

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
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持 | 详情                                                                                     | Example             |
| ------------ |:--:| ---- | -------------------------------------------------------------------------------------- | ------------------- |
| region       | Y  | 输出   | The specific AWS region                                                                | `"eu-west-1"`       |
| accessKey    | Y  | 输出   | 要访问此资源的 AWS 访问密钥                                                                       | `"key"`             |
| secretKey    | Y  | 输出   | 要访问此资源的 AWS 密钥访问 Key                                                                   | `"secretAccessKey"` |
| sessionToken | N  | 输出   | 要使用的 AWS 会话令牌                                                                          | `"sessionToken"`    |
| emailFrom    | N  | 输出   | If set, this specifies the email address of the sender. See [also](#example-request)   | `"me@example.com"`  |
| emailTo      | N  | 输出   | If set, this specifies the email address of the receiver. See [also](#example-request) | `"me@example.com"`  |
| emailCc      | N  | 输出   | If set, this specifies the email address to CC in. See [also](#example-request)        | `"me@example.com"`  |
| emailBcc     | N  | 输出   | If set, this specifies email address to BCC in. See [also](#example-request)           | `"me@example.com"`  |
| subject      | N  | 输出   | If set, this specifies the subject of the email message. See [also](#example-request)  | `"subject of mail"` |



## 绑定支持

字段名为 `ttlInSeconds`。

- `create`

## Example request

You can specify any of the following optional metadata properties with each request:

- `emailFrom`
- `emailTo`
- `emailCc`
- `emailBcc`
- `subject`

When sending an email, the metadata in the configuration and in the request is combined. The combined set of metadata must contain at least the `emailFrom`, `emailTo`, `emailCc`, `emailBcc` and `subject` fields.

The `emailTo`, `emailCc` and `emailBcc` fields can contain multiple email addresses separated by a semicolon.

Example:
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

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
