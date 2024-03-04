---
type: docs
title: "AWS DynamoDB"
linkTitle: "AWS DynamoDB"
description: AWS DynamoDB 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-dynamodb/"
---

## Component format

To setup a DynamoDB state store create a component of type `state.aws.dynamodb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.aws.dynamodb
  version: v1
  metadata:
  - name: table
    value: "Contracts"
  - name: accessKey
    value: "AKIAIOSFODNN7EXAMPLE" # Optional
  - name: secretKey
    value: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" # Optional
  - name: endpoint
    value: "http://localhost:8080" # Optional
  - name: region
    value: "eu-west-1" # Optional
  - name: sessionToken
    value: "myTOKEN" # Optional
  - name: ttlAttributeName
    value: "expiresAt" # Optional
  - name: partitionKey
    value: "ContractID" # Optional
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 主键

In order to use DynamoDB as a Dapr state store, the table must have a primary key named `key`. See the section [Partition Keys]({{< ref "setup-dynamodb.md#partition-keys" >}}) for an option to change this behavior.

## 元数据字段规范

| Field            | Required | 详情                                                                                                                                                                                                                     | 示例                                           |
| ---------------- |:--------:| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| table            |    是     | name of the DynamoDB table to use                                                                                                                                                                                      | `"Contracts"`                                |
| accessKey        |    否     | ID of the AWS account with appropriate permissions to SNS and SQS. 可以用`secretKeyRef`来引用密钥。                                                                                                                             | `"AKIAIOSFODNN7EXAMPLE"`                     |
| secretKey        |    否     | Secret for the AWS user. 可以用`secretKeyRef`来引用密钥。                                                                                                                                                                       | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| region           |    否     | The AWS region to the instance. See this page for valid regions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html. 确保 DynamoDB 在该区域可用。                                 | `"us-east-1"`                                |
| endpoint         |    否     | AWS endpoint for the component to use. Only used for local development. The `endpoint` is unncessary when running against production AWS                                                                               | `"http://localhost:4566"`                    |
| sessionToken     |    否     | AWS session token to use.  只有当您使用临时安全凭证时才需要会话令牌。                                                                                                                                                                       | `"TOKEN"`                                    |
| ttlAttributeName |    否     | 应用于 TTL 的表属性名称。                                                                                                                                                                                                        | `"expiresAt"`                                |
| partitionKey     |    否     | The table primary key or partition key attribute name. This field is used to replace the default primary key attribute name `"key"`. See the section [Partition Keys]({{< ref "setup-dynamodb.md#partition-keys" >}}). | `"ContractID"`                               |

{{% alert title="Important" color="warning" %}}
当在 EKS (AWS Kubernetes) 上与您的应用程序一起运行 Dapr sidecar (daprd) 时，如果您使用的node/pod 已附加到定义 AWS 资源访问权限的 IAM 策略，那么您 **不能**在正在使用的组件规范的定义中提供 AWS access-key、secret-key 和token。
{{% /alert %}}

## 设置 AWS DynamoDB

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

## 生存时间 (TTL)

为了使用 DynamoDB TTL 功能，您必须在表上启用 TTL 并定义属性名称。 属性名称必须在 `ttlAttributeName` 字段中定义。 请参阅官方 [AWS 文档](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)。

## Partition Keys

By default, the DynamoDB state store component uses the table attribute name `key` as primary/partition key in the DynamoDB table. This can be overridden by specifying a metadata field in the component configuration with a key of `partitionKey` and a value of the desired attribute name.

To learn more about DynamoDB primary/partition keys, read the [AWS DynamoDB Developer Guide.](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey)

The following `statestore.yaml` file shows how to configure the DynamoDB state store component to use the partition key attribute name of `ContractID`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.aws.dynamodb
  version: v1
  metadata:
  - name: table
    value: "Contracts"
  - name: partitionKey
    value: "ContractID"
```

The above component specification assumes the following DynamoDB Table Layout:

```console
{
    "Table": {
        "AttributeDefinitions": [
            {
                "AttributeName": "ContractID",
                "AttributeType": "S"
            }
        ],
        "TableName": "Contracts",
        "KeySchema": [
            {
                "AttributeName": "ContractID",
                "KeyType": "HASH"
            }
        ],
}
```

The following operation passes `"A12345"` as the value for `key`, and based on the component specification provided above, the Dapr runtime will replace the `key` attribute name with `ContractID` as the Partition/Primary Key sent to DynamoDB:

```shell
$ dapr run --app-id contractsprocessing --app-port ...

$ curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "A12345",
          "value": "Dapr Contract"
        }
      ]'
```

The following AWS CLI Command displays the contents of the DynamoDB `Contracts` table:
```shell
$ aws dynamodb get-item \
    --table-name Contracts \
    --key '{"ContractID":{"S":"contractsprocessing||A12345"}}' 
{
    "Item": {
        "value": {
            "S": "Dapr Contract"
        },
        "etag": {
            "S": "....."
        },
        "ContractID": {
            "S": "contractsprocessing||A12345"
        }
    }
}
```

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
