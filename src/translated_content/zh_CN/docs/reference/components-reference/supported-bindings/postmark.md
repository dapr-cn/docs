---
type: docs
title: "Postmark 绑定说明"
linkTitle: "Postmark"
description: "关于 Postmark 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/postmark/"
---

## 组件格式指南

要配置 Postmark 绑定，需创建一个类型为 `bindings.postmark` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: postmark
spec:
  type: bindings.postmark
  metadata:
  - name: accountToken
    value: "YOUR_ACCOUNT_TOKEN" # 必需，这是您的 Postmark 账户令牌
  - name: serverToken
    value: "YOUR_SERVER_TOKEN" # 必需，这是您的 Postmark 服务器令牌
  - name: emailFrom
    value: "testapp@dapr.io" # 可选
  - name: emailTo
    value: "dave@dapr.io" # 可选
  - name: subject
    value: "Hello!" # 可选
```
{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为 secret。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `accountToken` | Y | 输出 |  Postmark 账户令牌，应视为 secret 值 | `"account token"` |
| `serverToken` | Y | 输出  | Postmark 服务器令牌，应视为 secret 值 | `"server token"` |
| `emailFrom` | N | 输出 | 如果设置，则指定电子邮件消息的“发件人”地址 | `"me@exmaple.com"` |
| `emailTo` | N | 输出 | 如果设置，则指定电子邮件消息的“收件人”地址 | `"me@example.com"` |
| `emailCc` | N | 输出 | 如果设置，则指定电子邮件消息的“抄送”地址 | `"me@example.com"` |
| `emailBcc` | N | 输出 | 如果设置，则指定电子邮件消息的“密送”地址 | `"me@example.com"` |
| `subject` | N | 输出 | 如果设置，则指定电子邮件消息的主题 | `"me@example.com"` |

在输出绑定请求中，您也可以指定任何可选的元数据属性（例如 `emailFrom`、`emailTo`、`subject` 等）。

组件配置和请求负载中的可选元数据属性至少应包含 `emailFrom`、`emailTo` 和 `subject` 字段，因为这些字段是成功发送电子邮件所必需的。

## 绑定支持

此组件支持以下操作的**输出绑定**：

- `create`

## 示例请求负载

```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "changeme@example.net",
    "subject": "An email from Dapr Postmark binding"
  },
  "data": "<h1>Testing Dapr Bindings</h1>This is a test.<br>Bye!"
}
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [操作指南：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [操作指南：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
