---
type: docs
title: "AWS DynamoDB"
linkTitle: "AWS DynamoDB"
description: AWS DynamoDB 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-dynamodb/"
---

## 配置

要设置 DynamoDB 状态储存，请创建一个类型为 `state.aws.dynamodb`的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.aws.dynamodb
  version: v1
  metadata:
  - name: table
    value: "mytable"
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
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 主键

要将 DynamoDB 用作 Dapr 状态存储，该表必须具有名为 `key` 的主键。

## 元数据字段规范

| 字段               | 必填 | 详情                                                                                                                                         | 示例                                           |
| ---------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| table            | 是  | 要使用的 DynamoDB 表的名称                                                                                                                         | `"mytable"`                                  |
| accessKey        | 否  | 具有SNS和SQS适当权限的AWS账户的ID。 可以用`secretKeyRef`来引用密钥。                                                                                            | `"AKIAIOSFODNN7EXAMPLE"`                     |
| secretKey        | 否  | AWS用户的密钥。 可以用`secretKeyRef`来引用密钥。                                                                                                          | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| region           | 否  | AWS区域到实例。 有效区域请参见本页面：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html。 确保 DynamoDB 在该区域可用。 | `"us-east-1"`                                |
| endpoint         | 否  | 该组件要使用的AWS端点， 仅用于本地开发。 仅用于本地开发。 当对生产环境的AWS，`endpoint`是不需要的。                                                                                | `"http://localhost:4566"`                    |
| sessionToken     | 否  | 要使用的 AWS 会话令牌。  只有当您使用临时安全凭证时才需要会话令牌。                                                                                                      | `"TOKEN"`                                    |
| ttlAttributeName | 否  | 应用于 TTL 的表属性名称。                                                                                                                            | `"expiresAt"`                                |

{{% alert title="Important" color="warning" %}}
当在 EKS (AWS Kubernetes) 上与您的应用程序一起运行 Dapr sidecar (daprd) 时，如果您使用的node/pod 已附加到定义 AWS 资源访问权限的 IAM 策略，那么您 **不能**在正在使用的组件规范的定义中提供 AWS access-key、secret-key 和token。
{{% /alert %}}

## 设置 AWS DynamoDB

有关身份验证相关属性的信息，请参阅 [向 AWS 进行身份验证]({{< ref authenticating-aws.md >}})

## 生存时间 (TTL)

为了使用 DynamoDB TTL 功能，您必须在表上启用 TTL 并定义属性名称。 属性名称必须在 `ttlAttributeName` 字段中定义。 请参阅官方 [AWS 文档](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)。

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
- [AWS认证]({{< ref authenticating-aws.md >}})
