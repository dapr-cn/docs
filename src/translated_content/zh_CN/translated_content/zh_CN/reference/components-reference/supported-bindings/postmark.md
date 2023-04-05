---
type: docs
title: "Postmark 绑定规范"
linkTitle: "Postmark"
description: "Postmark绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/postmark/"
---

## Component format

To setup Postmark binding create a component of type `bindings.postmark`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: postmark
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field        | 必填 | 绑定支持   | 详情                                                                   | 示例                 |
| ------------ |:--:| ------ | -------------------------------------------------------------------- | ------------------ |
| accountToken | 是  | Output | The Postmark account token, this should be considered a secret value | `"account token"`  |
| serverToken  | 是  | 输出     | Postmark服务端token，它可以被看做是一个秘钥值                                        | `"server token"`   |
| emailFrom    | 否  | 输出     | 指定邮件信息的发件人地址                                                         | `"me@exmaple.com"` |
| emailTo      | 否  | 输出     | 指定邮件信息的收件人地址                                                         | `"me@example.com"` |
| emailCc      | 否  | 输出     | 指定邮件信息的抄送人地址                                                         | `"me@example.com"` |
| emailBcc     | 否  | Output | 指定邮件信息的秘密抄送人地址                                                       | `"me@example.com"` |
| subject      | 否  | Output | 指定邮件信息主题                                                             | `"me@example.com"` |

你也可以在输出绑定上指定任何可选的元数据属性(例如：`emailFrom`, `emailTo`, `subject`, 等等)。

总结起来，组件配置信息的可选元数据属性和请求负载应该至少包含 `emailFrom`, `emailTo` 和 `subject`字段，因为这些属性是成功发送邮件必需的。


## 绑定支持

该组件支持如下操作的 **输出绑定** ：

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
```

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
