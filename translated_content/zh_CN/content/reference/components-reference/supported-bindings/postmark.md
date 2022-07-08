---
type: docs
title: "Postmark binding spec"
linkTitle: "Postmark"
description: "Detailed documentation on the Postmark binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/postmark/"
---

## 配置

要设置Postmark绑定需要创建一个 `bindings.postmark`类型的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: postmark
  namespace: default
spec:
  type: bindings.postmark
  metadata:
  - name: accountToken
    value: "YOUR_ACCOUNT_TOKEN" # required, this is your Postmark account token
  - name: serverToken
    value: "YOUR_SERVER_TOKEN" # required, this is your Postmark server token
  - name: emailFrom
    value: "testapp@dapr.io" # optional
  - name: emailTo
    value: "dave@dapr.io" # optional
  - name: subject
    value: "Hello!" # optional
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持 | 详情                            | 示例                 |
| ------------ |:--:| ---- | ----------------------------- | ------------------ |
| accountToken | 是  | 输出   | Postmark账号token，它可以被看做一个秘钥值   | `"account token"`  |
| serverToken  | 是  | 输出   | Postmark服务端token，它可以被看做是一个秘钥值 | `"server token"`   |
| emailFrom    | 否  | 输出   | 指定邮件信息的发件人地址                  | `"me@exmaple.com"` |
| emailTo      | 否  | 输出   | 指定邮件信息的收件人地址                  | `"me@example.com"` |
| emailCc      | 否  | 输出   | 指定邮件信息的抄送人地址                  | `"me@example.com"` |
| emailBcc     | 否  | 输出   | 指定邮件信息的秘密抄送人地址                | `"me@example.com"` |
| subject      | 否  | 输出   | 指定邮件信息主题                      | `"me@example.com"` |

你也可以在输出绑定上指定任何可选的元数据属性(例如：`emailFrom`, `emailTo`, `subject`, 等等)。

总结起来，组件配置信息的可选元数据属性和请求负载应该至少包含 `emailFrom`, `emailTo` 和 `subject`字段，因为这些属性是成功发送邮件必需的。


## 绑定支持

该组件支持以下操作的**输出绑定** ：

- `create`


## 请求负载示例

```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "changeme@example.net",
    "subject": "An email from Dapr Postmark binding"
  },
  "data": "<h1>Testing Dapr Bindings</h1>This is a test.<br>Bye!"
}
}
}
}
```

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
