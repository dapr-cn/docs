---
type: docs
title: "Twilio SendGrid 绑定规范"
linkTitle: "Twilio SendGrid"
description: "关于 Twilio SendGrid 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/sendgrid/"
---

## 组件格式

要设置 Twilio SendGrid 绑定，您需要创建一个类型为 `bindings.twilio.sendgrid` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

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
    value: "testapp@dapr.io" # 可选
  - name: emailFromName
    value: "test app" # 可选
  - name: emailTo
    value: "dave@dapr.io" # 可选
  - name: emailToName
    value: "dave" # 可选
  - name: subject
    value: "Hello!" # 可选
  - name: emailCc
    value: "jill@dapr.io" # 可选
  - name: emailBcc
    value: "bob@dapr.io" # 可选
  - name: dynamicTemplateId
    value: "d-123456789" # 可选
  - name: dynamicTemplateData
    value: '{"customer":{"name":"John Smith"}}' # 可选
  - name: apiKey
    value: "YOUR_API_KEY" # 必需，这是您的 SendGrid 密钥
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保存密钥，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `apiKey` | Y | 输出 | SendGrid API 密钥，应视为敏感信息 | `"apikey"` |
| `emailFrom` | N | 输出 | 若设置，指定电子邮件的“发件人”地址。仅允许一个电子邮件地址。可选字段，参见[下文](#example-request-payload) | `"me@example.com"` |
| `emailFromName` | N | 输出 | 若设置，指定电子邮件的“发件人”名称。可选字段，参见[下文](#example-request-payload) | `"me"` |
| `emailTo` | N | 输出 | 若设置，指定电子邮件的“收件人”地址。仅允许一个电子邮件地址。可选字段，参见[下文](#example-request-payload) | `"me@example.com"` |
| `emailToName` | N | 输出 | 若设置，指定电子邮件的“收件人”名称。可选字段，参见[下文](#example-request-payload) | `"me"` |
| `emailCc` | N | 输出 | 若设置，指定电子邮件的“抄送”地址。仅允许一个电子邮件地址。可选字段，参见[下文](#example-request-payload) | `"me@example.com"` |
| `emailBcc` | N | 输出 | 若设置，指定电子邮件的“密件抄送”地址。仅允许一个电子邮件地址。可选字段，参见[下文](#example-request-payload) | `"me@example.com"` |
| `subject` | N | 输出 | 若设置，指定电子邮件的主题。可选字段，参见[下文](#example-request-payload) | `"subject of the email"` |

## 绑定支持

此组件支持以下操作的**输出绑定**：

- `create`

## 示例请求负载

您也可以在输出绑定请求中指定任何可选的元数据属性（例如 `emailFrom`、`emailTo`、`subject` 等）。

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

## 动态模板

如果使用动态模板，您需要提供 `dynamicTemplateId`，并使用 `dynamicTemplateData` 来传递模板数据：

```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "changeme@example.net",
    "subject": "An template email from Dapr SendGrid binding",
    "dynamicTemplateId": "d-123456789",
    "dynamicTemplateData": "{\"customer\":{\"name\":\"John Smith\"}}"
  }
}
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [操作指南：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [操作指南：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
