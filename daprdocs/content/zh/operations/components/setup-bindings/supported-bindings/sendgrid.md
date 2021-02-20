---
type: docs
title: "Twilio SendGrid binding spec"
linkTitle: "Twilio SendGrid"
description: "Detailed documentation on the Twilio SendGrid binding component"
---

## Component format

To setup Twilio SendGrid binding create a component of type `bindings.twilio.sendgrid`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段        | Required | Binding support | Details                                                                                                                    | Example                  |
| --------- |:--------:| --------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| apiKey    |    Y     | Output          | SendGrid API key, this should be considered a secret value                                                                 | `"apikey"`               |
| emailFrom |    N     | Output          | If set this specifies the 'from' email address of the email message. Optional field, see [below](#example-request-payload) | `"me@example.com"`       |
| emailTo   |    N     | Output          | If set this specifies the 'to' email address of the email message. Optional field, see [below](#example-request-payload)   | `"me@example.com"`       |
| emailCc   |    N     | Output          | If set this specifies the 'cc' email address of the email message. Optional field, see [below](#example-request-payload)   | `"me@example.com"`       |
| emailBcc  |    N     | Output          | If set this specifies the 'bcc' email address of the email message. Optional field, see [below](#example-request-payload)  | `"me@example.com"`       |
| subject   |    N     | Output          | If set this specifies the subject of the email message. Optional field, see [below](#example-request-payload)              | `"subject of the email"` |


## Output bindings

This component supports **output binding** with the following operations:

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
}
```
## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
