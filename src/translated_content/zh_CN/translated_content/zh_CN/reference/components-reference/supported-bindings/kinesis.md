---
type: docs
title: "AWS Kinesis绑定规范"
linkTitle: "AWS Kinesis"
description: "Detailed documentation on the AWS Kinesis 绑定组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/kinesis/"
---

## Component format

To setup AWS Kinesis binding create a component of type `bindings.aws.kinesis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

参阅[此处](https://aws.amazon.com/kinesis/data-streams/getting-started/) 了解关于如何设置AWS Kinesis数据流的介绍。阅读[Authenticating to AWS]({{< ref authenticating-aws.md >}}) 了解关于身份认证相关的属性信息。

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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field        | 必填 | 绑定支持   | 详情                                                                                                                                                                                                                           | 示例                       |
| ------------ |:--:| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| mode         | 否  | Input  | The Kinesis stream mode. `shared`- Shared throughput, `extended` - Extended/Enhanced fanout methods. More details are [here](https://docs.aws.amazon.com/streams/latest/dev/building-consumers.html). Defaults to `"shared"` | `"shared"`, `"extended"` |
| streamName   | 是  | 输入/输出  | AWS Kinesis 流名称                                                                                                                                                                                                              | `"stream"`               |
| consumerName | 是  | Input  | AWS Kinesis 消费者名称                                                                                                                                                                                                            | `"myconsumer"`           |
| region       | 是  | 输出     | 部署 AWS Kinesis 实例的特定 AWS 区域                                                                                                                                                                                                  | `"us-east-1"`            |
| accessKey    | 是  | 输出     | 要访问此资源的 AWS 访问密钥                                                                                                                                                                                                             | `"key"`                  |
| secretKey    | 是  | Output | 要访问此资源的 AWS 密钥访问 Key                                                                                                                                                                                                         | `"secretAccessKey"`      |
| sessionToken | 否  | Output | 要使用的 AWS 会话令牌                                                                                                                                                                                                                | `"sessionToken"`         |

{{% alert title="Important" color="warning" %}}
当在 EKS (AWS Kubernetes) 上与您的应用程序一起运行 Dapr sidecar (daprd) 时，如果您使用的node/pod 已附加到定义 AWS 资源访问权限的 IAM 策略，那么您 **不能**在正在使用的组件规范的定义中提供 AWS access-key、secret-key 和token。
{{% /alert %}}

## 绑定支持

This component supports both **input and output** binding interfaces.

该组件支持如下操作的 **输出绑定** ：

- `create`
## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
- [AWS 认证]({{< ref authenticating-aws.md >}})
