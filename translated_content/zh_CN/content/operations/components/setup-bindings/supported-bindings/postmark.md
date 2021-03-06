---
type: docs
title: "Postmark binding spec"
linkTitle: "Postmark"
description: "Detailed documentation on the Postmark binding component"
---

## Component format

To setup Postmark binding create a component of type `bindings.postmark`. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
    value: "Hello!" # optional # optional
```
{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段           | Required | Binding support | Details                                                              | Example            |
| ------------ |:--------:| --------------- | -------------------------------------------------------------------- | ------------------ |
| accountToken |    Y     | Output          | The Postmark account token, this should be considered a secret value | `"account token"`  |
| serverToken  |    Y     | Output          | The Postmark server token, this should be considered a secret value  | `"server token"`   |
| emailFrom    |    N     | Output          | If set this specifies the 'from' email address of the email message  | `"me@exmaple.com"` |
| emailTo      |    N     | Output          | If set this specifies the 'to' email address of the email message    | `"me@example.com"` |
| emailCc      |    N     | Output          | If set this specifies the 'cc' email address of the email message    | `"me@example.com"` |
| emailBcc     |    N     | Output          | If set this specifies the 'bcc' email address of the email message   | `"me@example.com"` |
| subject      |    N     | Output          | If set this specifies the subject of the email message               | `"me@example.com"` |

You can specify any of the optional metadata properties on the output binding request too (e.g. `emailFrom`, `emailTo`, `subject`, etc.)

Combined, the optional metadata properties in the component configuration and the request payload should at least contain the `emailFrom`, `emailTo` and `subject` fields, as these are required to send an email with success.


## 相关链接

This component supports **output binding** with the following operations:

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
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
