---
type: docs
title: "Apple Push Notification Service binding spec"
linkTitle: "Apple Push Notification Service"
description: "有关 Apple 推送通知服务绑定组件的详细文档"
---

## 配置

To setup Apple Push Notifications binding create a component of type `bindings.apns`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

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
## 请求格式

| 字段          | Required | Output Binding Supported Operations | Details                                                                                               | Example:           |
| ----------- |:--------:| ----------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------ |
| development |    Y     | Output                              | Tells the binding which APNs service to use. 设置为 `true` 以用于开发环境， `false` 用于生产环境。 Default: `"true"`    | `"true"`           |
| key-id      |    Y     | Output                              | `key-id` 是 Apple Developer Portal中专用密钥的标识。                                                            | `"private-key-id`" |
| team-id     |    Y     | Output                              | `team-id` 是 Apple Developer Portal中组织或作者的标识。                                                          | `"team-id"`        |
| private-key |    Y     | Output                              | `private-key` 是 PKCS #8格式的专用密钥。 专用密钥存储应当在密钥库中，而不应该直接写死在配置中。 See [here](#private-key) for more details | `"pem file"`       |

### Private key
The APNS binding needs a cryptographic private key in order to generate authentication tokens for the APNS service. The private key can be generated from the Apple Developer Portal and is provided as a PKCS #8 file with the private key stored in PEM format. The private key should be stored in the Dapr secret store and not stored directly in the binding's configuration file.

A sample configuration file for the APNS binding is shown below:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: apns
  namespace: default
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
If using Kubernetes, a sample secret configuration may look like this:
```yaml
apiVersion: v1
kind: Secret
metadata:
    name: apns-secrets
    namespace: default
stringData:
    private-key: |
        -----BEGIN PRIVATE KEY-----
        KEY-DATA-GOES-HERE
        -----END PRIVATE KEY-----
```

## 响应格式

This component supports **output binding** with the following operations:

- `create`

## 输出绑定支持的操作

The APNS binding is a pass-through wrapper over the Apple Push Notification Service. The APNS binding will send the request directly to the APNS service without any translation. It is therefore important to understand the payload for push notifications expected by the APNS service. The payload format is documented [here](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification).

### Request format

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

### Response format

```json
{
    "messageID": "UNIQUE-ID-FOR-NOTIFICATION"
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
