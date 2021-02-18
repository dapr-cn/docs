---
type: 文档
title: "AWS SQS binding spec"
linkTitle: "AWS SQS"
description: "Detailed documentation on the AWS SQS binding component"
---

## Setup Dapr component

To setup AWS SQS binding create a component of type `bindings.aws.sqs`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

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

also support connection pool configuration variables:
The above example uses secrets as plain strings. also support connection pool configuration variables: The above example uses secrets as plain strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Output Binding Supported Operations

| 字段                          | Required | Output Binding Supported Operations | Details                                           | Example:            |
| --------------------------- |:--------:| ----------------------------------- | ------------------------------------------------- | ------------------- |
| `queueName` 是 RabbitMQ 队列名。 |    Y     | Input/Output                        | `queueName` is the SQS queue name.                | `"myqueue"`         |
| region                      |    Y     | Input/Output                        | The specific AWS region                           | `"us-east-1"`       |
| accessKey                   |    Y     | Input/Output                        | The AWS Access Key to access this resource        | `"key"`             |
| secretKey                   |    Y     | Input/Output                        | The AWS Secret Access Key to access this resource | `"secretAccessKey"` |
| sessionToken                |    N     | Input/Output                        | The AWS session token to use                      | `"sessionToken"`    |


## Output bindings

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
