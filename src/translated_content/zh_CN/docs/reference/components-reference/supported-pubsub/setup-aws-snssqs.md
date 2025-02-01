---
type: docs
title: "AWS SNS/SQS"
linkTitle: "AWS SNS/SQS"
description: "关于AWS SNS/SQS pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-aws-snssqs/"
---

## 组件格式

要设置AWS SNS/SQS pub/sub，创建一个类型为`pubsub.aws.snssqs`的组件。

默认情况下，AWS SNS/SQS组件会：

- 创建SNS主题
- 配置SQS队列
- 设置队列到主题的订阅

{{% alert title="注意" color="primary" %}}
如果您只有发布者而没有订阅者，那么只会创建SNS主题。

但是，如果您有订阅者，则会生成SNS、SQS及其动态或静态订阅。
{{% /alert %}}

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: snssqs-pubsub
spec:
  type: pubsub.aws.snssqs
  version: v1
  metadata:
    - name: accessKey
      value: "AKIAIOSFODNN7EXAMPLE"
    - name: secretKey
      value: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    - name: region
      value: "us-east-1"
    # - name: consumerID # 可选。如果未提供，运行时将创建一个。
    #   value: "channel1"
    # - name: endpoint # 可选。
    #   value: "http://localhost:4566"
    # - name: sessionToken  # 可选（如果使用AssignedRole则必须；例如，临时accessKey和secretKey）
    #   value: "TOKEN"
    # - name: messageVisibilityTimeout # 可选
    #   value: 10
    # - name: messageRetryLimit # 可选
    #   value: 10
    # - name: messageReceiveLimit # 可选
    #   value: 10
    # - name: sqsDeadLettersQueueName # 可选
    # - value: "myapp-dlq"
    # - name: messageWaitTimeSeconds # 可选
    #   value: 1
    # - name: messageMaxNumber # 可选
    #   value: 10
    # - name: fifo # 可选
    #   value: "true"
    # - name: fifoMessageGroupID # 可选
    #   value: "app1-mgi"
    # - name: disableEntityManagement # 可选
    #   value: "false"
    # - name: disableDeleteOnRetryLimit # 可选
    #   value: "false"
    # - name: assetsManagementTimeoutSeconds # 可选
    #   value: 5
    # - name: concurrencyMode # 可选
    #   value: "single"
    # - name: concurrencyLimit # 可选
    #   value: "0"

