---
type: docs
title: "AWS SNS 绑定组件规范"
linkTitle: "AWS SNS"
description: "AWS SNS 绑定组件的详细说明文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/sns/"
---

## 组件格式

要配置 AWS SNS 绑定，请创建一个类型为 `bindings.aws.sns` 的组件。有关如何创建和应用绑定配置的详细信息，请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})。

有关身份验证的详细信息，请参阅[身份验证到 AWS]({{< ref authenticating-aws.md >}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.aws.sns
  version: v1
  metadata:
  - name: topicArn
    value: "mytopic"
  - name: region
    value: "us-west-2"
  - name: endpoint
    value: "sns.us-west-2.amazonaws.com"
  - name: accessKey
    value: "*****************"
  - name: secretKey
    value: "*****************"
  - name: sessionToken
    value: "*****************"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来表示密钥。建议使用密钥存储来管理这些密钥，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `topicArn`           | 是        | 输出绑定 | SNS 主题的 ARN（Amazon Resource Name） | `"arn:::topicarn"`               |
| `region`             | 是        | 输出绑定 | AWS 的特定区域                       | `"us-east-1"`                    |
| `endpoint`           | 否        | 输出绑定 | AWS 的特定端点                       | `"sns.us-east-1.amazonaws.com"`  |
| `accessKey`          | 是        | 输出绑定 | 访问资源的 AWS 访问密钥              | `"key"`                          |
| `secretKey`          | 是        | 输出绑定 | 访问资源的 AWS 秘密访问密钥          | `"secretAccessKey"`              |
| `sessionToken`       | 否        | 输出绑定 | 使用的 AWS 会话令牌                  | `"sessionToken"`                 |

{{% alert title="重要" color="warning" %}}
在 EKS（AWS Kubernetes）上与应用程序一起运行 Dapr sidecar（daprd）时，如果节点/Pod 已附加了访问 AWS 资源的 IAM 策略，则**不应**在组件规范中提供 AWS 访问密钥、秘密密钥和令牌。
{{% /alert %}}

## 绑定支持

此组件支持以下操作的**输出绑定**：

- `create`

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [bindings 构建块]({{< ref bindings >}})
- [操作指南：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [操作指南：使用bindings与外部资源接口]({{< ref howto-bindings.md >}})
- [bindings API 参考]({{< ref bindings_api.md >}})
- [身份验证到 AWS]({{< ref authenticating-aws.md >}})
