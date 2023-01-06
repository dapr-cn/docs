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
    # - name: endpoint # Optional. 
    #   value: "http://localhost:4566"
    # - name: sessionToken  # Optional (mandatory if using AssignedRole, i.e. temporary accessKey and secretKey)
    #   value: "TOKEN"
    # - name: messageVisibilityTimeout # Optional
    #   value: 10
    # - name: messageRetryLimit # Optional
    #   value: 10
    # - name: messageReceiveLimit # Optional
    #   value: 10
    # - name: sqsDeadLettersQueueName # Optional
    # - value: "myapp-dlq"
    # - name: messageWaitTimeSeconds # Optional
    #   value: 1
    # - name: messageMaxNumber # Optional
    #   value: 10
    # - name: fifo # Optional
    #   value: "true"
    # - name: fifoMessageGroupID # Optional
    #   value: "app1-mgi"
    # - name: disableEntityManagement # Optional
    #   value: "false"
    # - name: disableDeleteOnRetryLimit # Optional
    #   value: "false"
    # - name: assetsManagementTimeoutSeconds # Optional
    #   value: 5



```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                             | 必填 | 详情                                                                                                                                                                                                                                                | 示例                                           |
| ------------------------------ |:--:| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| accessKey                      | 是  | 具有SNS和SQS适当访问权限的AWS账户/角色的ID(参见下方)。                                                                                                                                                                                                                | `"AKIAIOSFODNN7EXAMPLE"`                     |
| secretKey                      | 是  | AWS用户/角色的密钥。 如果使用`AssumeRole` 访问，还需要提供一个`sessionToken`                                                                                                                                                                                            | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| region                         | 是  | SNS/SQS 资产所在或创建于其中的 AWS 区域。 有关有效区域，请参考[本页](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/?p=ugi&l=na)。 确保 SNS 和 SQS 在该区域内是可用的。                                                                                 | `"us-east-1"`                                |
| endpoint                       | 否  | 该组件要使用的AWS端点， 仅用于本地开发。 仅用于本地开发，例如同[localstack](https://github.com/localstack/localstack)一起使用。 当对生产环境的AWS，`endpoint`是不需要的。                                                                                                                         | `"http://localhost:4566"`                    |
| sessionToken                   | 否  | 要使用的 AWS 会话令牌。  只有当您使用临时安全凭证时才需要会话令牌。                                                                                                                                                                                                             | `"TOKEN"`                                    |
| messageReceiveLimit            | 否  | 在处理该消息失败后接收消息的次数，一旦达到次数限制，就会导致从队列中删除该消息。 如果指定`sqsDeadLettersQueueName`，`messageReceiveLimit` 指定在处理该消息失败后接收消息的次数，一旦达到次数限制，会将该消息转移到SQS 死信队列。 默认值：`10`                                                                                               | `10`                                         |
| sqsDeadLettersQueueName        | 否  | 应用程序的死信队列的名称                                                                                                                                                                                                                                      | `"myapp-dlq"`                                |
| messageVisibilityTimeout       | 否  | 消息发送至订阅者后，隐藏接收请求的时间，以秒为单位。 默认值：`10`                                                                                                                                                                                                               | `10`                                         |
| messageRetryLimit              | 否  | 在处理消息失败后，从队列中删除该消息之前，重新发送消息的次数。 默认值：`10`                                                                                                                                                                                                          | `10`                                         |
| messageWaitTimeSeconds         | 否  | 调用在返回之前等待消息到达队列的持续时间（以秒为单位）。 如果消息可用，则调用会早于 `messageWaitTimeSeconds`返回。 如果没有消息可用并且等待时间到期，则该调用成功返回一个空的消息列表。 默认值：`1`                                                                                                                                 | `1`                                          |
| messageMaxNumber               | 否  | 每次从队列中接收消息的最大数量。 默认值：`10`，最大值：`10`                                                                                                                                                                                                                | `10`                                         |
| fifo                           | 否  | 使用 SQS FIFO 队列提供消息排序和重复数据删除。  默认值为 `"false"`. 参照[SQS FIFO](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html)获取更多详细信息                                                                                   | `"true"`, `"false"`                          |
| fifoMessageGroupID             | 否  | 如果启用 `fifo` ，则指示 Dapr 使用自定义[Message Group ID](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/using-messagegroupid-property.html)进行 pubsub 部署。 这并不强制因为Dap会为每一个消息生产者创建自定义Message Group ID，以确保每个Dapr消息生产者的消息顺序。 默认值：`""` | `"app1-mgi"`                                 |
| disableEntityManagement        | 否  | 当设置为 true 时，不会自动创建 SNS 主题、SQS 队列和 SQS 对 SNS 的订阅。 默认值为 `"false"`                                                                                                                                                                                   | `"true"`, `"false"`                          |
| disableDeleteOnRetryLimit      | 否  | 当设置为true时，在处理消息失败并重试 `messageRetryLimit` 次数后，重置该消息的可见性超时，以便其他消费者可以尝试处理，而不是从SQS中删除该消息（默认如此）。 默认值为 `"false"`                                                                                                                                        | `"true"`, `"false"`                          |
| assetsManagementTimeoutSeconds | 否  | 以秒为单位，AWS资产管理的操作时间，超时将被取消。 资产管理操作可以是在STS、SNS和SQS上的任何一种操作行为，实现默认Dapr组件重试行为的消息发布和消费操作除外。 取值可以是任何非负的单精度浮点数或者整数（float/integer）。 默认值：`5`                                                                                                               | `0.5`, `10`                                  |


* Dapr创建SNS话题和SQS队列名符合[AWS 规范](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-queues.html)。 默认情况下，Dapr 根据消费者 `app-id`创建一个 SQS 队列名称，因此 Dapr 可能会执行名称标准化以满足 AWS 规范。
* 根据 AWS 规范，使用 SQS FIFO（`fifo` 元数据字段设置为 `“true”`）提供消息排序和排重，但会导致 SQS 消息处理吞吐量变低，以及其他警告。
* 请注意，指定 `fifoMessageGroupID` 会将使用的 FIFO 队列的并发消费者数量限制为仅一个，但可以保证应用程序的 Dapr sidecars 发布的消息的全局有序。 请参阅 [这里](https://aws.amazon.com/blogs/compute/solving-complex-ordering-challenges-with-amazon-sqs-fifo-queues/) ， 以更好地理解 Message Group ID 和 FIFO 队列的主题。

{{% alert title="Important" color="warning" %}}
当在 EKS (AWS Kubernetes) 上与您的应用程序一起运行 Dapr sidecar (daprd) 时，如果您使用的node/pod 已附加到定义 AWS 资源访问权限的 IAM 策略，那么您 **不能**在正在使用的组件规范的定义中提供 AWS access-key、secret-key 和token。
{{% /alert %}}

## 创建SNS/SQS实例

{{< tabs "Self-Hosted" "Kubernetes" "AWS" >}}

{{% codetab %}}
对于本地开发来说，可以用[localstack项目](https://github.com/localstack/localstack)集成AWS SNS/SQS。 按照 [此处](https://github. com/localstack/localstack#running)说明运行 localstack。

要使用 Docker 命令行运行本地localstack，请应用以下 cmd：
```shell
docker run --rm -it -p 4566:4566 -p 4571:4571 -e SERVICES="sts,sns,sqs" -e AWS_DEFAULT_REGION="us-east-1" localstack/localstack
```


为了将 localstack 与您的 pubsub 绑定一起使用，您需要在组件元数据中提供 `endpoint` 配置。 当在AWS生产环境上运行时，`endpoint`是不需要的。

有关身份验证相关属性的信息，请参阅 [向 AWS 进行身份验证]({{< ref authenticating-aws.md >}})

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: snssqs-pubsub
spec:
  type: pubsub.snssqs
  version: v1
  metadata:
    - name: accessKey
      value: "anyString"
    - name: secretKey
      value: "anyString"
    - name: endpoint
      value: http://localhost:4566
    # Use us-east-1 or any other region if provided to localstack as defined by "AWS_DEFAULT_REGION" envvar
    - name: region
      value: us-east-1
```
{{% /codetab %}}

