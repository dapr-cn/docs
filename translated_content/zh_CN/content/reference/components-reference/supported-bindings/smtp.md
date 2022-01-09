---
type: docs
title: "SMTP binding spec"
linkTitle: "SMTP"
description: "Detailed documentation on the SMTP binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/smtp/"
---

## 配置

To setup SMTP binding create a component of type `bindings.smtp`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: smtp
  namespace: default
spec:
  type: bindings.smtp
  version: v1
  metadata:
  - name: host
    value: "smtp host"
  - name: port
    value: "smtp port"
  - name: user
    value: "username"
  - name: password
    value: "password"
  - name: skipTLSVerify
    value: true|false
  - name: emailFrom
    value: "sender@example.com"
  - name: emailTo
    value: "receiver@example.com"
  - name: emailCC
    value: "cc@example.com"
  - name: emailBCC
    value: "bcc@example.com"
  - name: subject
    value: "subject"
```

{{% alert title="Warning" color="warning" %}}
The example configuration shown above, contain a username and password as plain-text strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段            | 必填 | 绑定支持 | 详情                                                                                     | Example             |
| ------------- |:--:| ---- | -------------------------------------------------------------------------------------- | ------------------- |
| host          | Y  | 输出   | The host where your SMTP server runs                                                   | `"smtphost"`        |
| port          | Y  | 输出   | The port your SMTP server listens on                                                   | `"9999"`            |
| user          | Y  | 输出   | The user to authenticate against the SMTP server                                       | `"user"`            |
| password      | Y  | 输出   | 用户密码                                                                                   | `"password"`        |
| skipTLSVerify | N  | 输出   | If set to true, the SMPT server's TLS certificate will not be verified. 默认值为 `"false"` | `"true"`, `"false"` |
| emailFrom     | N  | 输出   | If set, this specifies the email address of the sender. See [also](#example-request)   | `"me@example.com"`  |
| emailTo       | N  | 输出   | If set, this specifies the email address of the receiver. See [also](#example-request) | `"me@example.com"`  |
| emailCc       | N  | 输出   | If set, this specifies the email address to CC in. See [also](#example-request)        | `"me@example.com"`  |
| emailBcc      | N  | 输出   | If set, this specifies email address to BCC in. See [also](#example-request)           | `"me@example.com"`  |
| subject       | N  | 输出   | If set, this specifies the subject of the email message. See [also](#example-request)  | `"subject of mail"` |

## 绑定支持

字段名为 `ttlInSeconds`。

- `create`

## Example request

You can specify any of the following optional metadata properties with each request:

- `emailFrom`
- `emailTo`
- `emailCC`
- `emailBCC`
- `subject`

When sending an email, the metadata in the configuration and in the request is combined. The combined set of metadata must contain at least the `emailFrom`, `emailTo` and `subject` fields.

The `emailTo`, `emailCC` and `emailBCC` fields can contain multiple email addresses separated by a semicolon.

Example:
```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "dapr-smtp-binding@example.net",
    "emailCC": "cc1@example.net; cc2@example.net",
    "subject": "Email subject"
  },
  "data": "Testing Dapr SMTP Binding"
}
```

The `emailTo`, `emailCC` and `emailBCC` fields can contain multiple email addresses separated by a semicolon.
## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
