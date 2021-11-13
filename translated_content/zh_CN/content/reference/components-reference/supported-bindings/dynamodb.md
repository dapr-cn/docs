---
type: docs
title: "AWS DynamoDB 绑定规范"
linkTitle: "AWS DynamoDB"
description: "AWS DynamoDB 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/dynamodb/"
---

## 配置

要设置 AWS DynamoDB 绑定，请创建一个类型为 `bindings.aws.dynamodb` 的组件。 See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

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
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持 | 详情                          | Example             |
| ------------ |:--:| ---- | --------------------------- | ------------------- |
| table        | Y  | 输出   | DynamoDB 表名称                | `"items"`           |
| region       | Y  | 输出   | AWS DynamoDB 实例所部署的特定AWS 区域 | `"us-east-1"`       |
| accessKey    | Y  | 输出   | 要访问此资源的 AWS 访问密钥            | `"key"`             |
| secretKey    | Y  | 输出   | 要访问此资源的 AWS 密钥访问 Key        | `"secretAccessKey"` |
| sessionToken | N  | 输出   | 要使用的 AWS 会话令牌               | `"sessionToken"`    |


## 绑定支持

字段名为 `ttlInSeconds`。

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
- [AWS认证]({{< ref authenticating-aws.md >}})
