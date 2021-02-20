---
type: 文档
title: "AWS SNS binding spec"
linkTitle: "AWS SNS"
description: "Detailed documentation on the AWS SNS binding component"
---

## Introduction

To setup AWS SNS binding create a component of type `bindings.aws.sns`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.aws.sns
  version: v1
  metadata:
  - name: topicArn
    value: mytopic
  - name: region
    value: us-west-2
  - name: accessKey
    value: *****************
  - name: secretKey
    value: *****************
  - name: sessionToken
    value: *****************

```

also support connection pool configuration variables:
The above example uses secrets as plain strings. also support connection pool configuration variables: The above example uses secrets as plain strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Input bindings

| 字段           | Required | Output Binding Supported Operations | Details                                           | Example:            |
| ------------ |:--------:| ----------------------------------- | ------------------------------------------------- | ------------------- |
| topicArn     |    Y     | Output                              | `topicArn` is the SNS topic name.                 | `"arn:::topicarn"`  |
| region       |    Y     | Output                              | The specific AWS region                           | `"us-east-1"`       |
| accessKey    |    Y     | Output                              | The AWS Access Key to access this resource        | `"key"`             |
| secretKey    |    Y     | Output                              | The AWS Secret Access Key to access this resource | `"secretAccessKey"` |
| sessionToken |    N     | Output                              | The AWS session token to use                      | `"sessionToken"`    |

## Output bindings

字段名为 `ttlInSeconds`。

- `create`

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
