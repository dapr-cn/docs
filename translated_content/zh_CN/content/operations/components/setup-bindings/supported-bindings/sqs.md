---
type: docs
title: "AWS SQS binding spec"
linkTitle: "AWS SQS"
description: "Detailed documentation on the AWS SQS binding component"
---

## 配置

To setup AWS SQS binding create a component of type `bindings.aws.sqs`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

关于身份验证相关属性的信息，请参阅 [认证到 AWS]({{< ref authenticating-aws.md >}})

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
以上示例将密钥明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持         | 详情                      | 示例                  |
| ------------ |:--:| ------------ | ----------------------- | ------------------- |
| queueName    | 是  | Input/Output | The SQS queue name      | `"myqueue"`         |
| region       | 是  | Input/Output | The specific AWS region | `"us-east-1"`       |
| accessKey    | 是  | Input/Output | 要访问此资源的 AWS 访问密钥        | `"key"`             |
| secretKey    | 是  | Input/Output | 要访问此资源的 AWS 密钥访问 Key    | `"secretAccessKey"` |
| sessionToken | N  | Input/Output | 要使用的 AWS 会话令牌           | `"sessionToken"`    |


## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持**输出绑定**，其操作如下:

- `create`


## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
- [AWS认证]({{< ref authenticating-aws.md >}})
