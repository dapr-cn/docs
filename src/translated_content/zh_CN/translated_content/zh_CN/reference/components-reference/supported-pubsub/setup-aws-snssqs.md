---
type: docs
title: "AWS SNS/SQS"
linkTitle: "AWS SNS/SQS"
description: "关于AWS SNS/SQS pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-aws-snssqs/"
---

## Component format

To set up AWS SNS/SQS pub/sub, create a component of type `pubsub.aws.snssqs`.

By default, the AWS SNS/SQS component:
- Generates the SNS topics
- Provisions the SQS queues
- Configures a subscription of the queues to the topics

{{% alert title="Note" color="primary" %}}
If you only have a publisher and no subscriber, only the SNS topics are created.

However, if you have a subscriber, SNS, SQS, and the dynamic or static subscription thereof are generated.
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
    # - name: consumerID # Optional. If not supplied, runtime will create one.
    #   value: "channel1"
    # - name: endpoint # Optional. 
    #   value: "http://localhost:4566"
    # - name: sessionToken  # Optional (mandatory if using AssignedRole; for example, temporary accessKey and secretKey)
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
    # - name: concurrencyMode # Optional
    #   value: "single"


```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use [a secret store for the secrets]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| Field                          | Required | 详情                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 示例                                           |
| ------------------------------ |:--------:| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| accessKey                      |    是     | ID of the AWS account/role with appropriate permissions to SNS and SQS (see below)                                                                                                                                                                                                                                                                                                                                                                               | `"AKIAIOSFODNN7EXAMPLE"`                     |
| secretKey                      |    是     | AWS用户/角色的密钥。 如果使用`AssumeRole` 访问，还需要提供一个`sessionToken`                                                                                                                                                                                                                                                                                                                                                                                                           | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| region                         |    是     | SNS/SQS 资产所在或创建于其中的 AWS 区域。 有关有效区域，请参考[本页](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/?p=ugi&l=na)。 确保 SNS 和 SQS 在该区域内是可用的。                                                                                                                                                                                                                                                                                                | `"us-east-1"`                                |
| consumerID                     |    否     | Consumer ID (consumer tag) organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer; for example, a message is processed only once by one of the consumers in the group. If the `consumerID` is not provided, the Dapr runtime set it to the Dapr application ID (`appID`) value. See the [pub/sub broker component file]({{< ref setup-pubsub.md >}}) to learn how ConsumerID is automatically generated. | `"channel1"`                                 |
| endpoint                       |    否     | 该组件要使用的AWS端点， 仅用于本地开发。 仅用于本地开发，例如同[localstack](https://github.com/localstack/localstack)一起使用。 The `endpoint` is unnecessary when running against production AWS                                                                                                                                                                                                                                                                                                  | `"http://localhost:4566"`                    |
| sessionToken                   |    否     | 要使用的 AWS 会话令牌。  只有当您使用临时安全凭证时才需要会话令牌。                                                                                                                                                                                                                                                                                                                                                                                                                            | `"TOKEN"`                                    |
| messageReceiveLimit            |    否     | 在处理该消息失败后接收消息的次数，一旦达到次数限制，就会导致从队列中删除该消息。 如果指定`sqsDeadLettersQueueName`，`messageReceiveLimit` 指定在处理该消息失败后接收消息的次数，一旦达到次数限制，会将该消息转移到SQS 死信队列。 默认值：`10`                                                                                                                                                                                                                                                                                                              | `10`                                         |
| sqsDeadLettersQueueName        |    否     | 应用程序的死信队列的名称                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `"myapp-dlq"`                                |
| messageVisibilityTimeout       |    否     | Amount of time in seconds that a message is hidden from receive requests after it is sent to a subscriber. Default: `10`                                                                                                                                                                                                                                                                                                                                         | `10`                                         |
| messageRetryLimit              |    否     | Number of times to resend a message after processing of that message fails before removing that message from the queue. Default: `10`                                                                                                                                                                                                                                                                                                                            | `10`                                         |
| messageWaitTimeSeconds         |    否     | 调用在返回之前等待消息到达队列的持续时间（以秒为单位）。 如果消息可用，则调用会早于 `messageWaitTimeSeconds`返回。 如果没有消息可用并且等待时间到期，则该调用成功返回一个空的消息列表。 Default: `1`                                                                                                                                                                                                                                                                                                                                           | `1`                                          |
| messageMaxNumber               |    否     | 每次从队列中接收消息的最大数量。 Default: `10`, Maximum: `10`                                                                                                                                                                                                                                                                                                                                                                                                                    | `10`                                         |
| fifo                           |    否     | 使用 SQS FIFO 队列提供消息排序和重复数据删除。  默认值为 `"false"`. 参照[SQS FIFO](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html)获取更多详细信息                                                                                                                                                                                                                                                                                                  | `"true"`, `"false"`                          |
| fifoMessageGroupID             |    否     | 如果启用 `fifo` ，则指示 Dapr 使用自定义[Message Group ID](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/using-messagegroupid-property.html)进行 pubsub 部署。 这并不强制因为Dap会为每一个消息生产者创建自定义Message Group ID，以确保每个Dapr消息生产者的消息顺序。 默认值：`""`                                                                                                                                                                                                                | `"app1-mgi"`                                 |
| disableEntityManagement        |    否     | 当设置为 true 时，不会自动创建 SNS 主题、SQS 队列和 SQS 对 SNS 的订阅。 默认值为 `"false"`                                                                                                                                                                                                                                                                                                                                                                                                  | `"true"`, `"false"`                          |
| disableDeleteOnRetryLimit      |    否     | 当设置为true时，在处理消息失败并重试 `messageRetryLimit` 次数后，重置该消息的可见性超时，以便其他消费者可以尝试处理，而不是从SQS中删除该消息（默认如此）。 默认值为 `"false"`                                                                                                                                                                                                                                                                                                                                                       | `"true"`, `"false"`                          |
| assetsManagementTimeoutSeconds |    否     | 以秒为单位，AWS资产管理的操作时间，超时将被取消。 资产管理操作可以是在STS、SNS和SQS上的任何一种操作行为，实现默认Dapr组件重试行为的消息发布和消费操作除外。 取值可以是任何非负的单精度浮点数或者整数（float/integer）。 默认值：`5`                                                                                                                                                                                                                                                                                                                              | `0.5`, `10`                                  |
| concurrencyMode                |    否     | When messages are received in bulk from SQS, call the subscriber sequentially (“single” message at a time), or concurrently (in “parallel”). Default: `"parallel"`                                                                                                                                                                                                                                                                                               | `"single"`, `"parallel"`                     |

### 附加信息

#### Conforming with AWS specifications

Dapr created SNS topic and SQS queue names conform with [AWS specifications](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-queues.html). By default, Dapr creates an SQS queue name based on the consumer `app-id`, therefore Dapr might perform name standardization to meet with AWS specifications.

#### SNS/SQS component behavior

When the pub/sub SNS/SQS component provisions SNS topics, the SQS queues and the subscription behave differently in situations where the component is operating on behalf of a message producer (with no subscriber app deployed), than in situations where a subscriber app is present (with no publisher deployed).

Due to how SNS works without SQS subscription _in publisher only setup_, the SQS queues and the subscription behave as a "classic" pub/sub system that relies on subscribers listening to topic messages. Without those subscribers, messages:

- Cannot be passed onwards and are effectively dropped
- Are not available for future subscribers (no replay of message when the subscriber finally subscribes)

#### SQS FIFO

Using SQS FIFO (`fifo` metadata field set to `"true"`) per AWS specifications provides message ordering and deduplication, but incurs a lower SQS processing throughput, among other caveats.

Specifying `fifoMessageGroupID` limits the number of concurrent consumers of the FIFO queue used to only one but guarantees global ordering of messages published by the app's Dapr sidecars. See [this AWS blog post](https://aws.amazon.com/blogs/compute/solving-complex-ordering-challenges-with-amazon-sqs-fifo-queues/) to better understand the topic of Message Group IDs and FIFO queues.

To avoid losing the order of messages delivered to consumers, the FIFO configuration for the SQS Component requires the `concurrencyMode` metadata field set to `"single"`.

#### Default parallel `concurrencyMode`

Since v1.8.0, the component supports the `"parallel"` `concurrencyMode` as its default mode. In prior versions, the component default behavior was calling the subscriber a single message at a time and waiting for its response.

#### SQS dead-letter Queues

When configuring the PubSub component with SQS dead-letter queues, the metadata fields `messageReceiveLimit` and `sqsDeadLettersQueueName` must both be set to a value. For `messageReceiveLimit`, the value must be greater than `0` and the `sqsDeadLettersQueueName` must not be empty string.

{{% alert title="Important" color="warning" %}}
When running the Dapr sidecar (`daprd`) with your application on EKS (AWS Kubernetes) node/pod already attached to an IAM policy defining access to AWS resources, you **must not** provide AWS access-key, secret-key, and tokens in the definition of the component spec.
{{% /alert %}}


## 创建SNS/SQS实例

{{< tabs "Self-Hosted" "Kubernetes" "AWS" >}}

{{% codetab %}}
For local development, the [localstack project](https://github.com/localstack/localstack) is used to integrate AWS SNS/SQS. Follow [these instructions](https://github.com/localstack/localstack#running) to run localstack.

To run localstack locally from the command line using Docker, apply the following cmd:

```shell
docker run --rm -it -p 4566:4566 -p 4571:4571 -e SERVICES="sts,sns,sqs" -e AWS_DEFAULT_REGION="us-east-1" localstack/localstack
```

In order to use localstack with your pub/sub binding, you need to provide the `endpoint` configuration in the component metadata. The `endpoint` is unnecessary when running against production AWS.

有关身份验证相关属性的信息，请参阅 [向 AWS 进行身份验证]({{< ref authenticating-aws.md >}})。

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
    # Use us-east-1 or any other region if provided to localstack as defined by "AWS_DEFAULT_REGION" envvar
    - name: region
      value: us-east-1
```

{{% /codetab %}}

{{% codetab %}}
To run localstack on Kubernetes, you can apply the configuration below. Localstack is then reachable at the DNS name `http://localstack.default.svc.cluster.local:4566` (assuming this was applied to the default namespace), which should be used as the `endpoint`.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: localstack
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
In order to run in AWS, create or assign an IAM user with permissions to the SNS and SQS services, with a policy like:

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

Plug the `AWS account ID` and `AWS account secret` into the `accessKey` and `secretKey` in the component metadata, using Kubernetes secrets and `secretKeyRef`.

Alternatively, let's say you want to provision the SNS and SQS assets using your own tool of choice (for example, Terraform) while preventing Dapr from doing so dynamically. You need to enable `disableEntityManagement` and assign your Dapr-using application with an IAM Role, with a policy like:

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

In the above example, you are running your applications on an EKS cluster with dynamic assets creation (the default Dapr behavior).
{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Pub/Sub building block overview and how-to guides]({{< ref pubsub >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
- AWS docs:
  - [AWS SQS as subscriber to SNS](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html)
  - [AWS SNS API reference](https://docs.aws.amazon.com/sns/latest/api/Welcome.html)
  - [AWS SQS API reference](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/Welcome.html)
