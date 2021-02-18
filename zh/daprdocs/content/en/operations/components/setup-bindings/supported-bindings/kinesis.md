---
type: 文档
title: "AWS Kinesis binding spec"
linkTitle: "AWS Kinesis"
description: "Detailed documentation on the AWS Kinesis binding component"
---

## Setup Dapr component

To setup AWS Kinesis binding create a component of type `bindings.aws.kinesis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.aws.kinesis
  version: v1
  metadata:
  - name: streamName
    value: KINESIS_STREAM_NAME # Kinesis stream name
  - name: consumerName 
    value: KINESIS_CONSUMER_NAME # Kinesis consumer name 
  - name: mode
    value: shared # shared - Shared throughput or extended - Extended/Enhanced fanout
  - name: region
    value: AWS_REGION #replace
  - name: accessKey
    value: AWS_ACCESS_KEY # replace
  - name: secretKey
    value: AWS_SECRET_KEY #replace
  - name: sessionToken
    value: *****************

```
also support connection pool configuration variables:
The above example uses secrets as plain strings. also support connection pool configuration variables: The above example uses secrets as plain strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Output Binding Supported Operations

| 字段           | Required | Output Binding Supported Operations | Details                                                                                                                                                                                                                                                                                                                                                             | Example:                 |
| ------------ |:--------:| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| mode         |    N     | Input                               | The Kinesis stream mode. `mode` Accepted values: shared, extended. shared - Shared throughput, extended - Extended/Enhanced fanout methods. More details are [here](https://docs.aws.amazon.com/streams/latest/dev/building-consumers.html) More details are [here](https://docs.aws.amazon.com/streams/latest/dev/building-consumers.html). Defaults to `"shared"` | `"shared"`, `"extended"` |
| streamName   |    Y     | Input/Output                        | `streamName` is the AWS Kinesis Stream Name.                                                                                                                                                                                                                                                                                                                        | `"stream"`               |
| consumerName |    Y     | Input                               | `consumerName` is the AWS Kinesis Consumer Name.                                                                                                                                                                                                                                                                                                                    | `"myconsumer"`           |
| region       |    Y     | Output                              | The specific AWS region the AWS Kinesis instance is deployed in                                                                                                                                                                                                                                                                                                     | `"us-east-1"`            |
| accessKey    |    Y     | Output                              | The AWS Access Key to access this resource                                                                                                                                                                                                                                                                                                                          | `"key"`                  |
| secretKey    |    Y     | Output                              | The AWS Secret Access Key to access this resource                                                                                                                                                                                                                                                                                                                   | `"secretAccessKey"`      |
| sessionToken |    N     | Output                              | The AWS session token to use                                                                                                                                                                                                                                                                                                                                        | `"sessionToken"`         |

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
