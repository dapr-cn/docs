---
type: docs
title: "AWS DynamoDB"
linkTitle: "AWS DynamoDB"
description: Detailed information on the AWS DynamoDB state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-dynamodb/"
---

## 配置

To setup a DynamoDB state store create a component of type `state.aws.dynamodb`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

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
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 详情                                                                                                                                                                        | 示例                                           |
| ------------ |:--:| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| table        | Y  | name of the DynamoDB table to use                                                                                                                                         | `"mytable"`                                  |
| accessKey    | N  | 具有SNS和SQS适当权限的AWS账户的ID。 可以用`secretKeyRef`来引用密钥。                                                                                                                           | `"AKIAIOSFODNN7EXAMPLE"`                     |
| secretKey    | N  | AWS用户的密钥。 可以用`secretKeyRef`来引用密钥。                                                                                                                                         | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| region       | N  | AWS区域到实例。 有效区域请参见本页面：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html。 Ensure that DynamoDB are available in that region. | `"us-east-1"`                                |
| 终结点          | N  | 该组件要使用的AWS端点， 仅用于本地开发。 仅用于本地开发。 当对生产环境的AWS，`endpoint`是不需要的。                                                                                                               | `"http://localhost:4566"`                    |
| sessionToken | N  | 要使用的 AWS 会话令牌。  A session token is only required if you are using temporary security credentials.                                                                         | `"TOKEN"`                                    |

## Setup AWS DynamoDB
关于身份验证相关属性的信息，请参阅 [认证到 AWS]({{< ref authenticating-aws.md >}})

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
- [AWS认证]({{< ref authenticating-aws.md >}})