```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为secret。建议使用[secret存储来存储secret]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| accessKey          | Y  | 具有适当权限的AWS账户/角色的ID，用于SNS和SQS（见下文） | `"AKIAIOSFODNN7EXAMPLE"`
| secretKey          | Y  | AWS用户/角色的secret。如果使用`AssumeRole`访问，还需要提供`sessionToken` |`"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`
| region             | Y  | SNS/SQS资产所在或将创建的AWS区域。请参阅[此页面](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/?p=ugi&l=na)以获取有效区域。确保SNS和SQS在该区域可用 | `"us-east-1"`
| consumerID       | N | 消费者ID（消费者标签）将一个或多个消费者组织成一个组。具有相同消费者ID的消费者作为一个虚拟消费者工作；例如，消息仅由组中的一个消费者处理一次。如果未提供`consumerID`，Dapr运行时将其设置为Dapr应用程序ID（`appID`）值。请参阅[pub/sub broker组件文件]({{< ref setup-pubsub.md >}})以了解如何自动生成ConsumerID。 | 可以设置为字符串值（如上例中的`"channel1"`）或字符串格式值（如`"{podName}"`等）。[查看您可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| endpoint          | N  | 组件使用的AWS端点。仅用于本地开发，例如使用[localstack](https://github.com/localstack/localstack)。在生产AWS上运行时不需要`endpoint` | `"http://localhost:4566"`
| sessionToken      | N  | 要使用的AWS会话令牌。仅在使用临时安全凭证时需要会话令牌 | `"TOKEN"`
| messageReceiveLimit | N  | 消息接收的次数，在处理该消息失败后，一旦达到该次数，将导致从队列中删除该消息。如果指定了`sqsDeadLettersQueueName`，`messageReceiveLimit`是消息接收的次数，在处理该消息失败后，一旦达到该次数，将导致将消息移动到SQS死信队列。默认值：`10` | `10`
| sqsDeadLettersQueueName | N  | 此应用程序的死信队列的名称 | `"myapp-dlq"`
| messageVisibilityTimeout | N  | 消息在发送给订阅者后从接收请求中隐藏的时间（以秒为单位）。默认值：`10` | `10`
| messageRetryLimit        | N  | 在处理消息失败后重新发送消息的次数，然后从队列中删除该消息。默认值：`10` | `10`
| messageWaitTimeSeconds   | N  | 调用等待消息到达队列的持续时间（以秒为单位），然后返回。如果有消息可用，调用会比`messageWaitTimeSeconds`更早返回。如果没有消息可用且等待时间到期，调用会成功返回一个空消息列表。默认值：`1` | `1`
| messageMaxNumber         | N  | 一次从队列中接收的最大消息数。默认值：`10`，最大值：`10` | `10`
| fifo | N  | 使用SQS FIFO队列提供消息排序和去重。默认值：`"false"`。有关[SQS FIFO](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html)的更多详细信息 | `"true"`，`"false"`
| fifoMessageGroupID | N | 如果启用了`fifo`，指示Dapr为pubsub部署使用自定义[消息组ID](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/using-messagegroupid-property.html)。这不是强制性的，因为Dapr为每个生产者创建一个自定义消息组ID，从而确保每个Dapr生产者的消息排序。默认值：`""` | `"app1-mgi"`
| disableEntityManagement | N  | 当设置为true时，SNS主题、SQS队列和SQS到SNS的订阅不会自动创建。默认值：`"false"` | `"true"`，`"false"`
| disableDeleteOnRetryLimit | N  | 当设置为true时，在重试并失败`messageRetryLimit`次处理消息后，重置消息可见性超时，以便其他消费者可以尝试处理，而不是从SQS中删除消息（默认行为）。默认值：`"false"` | `"true"`，`"false"`
| assetsManagementTimeoutSeconds | N  | AWS资产管理操作的超时时间（以秒为单位），在超时并取消之前。资产管理操作是对STS、SNS和SQS执行的任何操作，除了实现默认Dapr组件重试行为的消息发布和消费操作。该值可以设置为任何非负浮点数/整数。默认值：`5` | `0.5`，`10`
| concurrencyMode | N  | 当从SQS批量接收消息时，按顺序调用订阅者（一次“单个”消息），或并发调用（“并行”）。默认值：`"parallel"` | `"single"`，`"parallel"`
| concurrencyLimit | N | 定义处理消息的最大并发工作者数量。当concurrencyMode设置为`"single"`时，此值被忽略。要避免限制并发工作者的数量，请将其设置为`0`。默认值：`0` | `100`

### 其他信息

#### 符合AWS规范

Dapr创建的SNS主题和SQS队列名称符合[AWS规范](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-queues.html)。默认情况下，Dapr根据消费者`app-id`创建SQS队列名称，因此Dapr可能会执行名称标准化以符合AWS规范。

#### SNS/SQS组件行为

当pub/sub SNS/SQS组件配置SNS主题时，SQS队列和订阅在组件代表消息生产者（没有订阅者应用程序部署）操作的情况下，与存在订阅者应用程序（没有发布者部署）的情况下表现不同。

由于SNS在没有SQS订阅的情况下的工作方式_仅发布者设置_，SQS队列和订阅表现为依赖于订阅者监听主题消息的“经典”pub/sub系统。没有这些订阅者，消息：

- 无法传递并有效地丢弃
- 不可用于未来的订阅者（当订阅者最终订阅时没有消息重播）

#### SQS FIFO

根据AWS规范，使用SQS FIFO（`fifo`元数据字段设置为`"true"`）提供消息排序和去重，但会导致较低的SQS处理吞吐量，以及其他注意事项。

指定`fifoMessageGroupID`限制FIFO队列的并发消费者数量为1，但保证应用程序的Dapr sidecar发布的消息的全局排序。请参阅[这篇AWS博客文章](https://aws.amazon.com/blogs/compute/solving-complex-ordering-challenges-with-amazon-sqs-fifo-queues/)以更好地理解消息组ID和FIFO队列的主题。

为了避免丢失传递给消费者的消息顺序，SQS组件的FIFO配置要求将`concurrencyMode`元数据字段设置为`"single"`。

#### 默认并行`concurrencyMode`

自v1.8.0以来，组件支持`"parallel"` `concurrencyMode`作为其默认模式。在之前的版本中，组件的默认行为是一次调用订阅者一个消息并等待其响应。

#### SQS死信队列

在使用SQS死信队列配置PubSub组件时，元数据字段`messageReceiveLimit`和`sqsDeadLettersQueueName`必须都设置为一个值。对于`messageReceiveLimit`，值必须大于`0`，而`sqsDeadLettersQueueName`不能是空字符串。

{{% alert title="重要" color="warning" %}}
当在EKS（AWS Kubernetes）节点/Pod上运行Dapr sidecar（`daprd`）时，已经附加了定义访问AWS资源的IAM策略，您**不应**在组件规格的定义中提供AWS访问密钥、秘密密钥和令牌。
{{% /alert %}}

#### SNS/SQS与Dapr的争用

从根本上说，SNS通过为这些主题创建SQS订阅，将来自多个发布者主题的消息聚合到一个SQS队列中。作为订阅者，SNS/SQS pub/sub组件从该唯一的SQS队列中消费消息。

然而，像任何SQS消费者一样，组件无法选择性地检索其特定订阅的SNS主题发布的消息。这可能导致组件接收到没有关联处理程序的主题发布的消息。通常，这发生在：

- **组件初始化：** 如果基础设施订阅在组件订阅处理程序之前准备好，或
- **关闭：** 如果组件处理程序在基础设施订阅之前被移除。

由于此问题影响任何多个SNS主题的SQS消费者，组件无法防止从缺少处理程序的主题中消费消息。当这种情况发生时，组件会记录一个错误，指示这些消息被错误地检索。

在这些情况下，未处理的消息将在每次拉取后以其[接收计数](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html#sqs-receive-count)递减的状态重新出现在SQS中。因此，存在未处理的消息可能超过其`messageReceiveLimit`并丢失的风险。

{{% alert title="重要" color="warning" %}}
在使用SNS/SQS与Dapr时，请考虑潜在的争用场景，并适当地配置`messageReceiveLimit`。强烈建议通过设置`sqsDeadLettersQueueName`来使用SQS死信队列，以防止丢失消息。
{{% /alert %}}

## 创建SNS/SQS实例

{{< tabs "Self-Hosted" "Kubernetes" "AWS" >}}

{{% codetab %}}
对于本地开发，[localstack项目](https://github.com/localstack/localstack)用于集成AWS SNS/SQS。按照[这些说明](https://github.com/localstack/localstack#running)运行localstack。

要从命令行使用Docker本地运行localstack，请应用以下命令：

```shell
docker run --rm -it -p 4566:4566 -p 4571:4571 -e SERVICES="sts,sns,sqs" -e AWS_DEFAULT_REGION="us-east-1" localstack/localstack
```

为了在您的pub/sub绑定中使用localstack，您需要在组件元数据中提供`endpoint`配置。在生产AWS上运行时不需要`endpoint`。

请参阅[认证到AWS]({{< ref authenticating-aws.md >}})以获取有关认证相关属性的信息。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: snssqs-pubsub
spec:
  type: pubsub.aws.snssqs
  version: v1
  metadata:
    - name: accessKey
      value: "anyString"
    - name: secretKey
      value: "anyString"
    - name: endpoint
      value: http://localhost:4566
    # 使用us-east-1或提供给localstack的任何其他区域，由"AWS_DEFAULT_REGION"环境变量定义
    - name: region
      value: us-east-1
```

{{% /codetab %}}

{{% codetab %}}
要在Kubernetes上运行localstack，您可以应用以下配置。然后可以通过DNS名称`http://localstack.default.svc.cluster.local:4566`（假设这是应用于默认命名空间）访问localstack，应将其用作`endpoint`。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: localstack
spec:
  # 使用选择器，我们将公开正在运行的部署
  # 这就是Kubernetes知道给定服务属于部署的方式
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
          # 暴露边缘端点
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
为了在AWS中运行，创建或分配一个具有SNS和SQS服务权限的IAM用户，策略如下：

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

将`AWS账户ID`和`AWS账户secret`插入组件元数据中的`accessKey`和`secretKey`，使用Kubernetes secret和`secretKeyRef`。

或者，假设您希望使用自己的工具（例如Terraform）来配置SNS和SQS资产，同时防止Dapr动态执行此操作。您需要启用`disableEntityManagement`并为使用Dapr的应用程序分配一个IAM角色，策略如下：

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

在上述示例中，您在EKS集群上运行应用程序，并进行动态资产创建（默认Dapr行为）。
{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Dapr组件的基本架构]({{< ref component-schema >}})
- [Pub/Sub构建块概述和操作指南]({{< ref pubsub >}})
- [认证到AWS]({{< ref authenticating-aws.md >}})
- AWS文档：
  - [AWS SQS作为SNS的订阅者](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html)
  - [AWS SNS API参考](https://docs.aws.amazon.com/sns/latest/api/Welcome.html)
  - [AWS SQS API参考](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/Welcome.html)