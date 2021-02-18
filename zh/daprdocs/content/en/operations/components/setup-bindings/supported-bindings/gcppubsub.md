---
type: 文档
title: "GCP Pub/Sub binding spec"
linkTitle: "GCP Pub/Sub"
description: "Detailed documentation on the GCP Pub/Sub binding component"
---

## Setup Dapr component

To setup Azure Pub/Sub binding create a component of type `bindings.gcp.pubsub`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.gcp.pubsub
  version: v1
  metadata:
  - name: topic
    value: topic1
  - name: subscription
    value: subscription1
  - name: type
    value: service_account
  - name: project_id
    value: project_111
  - name: private_key_id
    value: *************
  - name: client_email
    value: name@domain.com
  - name: client_id
    value: '1111111111111111'
  - name: auth_uri
    value: https://accounts.google.com/o/oauth2/auth
  - name: token_uri
    value: https://oauth2.googleapis.com/token
  - name: auth_provider_x509_cert_url
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: client_x509_cert_url
    value: https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com
  - name: private_key
    value: PRIVATE KEY
```
{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Output Binding Supported Operations

| 字段                                                             | Required | Output Binding Supported Operations              | Details                                                              | Example:                                                                                         |
| -------------------------------------------------------------- |:--------:| ------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| topic                                                          |    Y     | Output                                           | `topic` is the Pub/Sub topic name.                                   | `"topic1"`                                                                                       |
| subscription                                                   |    Y     | `subscription` is the Pub/Sub subscription name. | `"name1"`                                                            |                                                                                                  |
| type                                                           |    Y     | Output                                           | `type` is the GCP credentials type.                                  | `service_account`                                                                                |
| `project_id` is the GCP project id.                            |    Y     | Output                                           | `client_id` is the GCP client id.                                    | `projectId`                                                                                      |
| `private_key_id` is the GCP private key id.                    |    Y     | Output                                           | `private_key` is the GCP credentials private key.                    | `"privateKeyId"`                                                                                 |
| private_key                                                    |    Y     | Output                                           | GCP credentials private key. Replace with x509 cert                  | `12345-12345`                                                                                    |
| client_email                                                   |    Y     | Output                                           | `client_email` is the GCP client email.                              | `"client@email.com"`                                                                             |
| client_id                                                      |    Y     | Output                                           | GCP client id                                                        | `0123456789-0123456789`                                                                          |
| auth_uri                                                       |    Y     | Output                                           | `auth_uri` is Google account OAuth endpoint.                         | `<code>token_uri` is Google account token uri.</code>                                         |
| token_uri                                                      |    Y     | Output                                           | Google account token uri                                             | `https://oauth2.googleapis.com/token`                                                            |
| `auth_provider_x509_cert_url` is the GCP credentials cert url. |    Y     | Output                                           | `client_x509_cert_url` is the GCP credentials project x509 cert url. | `https://www.googleapis.com/oauth2/v1/certs`                                                     |
| client_x509_cert_url                                         |    Y     | Output                                           | GCP credentials project x509 cert url                                | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com` |

## Output bindings

This component supports **output binding** with the following operations:

- `create`

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
