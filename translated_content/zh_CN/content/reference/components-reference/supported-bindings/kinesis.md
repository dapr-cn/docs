---
type: docs
title: "AWS Kinesis binding spec"
linkTitle: "AWS Kinesis"
description: "Detailed documentation on the AWS Kinesis binding component"
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

| 字段           | 必填 | 绑定支持         | 详情                                                                                                                                                                                                                           | 示例                       |
| ------------ |:--:| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| mode         | N  | 输入           | The Kinesis stream mode. `shared`- Shared throughput, `extended` - Extended/Enhanced fanout methods. More details are [here](https://docs.aws.amazon.com/streams/latest/dev/building-consumers.html). Defaults to `"shared"` | `"shared"`, `"extended"` |
| streamName   | Y  | Input/Output | The AWS Kinesis Stream Name                                                                                                                                                                                                  | `"stream"`               |
| consumerName | Y  | 输入           | The AWS Kinesis Consumer Name                                                                                                                                                                                                | `"myconsumer"`           |
| region       | Y  | 输出           | The specific AWS region the AWS Kinesis instance is deployed in                                                                                                                                                              | `"us-east-1"`            |
| accessKey    | Y  | 输出           | 要访问此资源的 AWS 访问密钥                                                                                                                                                                                                             | `"key"`                  |
| secretKey    | Y  | 输出           | 要访问此资源的 AWS 密钥访问 Key                                                                                                                                                                                                         | `"secretAccessKey"`      |
| sessionToken | N  | 输出           | 要使用的 AWS 会话令牌                                                                                                                                                                                                                | `"sessionToken"`         |

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
