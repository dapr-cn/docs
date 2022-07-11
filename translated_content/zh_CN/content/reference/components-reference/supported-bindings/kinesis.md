---
type: docs
title: "AWS Kinesis绑定规范"
linkTitle: "AWS Kinesis"
description: "Detailed documentation on the AWS Kinesis 绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kinesis/"
---

## 配置

需要创建一个类型为`bindings.aws.kinesis`的组件来设置 AWS Kinesis绑定。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

参阅[此处](https://aws.amazon.com/kinesis/data-streams/getting-started/) 了解关于如何设置AWS Kinesis数据流的介绍。阅读[Authenticating to AWS]({{< ref authenticating-aws.md >}}) 了解关于身份认证相关的属性信息。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.aws.kinesis
  version: v1
  metadata:
  - name: streamName
    value: KINESIS_STREAM_NAME # Kinesis stream name
  - name: consumerName
    value: KINESIS_CONSUMER_NAME # Kinesis consumer name
  - name: mode
    value: shared # shared - Shared throughput or extended - Extended/Enhanced fanout
  - name: region
    value: AWS_REGION #replace
  - name: accessKey
    value: AWS_ACCESS_KEY # replace
  - name: secretKey
    value: AWS_SECRET_KEY #replace
  - name: sessionToken
    value: *****************

```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 推荐使用secret store 组件存储 Secret ， 恰如[这里]({{< ref component-secrets.md >}})所描述。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 绑定支持  | 详情                                                                                                                                                                 | 示例                       |
| ------------ |:--:| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| mode         | 否  | 输入    | Kinesis 流模式。 ` shared `- 共享吞吐量， ` extended ` - 扩展/增强扇出方法。 更多细节 [参照这里](https://docs. aws. amazon. com/streams/latest/dev/building-consumers. html)。 默认值为 `"shared"` | `"shared"`, `"extended"` |
| streamName   | 是  | 输入/输出 | AWS Kinesis 流名称                                                                                                                                                    | `"stream"`               |
| consumerName | 是  | 输入    | AWS Kinesis 消费者名称                                                                                                                                                  | `"myconsumer"`           |
| region       | 是  | 输出    | 部署 AWS Kinesis 实例的特定 AWS 区域                                                                                                                                        | `"us-east-1"`            |
| accessKey    | 是  | 输出    | 要访问此资源的 AWS 访问密钥                                                                                                                                                   | `"key"`                  |
| secretKey    | 是  | 输出    | 要访问此资源的 AWS 密钥访问 Key                                                                                                                                               | `"secretAccessKey"`      |
| sessionToken | 否  | 输出    | 要使用的 AWS 会话令牌                                                                                                                                                      | `"sessionToken"`         |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持如下操作的**输出绑定**:

- `create`
## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
- [AWS认证]({{< ref authenticating-aws.md >}})
