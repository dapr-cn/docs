---
type: docs
title: "AWS Secrets Manager"
linkTitle: "AWS Secrets Manager"
description: 详细介绍了关于密钥仓库组件的信息
---

## 组件格式

要设置AWS Secrets Manager密钥仓库，请创建一个类型为`secretstores.aws.secretmanager`的组件。 请参阅 [本指南]({{< ref "secret-stores-overview.md#apply-the-configuration" >}})，了解如何创建和应用 secretstore 配置。 请参阅本指南 [引用密钥]({{< ref component-secrets.md >}}) 来检索和使用Dapr组件的密钥。

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awssecretmanager
  namespace: default
spec:
  type: secretstores.aws.secretmanager
  version: v1
  metadata:
  - name: region
    value: "[aws_region]"
  - name: accessKey
    value: "[aws_access_key]"
  - name: secretKey
    value: "[aws_secret_key]"
  - name: sessionToken
    value: "[aws_session_token]"
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## Spec metadata fields

| 字段           | Required | Details                                                                 | Example             |
| ------------ |:--------:| ----------------------------------------------------------------------- | ------------------- |
| region       |    Y     | The specific AWS region the AWS Secrets Manager instance is deployed in | `"us-east-1"`       |
| accessKey    |    Y     | The AWS Access Key to access this resource                              | `"key"`             |
| secretKey    |    Y     | The AWS Secret Access Key to access this resource                       | `"secretAccessKey"` |
| sessionToken |    N     | The AWS session token to use                                            | `"sessionToken"`    |
## Create an AWS Secrets Manager instance

Setup AWS Secrets Manager using the AWS documentation: https://docs.aws.amazon.com/secretsmanager/latest/userguide/tutorials_basic.html.

## 相关链接
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
