---
type: docs
title: "Apple Push Notification Service binding spec"
linkTitle: "Apple Push Notification Service"
description: "有关 Apple 推送通知服务绑定组件的详细文档"
---

## 配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.apns
  version: v1
  metadata:
    - name: development
      value: <true | false>
    - name: key-id
      value: <APPLE_KEY_ID>
    - name: team-id
      value: <APPLE_TEAM_ID>
    - name: private-key
      secretKeyRef:
        name: <SECRET>
        key: <SECRET-KEY-NAME>
```

- `database` 指示 APN 服务绑定要使用的数据库 。 设置为 `true` 以用于开发环境， `false` 用于生产环境。 如果未指定，那么绑定将缺省为生产环境。
- `key-id` 是 Apple Developer Portal中专用密钥的标识。
- `team-id` 是 Apple Developer Portal中组织或作者的标识。
- `private-key` 是 PKCS #8格式的专用密钥。 专用密钥存储应当在密钥库中，而不应该直接写死在配置中。

## 请求格式

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

`data` 对象包含完整的推送通知规范，如 [Apple 文档](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification) 中所述。 `data` 对象将直接发送至 APN 服务。

除了 `device-token` 值以外， [Apple 文档](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns) 中指定的 HTTP 头可以作为元数据字段发送，并将包含在针对 APN 服务的 HTTP 请求中。

## 响应格式

```json
{
    "messageID": "UNIQUE-ID-FOR-NOTIFICATION"
}
```

## 输出绑定支持的操作

* `create`
