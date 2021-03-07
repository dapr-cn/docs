---
type: docs
title: "Twilio SMS binding spec"
linkTitle: "Twilio SMS"
description: "Detailed documentation on the Twilio SMS binding component"
---

## Component format

To setup Twilio SMS binding create a component of type `bindings.twilio.sms`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.twilio.sms
  version: v1
  metadata:
  - name: toNumber # required.
    value: 111-111-1111
  - name: fromNumber # required.
    value: 222-222-2222
  - name: accountSid # required.
    value: *****************
  - name: authToken # required.
    value: *****************
    value: 111-111-1111
  - name: fromNumber # required.
    value: 222-222-2222
  - name: accountSid # required.
    value: *****************
  - name: authToken # required.
    value: *****************
```
{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段         | Required | Binding support | Details                              | Example          |
| ---------- |:--------:| --------------- | ------------------------------------ | ---------------- |
| toNumber   |    Y     | Output          | The target number to send the sms to | `"111-111-1111"` |
| fromNumber |    Y     | Output          | The sender phone number              | `"122-222-2222"` |
| accountSid |    Y     | Output          | The Twilio account SID               | `"account sid"`  |
| authToken  |    Y     | Output          | The Twilio auth token                | `"auth token"`   |

## 相关链接

This component supports **output binding** with the following operations:

- `create`


## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
