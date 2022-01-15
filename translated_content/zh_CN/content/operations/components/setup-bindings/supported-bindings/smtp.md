---
type: docs
title: "SMTP binding spec"
linkTitle: "SMTP"
description: "Detailed documentation on the SMTP binding component"
---

## 配置

To setup SMTP binding create a component of type `bindings.smtp`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段            | 必填 | 绑定支持   | 详情                                                                                     | 示例                  |
| ------------- |:--:| ------ | -------------------------------------------------------------------------------------- | ------------------- |
| host          | Y  | 输出     | The host where your SMTP server runs                                                   | `"smtphost"`        |
| port          | Y  | 输出     | The port your SMTP server listens on                                                   | `"9999"`            |
| user          | Y  | 输出     | The user to authenticate against the SMTP server                                       | `"user"`            |
| password      | Y  | 输出     | 用户密码                                                                                   | `"password"`        |
| skipTLSVerify | N  | 输出     | If set to true, the SMPT server's TLS certificate will not be verified. 默认值为 `"false"` | `"true"`, `"false"` |
| emailFrom     | N  | 输出     | If set, this specifies the email address of the sender. See [also](#example-request)   | `"me@example.com"`  |
| emailTo       | N  | 输出     | If set, this specifies the email address of the receiver. See [also](#example-request) | `"me@example.com"`  |
| emailCc       | N  | 输出     | If set, this specifies the email address to CC in. See [also](#example-request)        | `"me@example.com"`  |
| emailBcc      | N  | Output | If set, this specifies email address to BCC in. See [also](#example-request)           | `"me@example.com"`  |
| subject       | N  | Output | If set, this specifies the subject of the email message. See [also](#example-request)  | `"subject of mail"` |

## 相关链接

该组件支持**输出绑定**，其操作如下:

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

示例:
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
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
