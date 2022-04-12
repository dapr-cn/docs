---
type: docs
title: "Twilio SMS binding spec"
linkTitle: "Twilio SMS"
description: "Detailed documentation on the Twilio SMS binding component"
---

## 配置

To setup Twilio SMS binding create a component of type `bindings.twilio.sms`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

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
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段         | 必填 | 绑定支持 | 详情                                   | 示例               |
| ---------- |:--:| ---- | ------------------------------------ | ---------------- |
| toNumber   | Y  | 输出   | The target number to send the sms to | `"111-111-1111"` |
| fromNumber | Y  | 输出   | The sender phone number              | `"122-222-2222"` |
| accountSid | Y  | 输出   | The Twilio account SID               | `"account sid"`  |
| authToken  | Y  | 输出   | The Twilio auth token                | `"auth token"`   |

## 绑定支持

字段名为 `ttlInSeconds`。

- `create`


## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
