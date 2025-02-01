---
type: docs
title: "Twilio SMS 绑定说明"
linkTitle: "Twilio SMS"
description: "关于 Twilio SMS 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/twilio/"
---

## 组件格式指南

要配置 Twilio SMS 绑定组件，请创建一个类型为 `bindings.twilio.sms` 的组件。有关如何创建和应用绑定配置的详细信息，请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.twilio.sms
  version: v1
  metadata:
  - name: toNumber # 必需。
    value: "111-111-1111"
  - name: fromNumber # 必需。
    value: "222-222-2222"
  - name: accountSid # 必需。
    value: "*****************"
  - name: authToken # 必需。
    value: "*****************"
```
{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `toNumber` | Y | 输出 | 发送短信的目标号码 | `"111-111-1111"` |
| `fromNumber` | Y | 输出 | 发送者的电话号码 | `"222-222-2222"` |
| `accountSid` | Y | 输出 | Twilio 账户 SID | `"account sid"` |
| `authToken` | Y | 输出 | Twilio 认证令牌 | `"auth token"` |

## 支持的绑定功能

此组件支持以下**输出绑定**操作：

- `create`

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [操作指南：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [操作指南：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
