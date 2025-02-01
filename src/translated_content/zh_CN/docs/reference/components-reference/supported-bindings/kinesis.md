---
type: docs
title: "AWS Kinesis 绑定规范"
linkTitle: "AWS Kinesis"
description: "关于 AWS Kinesis 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kinesis/"
---

## 组件格式

要设置 AWS Kinesis 绑定，需创建一个类型为 `bindings.aws.kinesis` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})以了解如何创建和应用绑定配置。

请参阅[此处](https://aws.amazon.com/kinesis/data-streams/getting-started/)以了解如何设置 AWS Kinesis 数据流。
请参阅[认证到 AWS]({{< ref authenticating-aws.md >}})以获取与认证相关的属性信息。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.aws.kinesis
  version: v1
  metadata:
  - name: streamName
    value: "KINESIS_STREAM_NAME" # Kinesis 流名称
  - name: consumerName
    value: "KINESIS_CONSUMER_NAME" # Kinesis 消费者名称
  - name: mode
    value: "shared" # shared - 共享吞吐量或 extended - 扩展/增强扇出
  - name: region
    value: "AWS_REGION" # 请替换为实际的 AWS 区域
  - name: accessKey
    value: "AWS_ACCESS_KEY" # 请替换为实际的 AWS 访问密钥
  - name: secretKey
    value: "AWS_SECRET_KEY" # 请替换为实际的 AWS 秘密访问密钥
  - name: sessionToken
    value: "*****************"
  - name: direction
    value: "input, output"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为 secret。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `mode` | 否 | 输入| Kinesis 流模式。`shared`- 共享吞吐量，`extended` - 扩展/增强扇出方法。更多详情请参阅[此处](https://docs.aws.amazon.com/streams/latest/dev/building-consumers.html)。默认为 `"shared"` | `"shared"`, `"extended"` |
| `streamName` | 是 | 输入/输出 | AWS Kinesis 流名称 | `"stream"` |
| `consumerName` | 是 | 输入 |  AWS Kinesis 消费者名称 | `"myconsumer"` |
| `region`             | 是        | 输出 |  部署 AWS Kinesis 实例的特定 AWS 区域 | `"us-east-1"`       |
| `accessKey`          | 是        | 输出 | 访问此资源的 AWS 访问密钥                              | `"key"`             |
| `secretKey`          | 是        | 输出 | 访问此资源的 AWS 秘密访问密钥                       | `"secretAccessKey"` |
| `sessionToken`       | 否        | 输出 | 使用的 AWS 会话令牌                                            | `"sessionToken"`    |
| `direction`       | 否        | 输入/输出 | 绑定的方向                                            | `"input"`, `"output"`, `"input, output"`    |

{{% alert title="重要" color="warning" %}}
在 EKS（AWS Kubernetes）上运行 Dapr sidecar（daprd）与您的应用程序一起时，如果节点/Pod 已附加了定义访问 AWS 资源的 IAM 策略，则**不应**在组件规范中提供 AWS 访问密钥、秘密密钥和令牌。
{{% /alert %}}

## 绑定支持

此组件支持**输入和输出**绑定接口。

此组件支持具有以下操作的**输出绑定**：

- `create`

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
- [认证到 AWS]({{< ref authenticating-aws.md >}})
