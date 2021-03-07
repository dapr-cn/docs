---
type: docs
title: "AWS SQS binding spec"
linkTitle: "AWS SQS"
description: "Detailed documentation on the AWS SQS binding component"
---

## Component format

To setup AWS SQS binding create a component of type `bindings.aws.sqs`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.aws.sqs
  version: v1
  metadata:
  - name: queueName
    value: items
  - name: region
    value: us-west-2
  - name: accessKey
    value: *****************
  - name: secretKey
    value: *****************
  - name: sessionToken
    value: *****************

```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| 字段           | Required | Binding support | Details                                           | Example             |
| ------------ |:--------:| --------------- | ------------------------------------------------- | ------------------- |
| queueName    |    Y     | Input/Output    | The SQS queue name                                | `"myqueue"`         |
| region       |    Y     | Input/Output    | The specific AWS region                           | `"us-east-1"`       |
| accessKey    |    Y     | Input/Output    | The AWS Access Key to access this resource        | `"key"`             |
| secretKey    |    Y     | Input/Output    | The AWS Secret Access Key to access this resource | `"secretAccessKey"` |
| sessionToken |    N     | Input/Output    | The AWS session token to use                      | `"sessionToken"`    |


## 相关链接

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`


## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
