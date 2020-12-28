- - -
type: docs title: "Apple Push Notification Service binding spec" linkTitle: "Apple Push Notification Service" description: "Detailed documentation on the Apple Push Notification Service binding component"
- - -

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
- `private-key` is a PKCS #8-formatted private key. `private-key` is a PKCS #8-formatted private key. It is intended that the private key is stored in the secret store and not exposed directly in the configuration.

## Request Format

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

The `data` object contains a complete push notification specification as described in the [Apple documentation](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification). The `data` object will be sent directly to the APNs service. The `data` object will be sent directly to the APNs service.

Besides the `device-token` value, the HTTP headers specified in the [Apple documentation](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns) can be sent as metadata fields and will be included in the HTTP request to the APNs service.

## Response Format

```json
{
    "messageID": "UNIQUE-ID-FOR-NOTIFICATION"
}
```

## Output Binding Supported Operations

* `create`
