---
type: docs
title: "阿里云钉钉绑定规范"
linkTitle: "阿里云钉钉"
description: "有关阿里云钉钉绑定组件的详细文档"
---

## Setup Dapr component
To setup an Alibaba Cloud DingTalk binding create a component of type `bindings.dingtalk.webhook`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范
| Field       | Required | 绑定支持  | 详情                               | 示例                                                           |
| ----------- |:--------:| ----- | -------------------------------- | ------------------------------------------------------------ |
| `id`        |    是     | 输入/输出 | Unique id                        | `"test_webhook_id"`                                          |
| `url`       |    是     | 输入/输出 | 钉钉的 Webhook                      | `"https://oapi.dingtalk.com/robot/send?access_token=******"` |
| `密钥`        |    否     | 输入/输出 | The secret of DingTalk's Webhook | `"****************"`                                         |
| `direction` |    否     | 输入/输出 | The direction of the binding     | `"input"`, `"output"`, `"input, output"`                     |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持如下操作的 **输出绑定** ：
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

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
