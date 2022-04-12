---
type: docs
title: "AWS SNS binding spec"
linkTitle: "AWS SNS"
description: "Detailed documentation on the AWS SNS binding component"
---

## 配置

To setup AWS SNS binding create a component of type `bindings.aws.sns`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.aws.sns
  version: v1
  metadata:
  - name: topicArn
    value: mytopic
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持 | 详情                      | 示例                  |
| ------------ |:--:| ---- | ----------------------- | ------------------- |
| topicArn     | Y  | 输出   | The SNS topic name      | `"arn:::topicarn"`  |
| region       | Y  | 输出   | The specific AWS region | `"us-east-1"`       |
| accessKey    | Y  | 输出   | 要访问此资源的 AWS 访问密钥        | `"key"`             |
| secretKey    | Y  | 输出   | 要访问此资源的 AWS 密钥访问 Key    | `"secretAccessKey"` |
| sessionToken | N  | 输出   | 要使用的 AWS 会话令牌           | `"sessionToken"`    |

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
