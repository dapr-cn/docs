---
type: 文档
title: "Postmark binding spec"
linkTitle: "Postmark"
description: "Detailed documentation on the Postmark binding component"
---

## Introduction

To setup Postmark binding create a component of type `bindings.postmark`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Input bindings

| 字段           | Required | Output Binding Supported Operations | Details                                                                                                     | Example:           |
| ------------ |:--------:| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------ |
| accountToken |    Y     | Output                              | `accountToken` is your Postmark account token, this should be considered a secret value. Required.          | `"account token"`  |
| serverToken  |    Y     | Output                              | `serverToken` is your Postmark server token, this should be considered a secret value. Required.            | `"server token"`   |
| emailFrom    |    N     | Output                              | `emailFrom` If set this specifies the 'from' email address of the email message. Optional field, see below. | `"me@exmaple.com"` |
| emailTo      |    N     | Output                              | `emailTo` If set this specifies the 'to' email address of the email message. Optional field, see below.     | `"me@example.com"` |
| emailCc      |    N     | Output                              | `emailCc` If set this specifies the 'cc' email address of the email message. Optional field, see below.     | `"me@example.com"` |
| emailBcc     |    N     | Output                              | `emailBcc` If set this specifies the 'bcc' email address of the email message. Optional field, see below.   | `"me@example.com"` |
| subject      |    N     | Output                              | `subject` If set this specifies the subject of the email message. Optional field, see below.                | `"me@example.com"` |

You can specify any of the optional metadata properties on the output binding request too (e.g. `emailFrom`, `emailTo`, `subject`, etc.)

Combined, the optional metadata properties in the component configuration and the request payload should at least contain the `emailFrom`, `emailTo` and `subject` fields, as these are required to send an email with success.


## Output bindings

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
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
