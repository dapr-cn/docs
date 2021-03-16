---
type: docs
title: "AWS SNS/SQS"
linkTitle: "AWS SNS/SQS"
description: "关于AWS SNS/SQS pubsub组件的详细文档"
---

## 组件格式
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
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                       | 必填 | 详情                                                                                                                                    | 示例                                           |
| ------------------------ |:--:| ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| accessKey                | Y  | 具有SNS和SQS适当权限的AWS账户的ID。 可以用`secretKeyRef`来引用密钥。                                                                                       | `"AKIAIOSFODNN7EXAMPLE"`                     |
| secretKey                | Y  | AWS用户的密钥。 可以用`secretKeyRef`来引用密钥。                                                                                                     | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| region                   | Y  | AWS区域到实例。 有效区域请参见本页面：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html。 确保该地区有SNS和SQS。 | `"us-east-1"`                                |
| endpoint                 | N  | 该组件要使用的AWS端点， 仅用于本地开发。 当对生产环境的AWS，`endpoint`是不需要的。                                                                                    | `"http://localhost:4566"`                    |
| sessionToken             | N  | 要使用的 AWS 会话令牌。  只有当您使用临时安全凭证时才需要会话令牌。                                                                                                 | `"TOKEN"`                                    |
| messageVisibilityTimeout | N  | 消息发送至订阅者后，隐藏接收请求的时间，以秒为单位。 默认值：`10`                                                                                                   | `10`                                         |
| messageRetryLimit        | N  | 在处理消息失败后，从队列中删除该消息之前，重新发送消息的次数。 Default: `10`                                                                                         | `10`                                         |
| messageWaitTimeSeconds   | N  | amount of time to await receipt of a message before making another request. Default: `1`                                              | `1`                                          |
| messageMaxNumber         | N  | maximum number of messages to receive from the queue at a time. Default: `10`, Maximum: `10`                                          | `10`                                         |

## Create an SNS/SQS instance

{{< tabs "Self-Hosted" "Kubernetes" "AWS" >}}

{{% codetab %}}
For local development the [localstack project](https://github.com/localstack/localstack) is used to integrate AWS SNS/SQS. Follow the instructions [here](https://github.com/localstack/localstack#installing) to install the localstack CLI.

In order to use localstack with your pubsub binding, you need to provide the `endpoint` configuration in the component metadata. The `endpoint` is unncessary when running against production AWS.

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
To run localstack on Kubernetes, you can apply the configuration below. Localstack is then reachable at the DNS name `http://localstack.default.svc.cluster.local:4566` (assuming this was applied to the default namespace) and this should be used as the `endpoint`
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
In order to run in AWS, you should create an IAM user with permissions to the SNS and SQS services. Use the `AWS account ID` and `AWS account secret` and plug them into the `accessKey` and `secretKey` in the component metadata using Kubernetes secrets and `secretKeyRef`.
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Pub/Sub building block]({{< ref pubsub >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [AWS SQS as subscriber to SNS](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html)
- [AWS SNS API refernce](https://docs.aws.amazon.com/sns/latest/api/Welcome.html)
- [AWS SQS API refernce](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/Welcome.html)
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
