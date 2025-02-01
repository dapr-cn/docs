---
type: docs
title: "AWS DynamoDB 绑定说明"
linkTitle: "AWS DynamoDB"
description: "关于 AWS DynamoDB 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/dynamodb/"
---

## 组件配置格式

要配置 AWS DynamoDB 绑定，请创建一个类型为 `bindings.aws.dynamodb` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

有关身份验证相关属性的信息，请参阅[身份验证到 AWS]({{< ref authenticating-aws.md >}})

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
    value: "items"
  - name: region
    value: "us-west-2"
  - name: accessKey
    value: "*****************"
  - name: secretKey
    value: "*****************"
  - name: sessionToken
    value: "*****************"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保存密钥，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `table` | Y | 输出 | DynamoDB 表名 | `"items"` |
| `region`             | Y        | 输出 |  AWS DynamoDB 实例所在的特定 AWS 区域 | `"us-east-1"`       |
| `accessKey`          | Y        | 输出 | 访问此资源的 AWS 访问密钥                              | `"key"`             |
| `secretKey`          | Y        | 输出 | 访问此资源的 AWS 秘密访问密钥                       | `"secretAccessKey"` |
| `sessionToken`       | N        | 输出 | 使用的 AWS 会话令牌                                            | `"sessionToken"`    |

{{% alert title="重要" color="warning" %}}
当在 EKS（AWS Kubernetes）上与应用程序一起运行 Dapr sidecar（daprd）时，如果您使用的节点/Pod 已经附加了定义访问 AWS 资源的 IAM 策略，则**不需要**在组件配置中提供 AWS 访问密钥、秘密密钥和令牌。
{{% /alert %}}

## 绑定支持

此组件支持具有以下操作的**输出绑定**：

- `create`

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [操作指南：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [操作指南：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
- [身份验证到 AWS]({{< ref authenticating-aws.md >}})
