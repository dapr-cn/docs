---
type: docs
title: "AWS DynamoDB 绑定规范"
linkTitle: "AWS DynamoDB"
description: "AWS DynamoDB 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/dynamodb/"
---

## Component format

To setup AWS DynamoDB binding create a component of type `bindings.aws.dynamodb`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

有关身份验证相关属性的信息，请参阅 [向 AWS 进行身份验证]({{< ref authenticating-aws.md >}})

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.aws.dynamodb
  version: v1
  metadata:
  - name: table
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field        | 必填 | 绑定支持   | 详情                          | 示例                  |
| ------------ |:--:| ------ | --------------------------- | ------------------- |
| table        | 是  | Output | The DynamoDB table name     | `"items"`           |
| region       | 是  | 输出     | AWS DynamoDB 实例所部署的特定AWS 区域 | `"us-east-1"`       |
| accessKey    | 是  | 输出     | 要访问此资源的 AWS 访问密钥            | `"key"`             |
| secretKey    | 是  | 输出     | 要访问此资源的 AWS 密钥访问 Key        | `"secretAccessKey"` |
| sessionToken | 否  | 输出     | 要使用的 AWS 会话令牌               | `"sessionToken"`    |

{{% alert title="Important" color="warning" %}}
当在 EKS (AWS Kubernetes) 上与您的应用程序一起运行 Dapr sidecar (daprd) 时，如果您使用的node/pod 已附加到定义 AWS 资源访问权限的 IAM 策略，那么您 **不能**在正在使用的组件规范的定义中提供 AWS access-key、secret-key 和token。
{{% /alert %}}


## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
- [AWS 认证]({{< ref authenticating-aws.md >}})
