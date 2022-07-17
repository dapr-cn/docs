---
type: docs
title: "Twilio SendGrid 绑定规范"
linkTitle: "Twilio SendGrid"
description: "Twilio SendGrid 绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/sendgrid/"
---

## 配置

要设置Twilio SendGrid绑定需要创建一个`bindings.twilio.sendgrid`类型的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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

| 字段        | 必填 | 绑定支持 | 详情                                                | 示例                       |
| --------- |:--:| ---- | ------------------------------------------------- | ------------------------ |
| apiKey    | 是  | 输出   | SendGrid API秘钥，这将被看做一个私密值。                        | `"apikey"`               |
| emailFrom | 否  | 输出   | 指定邮件消息的发件人地址 可选参数，[参照](#example-request-payload)  | `"me@example.com"`       |
| emailTo   | 否  | 输出   | 指定邮件信息的收件人地址 可选参数，[参照](#example-request-payload)  | `"me@example.com"`       |
| emailCc   | 否  | 输出   | 指定邮件信息的抄送人地址 可选参数，[参照](#example-request-payload)  | `"me@example.com"`       |
| emailBcc  | 否  | 输出   | 指定邮件信息的秘密抄送地址 可选参数，[参照](#example-request-payload) | `"me@example.com"`       |
| subject   | 否  | 输出   | 指定邮件信息的主题。 可选参数，[参照](#example-request-payload)    | `"subject of the email"` |


## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 请求负载示例

您也可以在输出绑定请求上指定任何可选的元数据属性(例如 `emailFrom`、 `emailTo`、 `subject`等)

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
