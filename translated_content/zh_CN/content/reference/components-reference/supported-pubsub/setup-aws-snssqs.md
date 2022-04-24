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

| 字段                             | 必填 | 详情                                                                                                                                                                                                                                                                                                                                                                                                       | 示例                                           |
| ------------------------------ |:--:| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| accessKey                      | Y  | ID of the AWS account/role with appropriate permissions to SNS and SQS (see below)                                                                                                                                                                                                                                                                                                                       | `"AKIAIOSFODNN7EXAMPLE"`                     |
| secretKey                      | Y  | Secret for the AWS user/role. If using an `AssumeRole` access, you will also need to provide a `sessionToken`                                                                                                                                                                                                                                                                                            | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| region                         | Y  | The AWS region where the SNS/SQS assets are located or be created in. See [this page](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/?p=ugi&l=na) for valid regions. Ensure that SNS and SQS are available in that region                                                                                                                                              | `"us-east-1"`                                |
| 终结点                            | 否  | 该组件要使用的AWS端点， 仅用于本地开发。 Only used for local development with, for example, [localstack](https://github.com/localstack/localstack). 当对生产环境的AWS，`endpoint`是不需要的。                                                                                                                                                                                                                                            | `"http://localhost:4566"`                    |
| sessionToken                   | N  | 要使用的 AWS 会话令牌。  只有当您使用临时安全凭证时才需要会话令牌。                                                                                                                                                                                                                                                                                                                                                                    | `"TOKEN"`                                    |
| messageReceiveLimit            | N  | Number of times a message is received, after processing of that message fails, that once reached, results in removing of that message from the queue. If `sqsDeadLettersQueueName` is specified, `messageReceiveLimit` is the number of times a message is received, after processing of that message fails, that once reached, results in moving of the message to the SQS dead-letters queue. 默认值：`10` | `10`                                         |
| sqsDeadLettersQueueName        | N  | Name of the dead letters queue for this application                                                                                                                                                                                                                                                                                                                                                      | `"myapp-dlq"`                                |
| messageVisibilityTimeout       | N  | 消息发送至订阅者后，隐藏接收请求的时间，以秒为单位。 默认值：`10`                                                                                                                                                                                                                                                                                                                                                                      | `10`                                         |
| messageRetryLimit              | N  | 在处理消息失败后，从队列中删除该消息之前，重新发送消息的次数。 默认值：`10`                                                                                                                                                                                                                                                                                                                                                                 | `10`                                         |
| messageWaitTimeSeconds         | N  | The duration (in seconds) for which the call waits for a message to arrive in the queue before returning. If a message is available, the call returns sooner than `messageWaitTimeSeconds`. If no messages are available and the wait time expires, the call returns successfully with an empty list of messages. 默认值：`1`                                                                                | `1`                                          |
| messageMaxNumber               | N  | Maximum number of messages to receive from the queue at a time. 默认值：`10`，最大值：`10`                                                                                                                                                                                                                                                                                                                        | `10`                                         |
| fifo                           | N  | Use SQS FIFO queue to provide message ordering and deduplication.  Default: `"false"`. See further details about [SQS FIFO](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html)                                                                                                                                                                                 | `"true"`, `"false"`                          |
| fifoMessageGroupID             | N  | If `fifo` is enabled, instructs Dapr to use a custom [Message Group ID](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/using-messagegroupid-property.html) for the pubsub deployment. This is not mandatory as Dapr creates a custom Message Group ID for each producer, thus ensuring ordering of messages per a Dapr producer. Default: `""`                               | `"app1-mgi"`                                 |
| disableEntityManagement        | 否  | When set to true, SNS topics, SQS queues and the SQS subscriptions to SNS do not get created automatically. 默认值为 `"false"`                                                                                                                                                                                                                                                                               | `"true"`, `"false"`                          |
| disableDeleteOnRetryLimit      | 否  | When set to true, after retrying and failing of `messageRetryLimit` times processing a message, reset the message visibility timeout so that other consumers can try processing, instead of deleting the message from SQS (the default behvior). 默认值为 `"false"`                                                                                                                                          | `"true"`, `"false"`                          |
| assetsManagementTimeoutSeconds | 否  | Amount of time in seconds, for an AWS asset management operation, before it times out and cancelled. Asset management operations are any operations performed on STS, SNS and SQS, except message publish and consume operations that implement the default Dapr component retry behavior. The value can be set to any non-negative float/integer. Default: `5`                                          | `0.5`, `10`                                  |


* Dapr created SNS topic and SQS queue names conform with [AWS specifications](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-queues.html). By default, Dapr creates an SQS queue name based on the consumer `app-id`, therefore Dapr might perform name standardization to meet with AWS specifications.
* Using SQS FIFO (`fifo` metadata field set to `"true"`), per AWS specifications, provides message ordering and deduplication, but incurs a lower SQS processing throughput, among other caveats
* Be aware that specifying `fifoMessageGroupID` limits the number of concurrent consumers of the FIFO queue used to only one but guarantees global ordering of messages published by the app's Dapr sidecars. See [this](https://aws.amazon.com/blogs/compute/solving-complex-ordering-challenges-with-amazon-sqs-fifo-queues/) post to better understand the topic of Message Group IDs and FIFO queues.



## 创建SNS/SQS实例

{{< tabs "Self-Hosted" "Kubernetes" "AWS" >}}

{{% codetab %}}
对于本地开发来说，可以用[localstack项目](https://github.com/localstack/localstack)集成AWS SNS/SQS。 Follow the instructions [here](https://github.com/localstack/localstack#running) to run localstack.

To run localstack locally from the command line using Docker, apply the following cmd:
```shell
docker run --rm -it -p 4566:4566 -p 4571:4571 -e SERVICES="sts,sns,sqs" -e AWS_DEFAULT_REGION="us-east-1" localstack/localstack
```


In order to use localstack with your pubsub binding, you need to provide the `endpoint` configuration in the component metadata. 当在AWS生产环境上运行时，`endpoint`是不需要的。

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
In order to run in AWS, you should create or assign an IAM user with permissions to the SNS and SQS services having a Policy such as:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "YOUR_POLICY_NAME",
      "Effect": "Allow",
      "Action": [
        "sqs:CreateQueue",
        "sqs:DeleteMessage",
        "sqs:ReceiveMessage",
        "sqs:ChangeMessageVisibility",
        "sqs:GetQueueUrl",
        "sqs:GetQueueAttributes",
        "sqs:SetQueueAttributes",
        "sns:CreateTopic",
        "sns:ListSubscriptionsByTopic",
        "sns:Publish",
        "sns:Subscribe",
        "sns:ListSubscriptionsByTopic",
        "sns:GetTopicAttributes"

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


Alternatively, if you want to provision the SNS and SQS assets using your own tool of choice (e.g. Terraform), while preventing Dapr from doing so dynamically, you need to enable `disableEntityManagement` and assign your Dapr-using application with an IAM Role having a Policy such as:

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

If you are running your applications on an EKS cluster with dynamic assets creation (the default Dapr behavior)
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
