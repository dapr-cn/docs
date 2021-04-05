---
type: docs
title: "AWS DynamoDB"
linkTitle: "AWS DynamoDB"
description: Detailed information on the AWS DynamoDB state store component
---

## Component format

To setup a DynamoDB state store create a component of type `state.dynamodb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration. To setup SQL Server state store create a component of type `state.sqlserver`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.dynamodb
  version: v1
  metadata:
  - name: table
    value: "mytable"
  - name: accessKey
    value: "abcd" # Optional
  - name: secretKey
    value: "abcd" # Optional
  - name: endpoint
    value: "http://localhost:8080" # Optional
  - name: region 
    value: "eu-west-1" # Optional
  - name: sessionToken
    value: "abcd" # Optional
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段           | Required | Details                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Example                                      |
| ------------ |:--------:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| table        |    Y     | name of the DynamoDB table to use                                                                                                                                                                                                                                                                                                                                                                                                                                           | `"mytable"`                                  |
| accessKey    |    N     | ID of the AWS account with appropriate permissions to SNS and SQS. Can be `secretKeyRef` to use a secret reference Secret for the AWS user. Can be `secretKeyRef` to use a secret reference Secret for the AWS user. Can be `secretKeyRef` to use a secret reference                                                                                                                                                                                                        | `"AKIAIOSFODNN7EXAMPLE"`                     |
| secretKey    |    N     | Secret for the AWS user. Can be `secretKeyRef` to use a secret reference                                                                                                                                                                                                                                                                                                                                                                                                    | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| region       |    N     | The AWS region to the instance. See this page for valid regions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html. The AWS region to the instance. The AWS region to the instance. See this page for valid regions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html. Ensure that DynamoDB are available in that region. Ensure that DynamoDB are available in that region. | `"us-east-1"`                                |
| endpoint     |    N     | AWS endpoint for the component to use. Only used for local development. AWS endpoint for the component to use. Only used for local development. The `endpoint` is unncessary when running against production AWS Only used for local development. The `endpoint` is unncessary when running against production AWS                                                                                                                                                          | `"http://localhost:4566"`                    |
| sessionToken |    N     | AWS session token to use.  AWS session token to use.  A session token is only required if you are using temporary security credentials.  A session token is only required if you are using temporary security credentials.                                                                                                                                                                                                                                                  | `"TOKEN"`                                    |

## Setup AWS DynamoDB
See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
