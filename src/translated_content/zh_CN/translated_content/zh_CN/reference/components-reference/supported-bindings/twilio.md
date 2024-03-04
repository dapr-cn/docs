---
type: docs
title: "Twilio SMS绑定规范"
linkTitle: "Twilio SMS"
description: "Twilio SMS绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/twilio/"
---

## Component format

To setup Twilio SMS binding create a component of type `bindings.twilio.sms`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.twilio.sms
  version: v1
  metadata:
  - name: toNumber # required.
    value: "111-111-1111"
  - name: fromNumber # required.
    value: "222-222-2222"
  - name: accountSid # required.
    value: "*****************"
  - name: authToken # required.
    value: "*****************"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field        | Required | 绑定支持   | 详情                                   | 示例               |
| ------------ |:--------:| ------ | ------------------------------------ | ---------------- |
| `toNumber`   |    是     | Output | The target number to send the sms to | `"111-111-1111"` |
| `fromNumber` |    是     | 输出     | 发送人手机号码                              | `"222-222-2222"` |
| `accountSid` |    是     | 输出     | Twilio账号SID                          | `"account sid"`  |
| `authToken`  |    是     | 输出     | Twilio身份验证token                      | `"auth token"`   |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`


## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
