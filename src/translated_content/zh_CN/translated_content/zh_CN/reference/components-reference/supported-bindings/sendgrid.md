---
type: docs
title: "Twilio SendGrid 绑定规范"
linkTitle: "Twilio SendGrid"
description: "Twilio SendGrid 绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/sendgrid/"
---

## Component format

To setup Twilio SendGrid binding create a component of type `bindings.twilio.sendgrid`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sendgrid
spec:
  type: bindings.twilio.sendgrid
  version: v1
  metadata:
  - name: emailFrom
    value: "testapp@dapr.io" # optional
  - name: emailFromName
    value: "test app" # optional
  - name: emailTo
    value: "dave@dapr.io" # optional
  - name: emailToName
    value: "dave" # optional
  - name: subject
    value: "Hello!" # optional
  - name: emailCc
    value: "jill@dapr.io" # optional
  - name: emailBcc
    value: "bob@dapr.io" # optional
  - name: apiKey
    value: "YOUR_API_KEY" # required, this is your SendGrid key
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field         | 必填 | 绑定支持   | 详情                                                                                                                                              | 示例                       |
| ------------- |:--:| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| apiKey        | 是  | Output | SendGrid API key, this should be considered a secret value                                                                                      | `"apikey"`               |
| emailFrom     | 否  | 输出     | 指定邮件消息的发件人地址 Only a single email address is allowed. 可选参数，[参照](#example-request-payload)                                                        | `"me@example.com"`       |
| emailFromName | 否  | 输出     | If set this specifies the 'from' name of the email message. 可选参数，[参照](#example-request-payload)                                                 | `"me"`                   |
| emailTo       | 否  | 输出     | If set this specifies the 'to' email address of the email message. Only a single email address is allowed. 可选参数，[参照](#example-request-payload)  | `"me@example.com"`       |
| emailToName   | 否  | 输出     | If set this specifies the 'to' name of the email message. 可选参数，[参照](#example-request-payload)                                                   | `"me"`                   |
| emailCc       | 否  | Output | If set this specifies the 'cc' email address of the email message. Only a single email address is allowed. 可选参数，[参照](#example-request-payload)  | `"me@example.com"`       |
| emailBcc      | 否  | Output | If set this specifies the 'bcc' email address of the email message. Only a single email address is allowed. 可选参数，[参照](#example-request-payload) | `"me@example.com"`       |
| subject       | 否  | Output | If set this specifies the subject of the email message. 可选参数，[参照](#example-request-payload)                                                     | `"subject of the email"` |


## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 请求负载示例

你也可以在输出绑定上指定任何可选的元数据属性(例如：`emailFrom`, `emailTo`, `subject`, 等等)。

```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "changeme@example.net",
    "subject": "An email from Dapr SendGrid binding"
  },
  "data": "<h1>Testing Dapr Bindings</h1>This is a test.<br>Bye!"
}
```

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
