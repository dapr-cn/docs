---
type: docs
title: "Redis Streams"
linkTitle: "Redis Streams"
description: "关于Redis Streams pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-redis-pubsub/"
---

## 配置

要设置Redis Streams pubsub，请创建一个类型为`pubsub.redis`的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: redis-pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: "KeFg23!"
  - name: consumerID
    value: "myGroup"
  - name: enableTLS
    value: "false"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                    | 必填 | 详情                                                                                    | 示例                                                              |
| --------------------- |:--:| ------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| redisHost             | Y  | Redis的连接地址. 如果 `"redisType"` 是 `"cluster"` ，它可以是用逗号分隔的多个主机，也可以是单个主机                   | `localhost:6379`, `redis-master.default.svc.cluster.local:6379` |
| redisPassword         | Y  | Redis的密码 无默认值 可以用`secretKeyRef`来引用密钥。                                                 | `""`, `"KeFg23!"`                                               |
| redisUsername         | 否  | Redis 主机的用户名。 默认为空. 确保您的 redis 服务器版本为 6 或更高版本，并且已正确创建 acl 规则。                         | `""`, `"default"`                                               |
| consumerID            | 否  | 消费组 ID                                                                                | `"mygroup"`                                                     |
| enableTLS             | N  | 如果Redis实例支持使用公共证书的TLS，可以配置为启用或禁用。 默认值为 `"false"`                                      | `"true"`, `"false"`                                             |
| redeliverInterval     | N  | 检查待处理消息到重发的间隔。 默认为 `"60s"`. `"0"` 禁用重发。                                               | `"30s"`                                                         |
| processingTimeout     | N  | 在尝试重新发送消息之前必须等待的时间。 默认为 `"15s"`。 `"0"` 禁用重发。                                          | `"30s"`                                                         |
| queueDepth            | N  | 用于处理的消息队列的大小。 默认值为 `"100"`.                                                           | `"1000"`                                                        |
| concurrency           | N  | 正在处理消息的并发工作线程数。 默认值为 `"10"`.                                                          | `"15"`                                                          |
| redisType             | N  | Redis 的类型。 有两个有效的值，一个是 `"node"` 用于单节点模式，另一个是 `"cluster"` 用于 redis 集群模式。 默认为 `"node"`。 | `"cluster"`                                                     |
| redisDB               | N  | 连接到 redis 后选择的数据库。 如果 `"redisType"` 是 `"cluster "` 此选项被忽略。 默认值为 `"0"`.                | `"0"`                                                           |
| redisMaxRetries       | N  | 放弃前重试命令的最大次数。 默认值为不重试失败的命令。                                                           | `"5"`                                                           |
| redisMinRetryInterval | N  | 每次重试之间 redis 命令的最小回退时间。 默认值为 `"8ms"`;  `"-1"` 禁用回退。                                   | `"8ms"`                                                         |
| redisMaxRetryInterval | N  | 每次重试之间 redis 命令的最大回退时间。 默认值为 `"512ms"`;`"-1"` 禁用回退。                                   | `"5s"`                                                          |
| dialTimeout           | N  | 建立新连接的拨号超时。 默认为 `"5s"`。                                                               | `"5s"`                                                          |
| readTimeout           | N  | 套接字读取超时。 如果达到，redis命令将以超时的方式失败，而不是阻塞。 默认为 `"3s"`, `"-1"` 表示没有超时。                      | `"3s"`                                                          |
| writeTimeout          | N  | 套接字写入超时。 如果达到，redis命令将以超时的方式失败，而不是阻塞。 默认值为 readTimeout。                               | `"3s"`                                                          |
| poolSize              | N  | 最大套接字连接数。 默认是每个CPU有10个连接，由 runtime.NumCPU 所述。                                         | `"20"`                                                          |
| poolTimeout           | N  | 如果所有连接都处于繁忙状态，客户端等待连接时间，超时后返回错误。 默认值为 readTimeout + 1 秒。                              | `"5s"`                                                          |
| maxConnAge            | N  | 客户端退出（关闭）连接时的连接期限。 默认值是不关闭过期的连接。                                                      | `"30m"`                                                         |
| minIdleConns          | N  | 保持开放的最小空闲连接数，以避免创建新连接带来的性能下降。 默认值为 `"0"`.                                             | `"2"`                                                           |
| idleCheckFrequency    | N  | 空闲连接后的空闲检查频率。 默认值为 `"1m"`。 `"-1"` 禁用空闲连接回收。                                           | `"-1"`                                                          |
| idleTimeout           | N  | 客户端关闭空闲连接的时间量。 应小于服务器的超时。 默认值为 `"5m"`。 `"-1"` 禁用空闲超时检查。                               | `"10m"`                                                         |
| failover              | N  | 已启用故障转移配置的属性。 需要设置 sentinalMasterName。 默认值为 `"false"`                                 | `"true"`, `"false"`                                             |
| sentinelMasterName    | N  | 哨兵主名称。 See [Redis Sentinel Documentation](https://redis.io/docs/manual/sentinel/)     | `""`,  `"127.0.0.1:6379"`                                       |
| maxLenApprox          | N  | 流中的最大项目数。当达到指定长度时，将自动逐出旧条目，以便流保持恒定大小。 默认为无限制。                                         | `"10000"`                                                       |

## 创建Redis实例

Dapr可以使用任何Redis实例，无论是容器化的，运行在本地开发机器上的，或者是托管的云服务，前提是Redis的版本是5.0.0或更高。

{{< tabs "Self-Hosted" "Kubernetes" "AWS" "GCP" "Azure">}}

{{% codetab %}}
Dapr CLI将自动为你创建和设置一个Redis Streams实例。 当你执行`dapr init`时，Redis实例将通过Docker安装，组件文件将在默认目录下创建。 (默认目录位于`$HOME/.dapr/components` (Mac/Linux) ，`%USERPROFILE%\.dapr\components` (Windows)).
{{% /codetab %}}

{{% codetab %}}
您可以使用 [helm](https://helm.sh/) 在我们的 Kubernetes 集群中快速创建 dapr 实例。 这种方法需要[安装Helm](https://github.com/helm/helm#install)。

1. 安装 Redis 到你的集群：
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis
    ```

2. 执行`kubectl get pods`来查看现在正在集群中运行的Redis容器。
3. 在您的redis.yaml文件中添加`redis-master:6379`作为`redisHost`。 例如:

    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```

4. 接下来，我们会获取到我们的Redis密码，根据我们使用的操作系统不同，密码也会略有不同：
    - **Windows**：执行`kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`，这将创建一个有你的加密后密码的文件。 接下来，执行`certutil -decode encoded.b64 password.txt`，它将把你的redis密码放在一个名为`password.txt`的文本文件中。 复制密码，删除这两个文件。

    - **Linux/MacOS**：执行 `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode`并复制输出的密码。

    将此密码设置为redis.yaml文件的`redisPassword`的值。 例如:

    ```yaml
        - name: redisPassword
          value: "lhDOkwTlp0"
    ```
{{% /codetab %}}

{{% codetab %}}
[AWS Redis](https://aws.amazon.com/redis/)
{{% /codetab %}}

{{% codetab %}}
[GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)
{{% /codetab %}}

{{% codetab %}}
[Azure Redis](https://docs.microsoft.com/azure/azure-cache-for-redis/quickstart-create-redis)
{{% /codetab %}}

{{< /tabs >}}


{{% alert title="Note" color="primary" %}}
作为`dapr init`命令的一部分，Dapr CLI会在自托管模式下自动部署本地redis实例。
{{% /alert %}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})