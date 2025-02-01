---
type: docs
title: "AWS DynamoDB"
linkTitle: "AWS DynamoDB"
description: 详细介绍 AWS DynamoDB 状态存储组件
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-dynamodb/"
---

## 组件格式

要设置 DynamoDB 状态存储，需要创建一个类型为 `state.aws.dynamodb` 的组件。请参考[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

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
    value: "AKIAIOSFODNN7EXAMPLE" # 可选
  - name: secretKey
    value: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" # 可选
  - name: endpoint
    value: "http://localhost:8080" # 可选
  - name: region
    value: "eu-west-1" # 可选
  - name: sessionToken
    value: "myTOKEN" # 可选
  - name: ttlAttributeName
    value: "expiresAt" # 可选
  - name: partitionKey
    value: "ContractID" # 可选
  # 如果希望将 AWS DynamoDB 用作 actor 的状态存储，请取消注释此行（可选）
  #- name: actorStateStore
  #  value: "true"
```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为 secret。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 主键

要将 DynamoDB 用作 Dapr 状态存储，表必须有一个名为 `key` 的主键。请参考[分区键]({{< ref "setup-dynamodb.md#partition-keys" >}})部分以了解如何更改此设置。

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| table              | Y  | 要使用的 DynamoDB 表的名称  | `"Contracts"`
| accessKey          | N  | 具有适当权限的 AWS 账户的 ID，可使用 `secretKeyRef` 来引用 secret  | `"AKIAIOSFODNN7EXAMPLE"`
| secretKey          | N  | AWS 用户的 secret，可使用 `secretKeyRef` 来引用 secret   |`"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`
| region             | N  | 实例的 AWS 区域。请参阅此页面以获取有效区域：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html。确保 DynamoDB 在该区域可用。| `"us-east-1"`
| endpoint          | N  | 组件使用的 AWS 端点。仅用于本地开发。在生产 AWS 上运行时不需要 `endpoint`   | `"http://localhost:4566"`
| sessionToken      | N  | 使用的 AWS 会话令牌。仅在使用临时安全凭证时需要会话令牌。 | `"TOKEN"`
| ttlAttributeName  | N  | 应用于 TTL 的表属性名称。 | `"expiresAt"`
| partitionKey      | N  | 表的主键或分区键属性名称。此字段用于替换默认的主键属性名称 `"key"`。请参阅[分区键]({{< ref "setup-dynamodb.md#partition-keys" >}})部分。  | `"ContractID"`
| actorStateStore      | N  | 将此状态存储视为 actor 的状态存储。默认为 "false" | `"true"`, `"false"`

{{% alert title="重要" color="warning" %}}
在 EKS（AWS Kubernetes）上运行 Dapr sidecar（daprd）时，如果节点/Pod 已附加了访问 AWS 资源的 IAM 策略，则**不应**在组件规格中提供 AWS 访问密钥、secret 密钥和令牌。
{{% /alert %}}

## 设置 AWS DynamoDB

有关身份验证相关属性的信息，请参阅[身份验证到 AWS]({{< ref authenticating-aws.md >}})

## 生存时间（TTL）

要使用 DynamoDB 的 TTL 功能，必须在表上启用 TTL 并定义属性名称。
属性名称需要在 `ttlAttributeName` 字段中指定。
请参阅官方[AWS 文档](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)。

## 分区键

默认情况下，DynamoDB 状态存储组件使用表属性名称 `key` 作为 DynamoDB 表中的主键/分区键。
可以通过在组件配置中指定一个元数据字段，键为 `partitionKey`，值为所需的属性名称来覆盖此设置。

要了解有关 DynamoDB 主键/分区键的更多信息，请阅读[AWS DynamoDB 开发者指南](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey)。

以下 `statestore.yaml` 文件展示了如何配置 DynamoDB 状态存储组件以使用 `ContractID` 作为分区键属性名称：

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

上述组件规格假设以下 DynamoDB 表布局：

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

以下操作将 `"A12345"` 作为 `key` 的值传递，根据上述组件规格，Dapr 运行时将 `key` 属性名称替换为 `ContractID`，作为发送到 DynamoDB 的分区/主键：

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

以下 AWS CLI 命令显示 DynamoDB `Contracts` 表的内容：
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

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
- [身份验证到 AWS]({{< ref authenticating-aws.md >}})
