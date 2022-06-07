---
type: docs
title: "Twilio SMS binding spec"
linkTitle: "Twilio SMS"
description: "Detailed documentation on the Twilio SMS binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/twilio/"
---

## 配置

要设置Twilio SMS绑定需要创建一个`bindings.twilio.sms`类型的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

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

| 字段         | 必填 | 绑定支持 | 详情              | 示例               |
| ---------- |:--:| ---- | --------------- | ---------------- |
| toNumber   | Y  | 输出   | 要向其发送短信的目标号码    | `"111-111-1111"` |
| fromNumber | Y  | 输出   | 发送人手机号码         | `"122-222-2222"` |
| accountSid | Y  | 输出   | Twilio账号SID     | `"account sid"`  |
| authToken  | Y  | 输出   | Twilio身份验证token | `"auth token"`   |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`


## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