{{% codetab %}}
要在Kubernetes上运行localstack，可以应用以下配置。 然后 Localstack 可以通过 DNS 名称 `http://localstack.default.svc.cluster.local:4566` 访问（假设这已应用于默认命名空间），这应该用作 `endpoint`
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
为了在 AWS 中运行，您应该创建或分配一个 IAM 用户，该用户有权访问具有以下策略的 SNS 和 SQS 服务：
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "YOUR_POLICY_NAME",
      "Effect": "Allow",
      "Action": [
        "sns:CreateTopic",
        "sns:GetTopicAttributes",
        "sns:ListSubscriptionsByTopic",
        "sns:Publish",
        "sns:Subscribe",
        "sns:TagResource",
        "sqs:ChangeMessageVisibility",
        "sqs:CreateQueue",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes",
        "sqs:GetQueueUrl",
        "sqs:ReceiveMessage",
        "sqs:SetQueueAttributes",
        "sqs:TagQueue"
      ],
      "Resource": [
        "arn:aws:sns:AWS_REGION:AWS_ACCOUNT_ID:*",
        "arn:aws:sqs:AWS_REGION:AWS_ACCOUNT_ID:*"
      ]
    }
  ]
}
```
使用`AWS account ID`和`AWS account secret`，并使用Kubernetes密钥和`secretKeyRef`将它们插入组件元数据中的`accessKey`和`secretKey`。


或者，如果您希望使用自己选择的工具（例如 Terraform）预置 SNS 和 SQS 资产，同时防止 Dapr 动态执行此操作，则需要启用 ` disableEntityManagement ` ，并使用 IAM 角色分配使用 Dapr 的应用程序，该角色具有如下策略：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "YOUR_POLICY_NAME",
      "Effect": "Allow",
      "Action": [
        "sqs:DeleteMessage",
        "sqs:ReceiveMessage",
        "sqs:ChangeMessageVisibility",
        "sqs:GetQueueUrl",
        "sqs:GetQueueAttributes",
        "sns:Publish",
        "sns:ListSubscriptionsByTopic",
        "sns:GetTopicAttributes"

      ],
      "Resource": [
        "arn:aws:sns:AWS_REGION:AWS_ACCOUNT_ID:APP_TOPIC_NAME",
        "arn:aws:sqs:AWS_REGION:AWS_ACCOUNT_ID:APP_ID"
      ]
    }
  ]
}
```

如果您在具有动态资产创建的 EKS 集群上运行应用程序（默认 Dapr 行为）
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
