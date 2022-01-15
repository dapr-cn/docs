---
type: docs
title: "AWS SNS/SQS"
linkTitle: "AWS SNS/SQS"
description: "关于AWS SNS/SQS pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-aws-snssqs/"
---

## 配置
要为 发布/订阅设置 AWS SNS/SQS，您需要创建一个类型为 `pubsub.snssqs` 的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: snssqs-pubsub
  namespace: default
spec:
  type: pubsub.snssqs
  version: v1
  metadata:
    - name: accessKey
      value: "AKIAIOSFODNN7EXAMPLE"
    - name: secretKey
      value: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    - name: region
      value: "us-east-1"
    - name: sessionToken
      value: "TOKEN"
    - name: messageVisibilityTimeout
      value: 10
    - name: messageRetryLimit
      value: 10
    - name: messageWaitTimeSeconds
      value: 1
    - name: messageMaxNumber
      value: 10
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                       | 必填 | 详情                                                                                                                                    | 示例                                           |
| ------------------------ |:--:| ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| accessKey                | Y  | 具有SNS和SQS适当权限的AWS账户的ID。 可以用`secretKeyRef`来引用密钥。                                                                                       | `"AKIAIOSFODNN7EXAMPLE"`                     |
| secretKey                | Y  | AWS用户的密钥。 可以用`secretKeyRef`来引用密钥。                                                                                                     | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| region                   | Y  | AWS区域到实例。 有效区域请参见本页面：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html。 确保该地区有SNS和SQS。 | `"us-east-1"`                                |
| 终结点                      | N  | 该组件要使用的AWS端点， 仅用于本地开发。 仅用于本地开发。 当对生产环境的AWS，`endpoint`是不需要的。                                                                           | `"http://localhost:4566"`                    |
| sessionToken             | N  | 要使用的 AWS 会话令牌。  只有当您使用临时安全凭证时才需要会话令牌。                                                                                                 | `"TOKEN"`                                    |
| messageVisibilityTimeout | N  | 消息发送至订阅者后，隐藏接收请求的时间，以秒为单位。 默认值：`10`                                                                                                   | `10`                                         |
| messageRetryLimit        | N  | 在处理消息失败后，从队列中删除该消息之前，重新发送消息的次数。 默认值：`10`                                                                                              | `10`                                         |
| messageWaitTimeSeconds   | N  | 等待收到消息后再提出请求的时间 默认值：`1`                                                                                                               | `1`                                          |
| messageMaxNumber         | N  | 每次从队列中接收消息的最大数量。 默认值：`10`，最大值：`10`                                                                                                    | `10`                                         |

## 创建SNS/SQS实例

{{< tabs "Self-Hosted" "Kubernetes" "AWS" >}}

{{% codetab %}}
对于本地开发来说，可以用[localstack项目](https://github.com/localstack/localstack)集成AWS SNS/SQS。 按照[这里](https://github.com/localstack/localstack#installing)的说明安装localstack CLI。

In order to use localstack with your pubsub binding, you need to provide the `endpoint` configuration in the component metadata. 当在AWS生产环境上运行时，`endpoint`是不需要的。

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: snssqs-pubsub
spec:
  type: pubsub.snssqs
  version: v1
  metadata:
    - name: endpoint
      value: http://localhost:4566
    # Use us-east-1 for localstack
    - name: region
      value: us-east-1
```
{{% /codetab %}}

{{% codetab %}}
要在Kubernetes上运行localstack，可以应用以下配置。 Localstack is then reachable at the DNS name `http://localstack.default.svc.cluster.local:4566` (assuming this was applied to the default namespace) and this should be used as the `endpoint`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: localstack
  namespace: default
spec:
  # using the selector, we will expose the running deployments
  # this is how Kubernetes knows, that a given service belongs to a deployment
  selector:
    matchLabels:
      app: localstack
  replicas: 1
  template:
    metadata:
      labels:
        app: localstack
    spec:
      containers:
      - name: localstack
        image: localstack/localstack:latest
        ports:
          # Expose the edge endpoint
          - containerPort: 4566
---
kind: Service
apiVersion: v1
metadata:
  name: localstack
  labels:
    app: localstack
spec:
  selector:
    app: localstack
  ports:
  - protocol: TCP
    port: 4566
    targetPort: 4566
  type: LoadBalancer

```
{{% /codetab %}}

{{% codetab %}}
为了在AWS中运行，你应该创建一个具有SNS和SQS服务权限的IAM用户。 使用`AWS account ID`和`AWS account secret`，并使用Kubernetes密钥和`secretKeyRef`将它们插入组件元数据中的`accessKey`和`secretKey`。
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- [发布/订阅构建块]({{< ref pubsub >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [将AWS SQS作为SNS的订阅者](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html)
- [AWS SNS API reference](https://docs.aws.amazon.com/sns/latest/api/Welcome.html)
- [AWS SQS API reference](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/Welcome.html)
- [AWS认证]({{< ref authenticating-aws.md >}})
