---
type: docs
title: "AWS SSM Parameter Store"
linkTitle: "AWS SSM Parameter Store"
description: Detailed information on the AWS SSM Parameter Store - secret store component
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/aws-parameter-store/"
---

## 配置

To setup AWS SSM Parameter Store secret store create a component of type `secretstores.aws.parameterstore`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awsparameterstore
  namespace: default
spec:
  type: secretstores.aws.parameterstore
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
以上示例将密钥明文存储， It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 详情                                                                          | 示例                  |
| ------------ |:--:| --------------------------------------------------------------------------- | ------------------- |
| region       | Y  | The specific AWS region the AWS SSM Parameter Store instance is deployed in | `"us-east-1"`       |
| accessKey    | Y  | 要访问此资源的 AWS 访问密钥                                                            | `"key"`             |
| secretKey    | Y  | 要访问此资源的 AWS 密钥访问 Key                                                        | `"secretAccessKey"` |
| sessionToken | N  | 要使用的 AWS 会话令牌                                                               | `"sessionToken"`    |

{{% alert title="Important" color="warning" %}}
When running the Dapr sidecar (daprd) with your application on EKS (AWS Kubernetes), if you're using a node/pod that has already been attached to an IAM policy defining access to AWS resources, you **must not** provide AWS access-key, secret-key, and tokens in the definition of the component spec you're using.
{{% /alert %}}

## Create an AWS SSM Parameter Store instance

Setup AWS SSM Parameter Store using the AWS documentation: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html.

## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
- [AWS认证]({{< ref authenticating-aws.md >}})
