---
type: docs
title: "AWS SNS binding spec"
linkTitle: "AWS SNS"
description: "Detailed documentation on the AWS SNS binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/sns/"
---

## 配置

要设置 AWS SNS绑定，请创建一个 `bindings.aws.sns` 类型的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

有关身份验证相关属性的信息，请参阅 [向 AWS 进行身份验证]({{< ref authenticating-aws.md >}})

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

| 字段           | 必填 | 绑定支持 | 详情                   | 示例                  |
| ------------ |:--:| ---- | -------------------- | ------------------- |
| topicArn     | Y  | 输出   | SNS话题名称              | `"arn:::topicarn"`  |
| region       | Y  | 输出   | 指定的 AWS 区域（region）   | `"us-east-1"`       |
| accessKey    | Y  | 输出   | 要访问此资源的 AWS 访问密钥     | `"key"`             |
| secretKey    | Y  | 输出   | 要访问此资源的 AWS 密钥访问 Key | `"secretAccessKey"` |
| sessionToken | N  | 输出   | 要使用的 AWS 会话令牌        | `"sessionToken"`    |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
- [AWS认证]({{< ref authenticating-aws.md >}})
