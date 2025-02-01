---
type: docs
title: "AWS SQS 绑定规范"
linkTitle: "AWS SQS"
description: "关于 AWS SQS 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/sqs/"
---

## 组件格式

要设置 AWS SQS 绑定，您需要创建一个类型为 `bindings.aws.sqs` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

关于身份验证相关属性的信息，请参阅[身份验证到 AWS]({{< ref authenticating-aws.md >}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.aws.sqs
  version: v1
  metadata:
  - name: queueName
    value: "items"
  - name: region
    value: "us-west-2"
  - name: accessKey
    value: "*****************"
  - name: secretKey
    value: "*****************"
  - name: sessionToken
    value: "*****************"
  - name: direction 
    value: "input, output"
```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为密钥。建议使用密钥存储来保存密钥，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `queueName` | Y | 输入/输出 | SQS 队列名称 | `"myqueue"` |
| `region`             | Y        | 输入/输出 |  特定的 AWS 区域 | `"us-east-1"`       |
| `accessKey`          | Y        | 输入/输出 | 访问此资源的 AWS 访问密钥                              | `"key"`             |
| `secretKey`          | Y        | 输入/输出 | 访问此资源的 AWS 秘密访问密钥                       | `"secretAccessKey"` |
| `sessionToken`       | N        | 输入/输出 | 要使用的 AWS 会话令牌                                            | `"sessionToken"`    |
| `direction`       | N        | 输入/输出 | 绑定的方向                                           | `"input"`, `"output"`, `"input, output"`    |

{{% alert title="重要" color="warning" %}}
在 EKS（AWS Kubernetes）上与应用程序一起运行 Dapr sidecar（daprd）时，如果您使用的节点/Pod 已经附加了定义访问 AWS 资源的 IAM 策略，则**不应**在组件规范中提供 AWS 访问密钥、秘密密钥和令牌。
{{% /alert %}}

## 绑定支持

此组件支持**输入和输出**绑定接口。

此组件支持以下操作的**输出绑定**：

- `create`

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [操作指南：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [操作指南：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
- [身份验证到 AWS]({{< ref authenticating-aws.md >}})
