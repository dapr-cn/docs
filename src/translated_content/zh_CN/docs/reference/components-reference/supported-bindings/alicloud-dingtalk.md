---
type: docs
title: "阿里云钉钉绑定组件规范"
linkTitle: "阿里云钉钉"
description: "关于阿里云钉钉绑定组件的详细文档"
---

## 配置 Dapr 组件
要配置阿里云钉钉绑定组件，请创建一个类型为 `bindings.dingtalk.webhook` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用 secretstore 配置。有关如何引用和使用 Dapr 组件的密钥，请参阅[此指南]({{< ref component-secrets.md >}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.dingtalk.webhook
  version: v1
  metadata:
  - name: id
    value: "test_webhook_id"
  - name: url
    value: "https://oapi.dingtalk.com/robot/send?access_token=******"
  - name: secret
    value: "****************"
  - name: direction
    value: "input, output"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来存储密钥，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段说明
| 字段              | 必需 | 绑定支持 | 详情 | 示例 |
|--------------------|:--------:|--------|--------|---------|
| `id`                 | 是        | 输入/输出 |唯一标识符| `"test_webhook_id"`
| `url`                | 是        | 输入/输出 |钉钉的 Webhook 地址 | `"https://oapi.dingtalk.com/robot/send?access_token=******"`
| `secret`             | 否        | 输入/输出 |钉钉 Webhook 的密钥 | `"****************"`
| `direction`          | 否        | 输入/输出 |绑定的方向 | `"input"`, `"output"`, `"input, output"`

## 绑定支持

此组件支持**输入和输出**绑定接口。

此组件支持以下操作的**输出绑定**：
- `create`
- `get`

## 示例操作

以下示例展示了如何根据[此处](https://developers.dingtalk.com/document/app/custom-robot-access)的说明设置负载的数据：

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myDingTalk \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "msgtype": "text",
          "text": {
            "content": "Hi"
          }
        },
        "operation": "create"
      }'
```

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myDingTalk \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "msgtype": "text",
          "text": {
            "content": "Hi"
          }
        },
        "operation": "get"
      }'
```
## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [Bindings 构建块]({{< ref bindings >}})
- [操作指南：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [操作指南：使用 bindings 与外部资源接口]({{< ref howto-bindings.md >}})
- [Bindings API 参考]({{< ref bindings_api.md >}})
