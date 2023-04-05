---
type: docs
title: "SMTP 绑定规范"
linkTitle: "SMTP"
description: "SMTP绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/smtp/"
---

## Component format

To setup SMTP binding create a component of type `bindings.smtp`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: smtp
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
  - name: priority
    value: "[value 1-5]"
```

{{% alert title="Warning" color="warning" %}}
上面展示的配置样例，包含了明文字符串的用户名和密码信息。 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field         | 必填 | 绑定支持   | 详情                                                                    | 示例                  |
| ------------- |:--:| ------ | --------------------------------------------------------------------- | ------------------- |
| host          | 是  | Output | The host where your SMTP server runs                                  | `"smtphost"`        |
| port          | 是  | 输出     | SMTP服务端监听端口                                                           | `"9999"`            |
| user          | 是  | 输出     | 要对 SMTP 服务器进行身份验证的用户                                                  | `"user"`            |
| password      | 是  | 输出     | The password of the user                                              | `"password"`        |
| skipTLSVerify | 否  | 输出     | 如果设置为 true，则不会验证 SMPT 服务器的 TLS 证书。 默认值为 `"false"`                     | `"true"`, `"false"` |
| emailFrom     | 否  | Output | 指定发件人地址 [另见](#example-request)                                        | `"me@example.com"`  |
| emailTo       | 否  | Output | 指定收件人地址。 [另见](#example-request)                                       | `"me@example.com"`  |
| emailCc       | 否  | Output | 指定抄送人地址。 [另见](#example-request)                                       | `"me@example.com"`  |
| emailBcc      | 否  | Output | 指定秘密抄送人地址。 [另见](#example-request)                                     | `"me@example.com"`  |
| subject       | 否  | Output | 指定邮件信息的主题。 [另见](#example-request)                                     | `"subject of mail"` |
| priority      | 否  | Output | 指定邮件信息的优先级(X-Priority)，从 1(最低) 到 5(最高)(默认值：3)。 [另见](#example-request) | `"1"`               |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 请求示例

您可以为每个请求指定以下任何可选元数据属性：

- `emailFrom`
- `emailTo`
- `emailCC`
- `emailBCC`
- `subject`
- `priority`

发送电子邮件时，配置和请求中的元数据会合并。 元数据的合集必须至少包含`emailFrom`、 `emailTo` 和 `subject` 字段。

`emailTo`、 `emailCc` 和 `emailBcc` 字段可以包含多个电子邮件地址，以分号分隔。

示例︰
```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "dapr-smtp-binding@example.net",
    "emailCC": "cc1@example.net; cc2@example.net",
    "subject": "Email subject",
    "priority: "1"
  },
  "data": "Testing Dapr SMTP Binding"
}
```

`emailTo`、 `emailCc` 和 `emailBcc` 字段可以包含多个电子邮件地址，以分号分隔。
## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
