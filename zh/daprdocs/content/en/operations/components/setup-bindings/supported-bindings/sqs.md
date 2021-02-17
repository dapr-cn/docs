---
type: docs
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

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Output Binding Supported Operations

| Field        | Required | Binding support | Details                                           | Example             |
| ------------ |:--------:| --------------- | ------------------------------------------------- | ------------------- |
| queueName    |    Y     | Input/Output    | `queueName` is the SQS queue name.                | `"myqueue"`         |
| region       |    Y     | Input/Output    | The specific AWS region                           | `"us-east-1"`       |
| accessKey    |    Y     | Input/Output    | The AWS Access Key to access this resource        | `"key"`             |
| secretKey    |    Y     | Input/Output    | The AWS Secret Access Key to access this resource | `"secretAccessKey"` |
| sessionToken |    N     | Input/Output    | The AWS session token to use                      | `"sessionToken"`    |


## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`


## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
