---
type: docs
title: "阿里云钉钉绑定规范"
linkTitle: "阿里云钉钉"
description: "有关阿里云钉钉绑定组件的详细文档"
---

## 设置 Dapr 组件
要设置阿里云钉钉绑定，需要创建一个类型为 `bindings.dingtalk.webhook` 的组件。 看[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})如何创建和应用秘钥配置。 通过[引用 Secrets]({{< ref component-secrets.md >}}) 这个指南可以看到如何在 Dapr 组件中检索和使用 Secret。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
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
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}
## 元数据字段规范
| 字段     | 必填 | 绑定支持         | 详情             | 示例                                                           |
| ------ |:--:| ------------ | -------------- | ------------------------------------------------------------ |
| id     | Y  | Input/Output | 唯一标识           | `"test_webhook_id"`                                          |
| url    | Y  | Input/Output | 钉钉的 Webhook    | `"https://oapi.dingtalk.com/robot/send?access_token=******"` |
| secret | N  | Input/Output | 钉钉 Webhook 的秘钥 | `"****************"`                                         |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

字段名为 `ttlInSeconds`。
- `create`
- `get`

## 指定分区键

示例: 按照[这里](https://developers.dingtalk.com/document/app/custom-robot-access)的说明设置 HTTP 请求

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

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
