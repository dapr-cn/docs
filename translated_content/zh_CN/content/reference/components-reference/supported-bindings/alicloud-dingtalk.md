---
type: docs
title: "Alibaba Cloud DingTalk binding spec"
linkTitle: "Alibaba Cloud DingTalk"
description: "Detailed documentation on the Alibaba Cloud DingTalk binding component"
---

## 设置 Dapr 组件
To setup an Alibaba Cloud DingTalk binding create a component of type `bindings.dingtalk.webhook`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

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
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}
## 元数据字段规范
| 字段  | 必填 | 绑定支持         | 详情                               | Example                                                      |
| --- |:--:| ------------ | -------------------------------- | ------------------------------------------------------------ |
| id  | Y  | Input/Output | unique id                        | `"test_webhook_id"`                                          |
| url | Y  | Input/Output | DingTalk's Webhook url           | `"https://oapi.dingtalk.com/robot/send?access_token=******"` |
| 密钥  | N  | Input/Output | the secret of DingTalk's Webhook | `"****************"`                                         |

## 相关链接

此组件支持 **输入和输出** 绑定接口。

字段名为 `ttlInSeconds`。
- `create`
- `get`

## Specifying a partition key

Example: Follow the instructions [here](https://developers.dingtalk.com/document/app/custom-robot-access) on setting the data of payload

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
