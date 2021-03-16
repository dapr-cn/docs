---
type: docs
title: "AWS DynamoDB 绑定规范"
linkTitle: "AWS DynamoDB"
description: "AWS DynamoDB 绑定组件的详细文档"
---

## 组成格式

要设置 AWS DynamoDB 绑定，请创建一个类型为 `bindings.aws.dynamodb` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

关于身份验证相关属性的信息，请参阅 [认证到 AWS]({{< ref authenticating-aws.md >})

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
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
以上示例将密钥明文存储。 建议使用 [这里]({{< ref component-secrets.md >}})描述的密钥存储。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持   | 详情                          | 示例                  |
| ------------ |:--:| ------ | --------------------------- | ------------------- |
| table        | Y  | Output | DynamoDB 表名称                | `"items"`           |
| region       | Y  | Output | AWS DynamoDB 实例所部署的特定AWS 区域 | `"us-east-1"`       |
| accessKey    | Y  | Output | 要访问此资源的 AWS 访问密钥            | `"key"`             |
| secretKey    | Y  | Output | 要访问此资源的 AWS 密钥访问 Key        | `"secretAccessKey"` |
| sessionToken | N  | Output | 要使用的 AWS 会话令牌               | `"sessionToken"`    |


## 相关链接

字段名为 `ttlInSeconds`。

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
- [AWS 认证]({{< ref authenticating-aws.md >}})
