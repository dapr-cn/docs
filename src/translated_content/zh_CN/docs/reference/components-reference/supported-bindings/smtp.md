---
type: docs
title: "SMTP 绑定规范"
linkTitle: "SMTP"
description: "关于 SMTP 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/smtp/"
---

## 组件格式

要设置 SMTP 绑定，您需要创建一个类型为 `bindings.smtp` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

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

{{% alert title="警告" color="warning" %}}
上面的示例配置中包含了明文形式的用户名和密码。建议使用 secret 存储来保护这些信息，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `host` | Y | 输出 |  SMTP 服务器的主机地址 | `"smtphost"` |
| `port` | Y | 输出 |  SMTP 服务器的端口号 | `"9999"` |
| `user` | Y | 输出 |  用于认证的用户名 | `"user"` |
| `password` | Y | 输出 | 用户的密码 | `"password"` |
| `skipTLSVerify` | N | 输出 | 如果设置为 true，将跳过对 SMTP 服务器 TLS 证书的验证。默认为 `"false"` | `"true"`, `"false"` |
| `emailFrom` | N | 输出 | 如果设置，将指定发件人的电子邮件地址。参见[示例请求](#example-request) | `"me@example.com"` |
| `emailTo` | N | 输出 | 如果设置，将指定收件人的电子邮件地址。参见[示例请求](#example-request) | `"me@example.com"` |
| `emailCc` | N | 输出 | 如果设置，将指定抄送的电子邮件地址。参见[示例请求](#example-request) | `"me@example.com"` |
| `emailBcc` | N | 输出 | 如果设置，将指定密送的电子邮件地址。参见[示例请求](#example-request) | `"me@example.com"` |
| `subject` | N | 输出 | 如果设置，将指定电子邮件的主题。参见[示例请求](#example-request) | `"subject of mail"` |
| `priority` | N | 输出 | 如果设置，将指定电子邮件的优先级 (X-Priority)，范围从 1（最低）到 5（最高）（默认值：3）。参见[示例请求](#example-request) | `"1"` |

## 绑定支持

此组件支持**输出绑定**，可执行以下操作：

- `create`

## 示例请求

在每个请求中，您可以指定以下任意可选元数据属性：

- `emailFrom`
- `emailTo`
- `emailCC`
- `emailBCC`
- `subject`
- `priority`

发送电子邮件时，配置中的元数据和请求中的元数据将被合并。合并后的元数据集必须至少包含 `emailFrom`、`emailTo` 和 `subject` 字段。

`emailTo`、`emailCC` 和 `emailBCC` 字段可以包含多个用分号分隔的电子邮件地址。

示例：
```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "dapr-smtp-binding@example.net",
    "emailCC": "cc1@example.net; cc2@example.net",
    "subject": "Email subject",
    "priority": "1"
  },
  "data": "Testing Dapr SMTP Binding"
}
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [操作指南：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [操作指南：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
