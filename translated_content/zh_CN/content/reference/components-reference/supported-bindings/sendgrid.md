---
type: docs
title: "Twilio SendGrid binding spec"
linkTitle: "Twilio SendGrid"
description: "Detailed documentation on the Twilio SendGrid binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/sendgrid/"
---

## 配置

To setup Twilio SendGrid binding create a component of type `bindings.twilio.sendgrid`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sendgrid
  namespace: default
spec:
  type: bindings.twilio.sendgrid
  version: v1
  metadata:
  - name: emailFrom
    value: "testapp@dapr.io" # optional
  - name: emailTo
    value: "dave@dapr.io" # optional
  - name: subject
    value: "Hello!" # optional
  - name: apiKey
    value: "YOUR_API_KEY" # required, this is your SendGrid key
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段        | 必填 | 绑定支持 | 详情                                                                                                                         | 示例                       |
| --------- |:--:| ---- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| apiKey    | Y  | 输出   | SendGrid API key, this should be considered a secret value                                                                 | `"apikey"`               |
| emailFrom | 否  | 输出   | If set this specifies the 'from' email address of the email message. Optional field, see [below](#example-request-payload) | `"me@example.com"`       |
| emailTo   | 否  | 输出   | If set this specifies the 'to' email address of the email message. Optional field, see [below](#example-request-payload)   | `"me@example.com"`       |
| emailCc   | 否  | 输出   | If set this specifies the 'cc' email address of the email message. Optional field, see [below](#example-request-payload)   | `"me@example.com"`       |
| emailBcc  | N  | 输出   | If set this specifies the 'bcc' email address of the email message. Optional field, see [below](#example-request-payload)  | `"me@example.com"`       |
| subject   | N  | 输出   | If set this specifies the subject of the email message. Optional field, see [below](#example-request-payload)              | `"subject of the email"` |


## 绑定支持

字段名为 `ttlInSeconds`。

- `create`

## Example request payload

You can specify any of the optional metadata properties on the output binding request too (e.g. `emailFrom`, `emailTo`, `subject`, etc.)

```json
{
  "metadata": {
    "emailTo": "changeme@example.net",
    "subject": "An email from Dapr SendGrid binding"
  },
  "data": "<h1>Testing Dapr Bindings</h1>This is a test.<br>Bye!"
}
```
## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
