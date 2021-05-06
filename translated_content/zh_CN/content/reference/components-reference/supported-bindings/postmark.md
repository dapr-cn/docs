---
type: docs
title: "Postmark binding spec"
linkTitle: "Postmark"
description: "Detailed documentation on the Postmark binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/postmark/"
---

## 配置

To setup Postmark binding create a component of type `bindings.postmark`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
    value: "Hello!" # optional # optional # optional
```
{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持   | 详情                                                                   | 示例                 |
| ------------ |:--:| ------ | -------------------------------------------------------------------- | ------------------ |
| accountToken | Y  | Output | The Postmark account token, this should be considered a secret value | `"account token"`  |
| serverToken  | Y  | Output | The Postmark server token, this should be considered a secret value  | `"server token"`   |
| emailFrom    | N  | Output | If set this specifies the 'from' email address of the email message  | `"me@exmaple.com"` |
| emailTo      | N  | Output | If set this specifies the 'to' email address of the email message    | `"me@example.com"` |
| emailCc      | N  | Output | If set this specifies the 'cc' email address of the email message    | `"me@example.com"` |
| emailBcc     | N  | Output | If set this specifies the 'bcc' email address of the email message   | `"me@example.com"` |
| subject      | N  | Output | If set this specifies the subject of the email message               | `"me@example.com"` |

You can specify any of the optional metadata properties on the output binding request too (e.g. `emailFrom`, `emailTo`, `subject`, etc.)

Combined, the optional metadata properties in the component configuration and the request payload should at least contain the `emailFrom`, `emailTo` and `subject` fields, as these are required to send an email with success.


## 绑定支持

该组件支持**输出绑定**，其操作如下:

- `create`


## Example request payload

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
