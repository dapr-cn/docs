---
type: docs
title: "Apple 推送通知服务绑定说明"
linkTitle: "Apple 推送通知服务"
description: "关于 Apple 推送通知服务绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/apns/"
---

## 组件格式

要配置 Apple 推送通知绑定，请创建一个类型为 `bindings.apns` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.apns
  version: v1
  metadata:
    - name: development
      value: "<bool>"
    - name: key-id
      value: "<APPLE_KEY_ID>"
    - name: team-id
      value: "<APPLE_TEAM_ID>"
    - name: private-key
      secretKeyRef:
        name: <SECRET>
        key: "<SECRET-KEY-NAME>"
```

## 元数据字段说明

| 字段              | 必需 | 绑定功能支持 | 详情 | 示例 |
|--------------------|:--------:| ----------------|---------|---------|
| `development` | Y | 输出 | 指定使用哪个 APNs 服务。设置为 `"true"` 使用开发服务，或 `"false"` 使用生产服务。默认值：`"true"` | `"true"` |
| `key-id` | Y | 输出 | 来自 Apple 开发者门户的私钥标识符 | `"private-key-id`" |
| `team-id` | Y | 输出 | 来自 Apple 开发者门户的组织或作者标识符 | `"team-id"` |
| `private-key` | Y | 输出 | 这是一个 PKCS #8 格式的私钥。建议将私钥存储在 secret 存储中，而不是直接在配置中暴露。详情请参见[此处](#private-key) | `"pem file"` |

### 私钥

APNS 绑定需要一个加密私钥来生成 APNS 服务的身份验证令牌。
私钥可以从 Apple 开发者门户生成，并以 PKCS #8 文件形式提供，存储在 PEM 格式中。
建议将私钥存储在 Dapr 的 secret 存储中，而不是直接在绑定的配置文件中。

以下是 APNS 绑定的示例配置文件：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: apns
spec:
  type: bindings.apns
  metadata:
  - name: development
    value: false
  - name: key-id
    value: PUT-KEY-ID-HERE
  - name: team-id
    value: PUT-APPLE-TEAM-ID-HERE
  - name: private-key
    secretKeyRef:
      name: apns-secrets
      key: private-key
```

如果使用 Kubernetes，示例 secret 配置可能如下所示：

```yaml
apiVersion: v1
kind: Secret
metadata:
    name: apns-secrets
stringData:
    private-key: |
        -----BEGIN PRIVATE KEY-----
        KEY-DATA-GOES-HERE
        -----END PRIVATE KEY-----
```

## 绑定功能支持

此组件支持以下操作的**输出绑定**：

- `create`

## 推送通知格式

APNS 绑定是 Apple 推送通知服务的直接接口。APNS 绑定将请求直接发送到 APNS 服务而不进行任何处理。
因此，了解 APNS 服务期望的推送通知的有效负载格式非常重要。
有效负载格式记录在[此处](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification)。

### 请求格式

```json
{
    "data": {
        "aps": {
            "alert": {
                "title": "New Updates!",
                "body": "There are new updates for your review"
            }
        }
    },
    "metadata": {
        "device-token": "PUT-DEVICE-TOKEN-HERE",
        "apns-push-type": "alert",
        "apns-priority": "10",
        "apns-topic": "com.example.helloworld"
    },
    "operation": "create"
}
```
<!-- IGNORE_LINKS -->
`data` 对象包含一个完整的推送通知规范，如 [Apple 文档](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification)中所述。`data` 对象将直接发送到 APNs 服务。

除了 `device-token` 值外，[Apple 文档](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns)中指定的 HTTP 头可以作为元数据字段发送，并将包含在对 APNs 服务的 HTTP 请求中。
<!-- END_IGNORE -->

### 响应格式

```json
{
    "messageID": "UNIQUE-ID-FOR-NOTIFICATION"
}
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
