---
type: docs
title: "Redis"
linkTitle: "Redis"
description: Redis 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-redis/"
---

## 配置

要设置 Redis 状态储存，请创建一个类型为 `state.redis`的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: <HOST>
  - name: redisPassword
    value: <PASSWORD>
  - name: enableTLS
    value: <bool> # Optional. Allowed: true, false.
  - name: failover
    value: <bool> # Optional. Allowed: true, false.
  - name: sentinelMasterName
    value: <string> # Optional
  - name: maxRetries
    value: # Optional
  - name: maxRetryBackoff
    value: # Optional
  - name: ttlInSeconds
    value: <int> # Optional
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}


如果您希望将 Redis 用作 actor 状态，将以下内容追加到 yaml 文件。

```yaml
  - name: actorStateStore
    value: "true"
```

## 元数据字段规范

| 字段                    | 必填 | 详情                                                                                                                                    | 示例                                                              |
| --------------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| redisHost             | Y  | Redis的连接地址                                                                                                                            | `localhost:6379`, `redis-master.default.svc.cluster.local:6379` |
| redisPassword         | Y  | Redis的密码 无默认值 可以用`secretKeyRef`来引用密钥。                                                                                                 | `""`, `"KeFg23!"`                                               |
| redisUsername         | N  | Redis 主机的用户名。 默认为空. 确保您的 redis 服务器版本为 6 或更高版本，并且已正确创建 acl 规则。                                                                         | `""`, `"default"`                                               |
| consumerID            | N  | 消费组 ID                                                                                                                                | `"mygroup"`                                                     |
| enableTLS             | N  | 如果Redis实例支持使用公共证书的TLS，可以配置为启用或禁用。 默认值为 `"false"`                                                                                      | `"true"`, `"false"`                                             |
| maxRetries            | N  | 放弃前的最大重试次数。 默认值为 `3`。                                                                                                                 | `5`, `10`                                                       |
| maxRetryBackoff       | N  | 每次重试之间的最小回退。 默认值为 2</code> 秒 `; <code>"-1"` 禁用回退。                                                                                  | `3000000000`                                                    |
| failover              | N  | 已启用故障转移配置的属性。 需要设置 sentinalMasterName。 redisHost 应该是哨兵主机地址。 请参阅 [Redis Sentinel 文档](https://redis.io/topics/sentinel). 默认值为 `"false"` | `"true"`, `"false"`                                             |
| sentinelMasterName    | N  | 哨兵主名称。 请参阅 [Redis Sentinel 文档](https://redis.io/topics/sentinel)                                                                      | `""`,  `"127.0.0.1:6379"`                                       |
| redeliverInterval     | N  | 检查待处理消息到重发的间隔。 默认为 `"60s"`. `"0"` 禁用重发。                                                                                               | `"30s"`                                                         |
| processingTimeout     | N  | 在尝试重新发送消息之前必须等待的时间。 默认为 `"15s"`。 `"0"` 禁用重发。                                                                                          | `"30s"`                                                         |
| redisType             | N  | Redis 的类型。 有两个有效的值，一个是 `"node"` 用于单节点模式，另一个是 `"cluster"` 用于 redis 集群模式。 默认为 `"node"`。                                                 | `"cluster"`                                                     |
| redisDB               | N  | 连接到 redis 后选择的数据库。 如果 `"redisType"` 是 `"cluster "` 此选项被忽略。 默认值为 `"0"`.                                                                | `"0"`                                                           |
| redisMaxRetries       | N  | `maxRetrie` 的别名。 如果两个值都被设置了，则忽略 `maxRetries`。                                                                                         | `"5"`                                                           |
| redisMinRetryInterval | N  | 每次重试之间 redis 命令的最小回退时间。 默认值为 `"8ms"`;  `"-1"` 禁用回退。                                                                                   | `"8ms"`                                                         |
| redisMaxRetryInterval | N  | `maxRetryBackoff` 的别名。 如果两个值都被设置了，则忽略 `maxRetryBackoff`。                                                                              | `"5s"`                                                          |
| dialTimeout           | N  | 建立新连接的拨号超时。 默认为 `"5s"`。                                                                                                               | `"5s"`                                                          |
| readTimeout           | N  | 套接字读取超时。 如果达到，redis命令将以超时的方式失败，而不是阻塞。 默认为 `"3s"`, `"-1"` 表示没有超时。                                                                      | `"3s"`                                                          |
| writeTimeout          | N  | 套接字写入超时。 如果达到，redis命令将以超时的方式失败，而不是阻塞。 默认值为 readTimeout。                                                                               | `"3s"`                                                          |
| poolSize              | N  | 最大套接字连接数。 默认是每个CPU有10个连接，由 runtime.NumCPU 所述。                                                                                         | `"20"`                                                          |
| poolTimeout           | N  | 如果所有连接都处于繁忙状态，客户端等待连接时间，超时后返回错误。 默认值为 readTimeout + 1 秒。                                                                              | `"5s"`                                                          |
| maxConnAge            | N  | 客户端退出（关闭）连接时的连接期限。 默认值是不关闭过期的连接。                                                                                                      | `"30m"`                                                         |
| minIdleConns          | N  | 保持开放的最小空闲连接数，以避免创建新连接带来的性能下降。 默认值为 `"0"`.                                                                                             | `"2"`                                                           |
| idleCheckFrequency    | N  | 空闲连接后的空闲检查频率。 默认值为 `"1m"`。 `"-1"` 禁用空闲连接回收。                                                                                           | `"-1"`                                                          |
| idleTimeout           | N  | 客户端关闭空闲连接的时间量。 应小于服务器的超时。 默认值为 `"5m"`。 `"-1"` 禁用空闲超时检查。                                                                               | `"10m"`                                                         |
| actorStateStore       | N  | 是否将此状态存储给 Actor 使用。 默认值为 `"false"`                                                                                                    | `"true"`, `"false"`                                             |
| ttlInseconds          | N  | 允许按秒指定默认的生存时间 (TTL)，这将应用到每个状态存储请求，除非通过 [请求元数据]({{< ref "state-store-ttl.md" >}}) 显示指定。                                                | `600`                                                           |

## 安装 Redis

Dapr 可以使用任意的 Redis 实例 - 无论它是运行在本地开发机上的、容器化的还是托管在云上的。

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
当您运行 dapr init `时，Redis 实例会自动创建为 Docker 容器`

{{% /codetab %}}

{{% codetab %}}
我们可以使用 [Helm](https://helm.sh/) 在 Kubernetes 集群中快速创建一个 Redis 实例。 这种方法需要[安装Helm](https://github.com/helm/helm#install)。

1. 安装 Redis 到你的集群： 注意，我们显示地设置了一个镜像标签，以获得大于5的版本，这是Dapr的pub/sub功能的要求。 如果您打算将 Redis 仅用作状态存储（而不是用于发布/订阅），则不必设置映像版本。
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis
    ```

2. 执行`kubectl get pods`来查看现在正在集群中运行的Redis容器。
3. 在 [redis.yaml](#configuration) 文件中为 `redisHost` 添加 `redis-master：6379`。 例如:
    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```
4. 接下来，我们将获取Redis密码，该密码根据我们使用的操作系统而略有不同：
    - **Windows**：执行`kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`，这将创建一个有你的加密后密码的文件。 接下来，执行`certutil -decode encoded.b64 password.txt`，它将把你的redis密码放在一个名为`password.txt`的文本文件中。 复制密码，删除这两个文件。

    - **Linux/MacOS**：执行 `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode`并复制输出的密码。

    将此密码添加为 [redis.yaml](#configuration) 文件中 `redisPassword` 值。 例如:
    ```yaml
        metadata:
        - name: redisPassword
          value: lhDOkwTlp0
    ```
{{% /codetab %}}

{{% codetab %}}
**注意**：此方法需要具有 Azure 订阅。

1. 打开 [此链接](https://ms.portal.azure.com/#create/Microsoft.Cache) 启动 Azure Cache 用于 Redis 创建流程。 如有必要，请登录。
2. 填写必要的信息并 **选中"Unblock port 6379"框**，这将使我们能够在没有SSL的情况下保留状态。
3. 点击“创建”来启动您的 Redis 实例的部署。
4. 创建实例后，您需要获取主机名 （FQDN） 和访问密钥。
   - 为主机名称导航到资源 "概览 "并复制 "主机名称"。
   - 为你的访问密钥导航到 "设置 "下的 "访问密钥 "并复制你的密钥。
5. 最后，我们需要将我们的密钥和主机添加到一个`redis.yaml`文件中，以便Dapr可以应用到我们的集群。 如果正在运行示例，则需要将主机和密钥添加到提供的 `redis.yaml`。 如果要从头开始创建项目，则需要创建一个 `redis.yaml` 文件，如 [配置](#configuration)中指定的那样。 将 `redisHost` 键设置为 `[HOST NAME FROM PREVIOUS STEP]:6379` ， `redisPassword` 是您在步骤 4 中复制的密钥的密钥。 **注意：** 在生产级应用程序中，请按照 [秘钥管理]({{< ref component-secrets.md >}}) 说明安全地管理秘钥。

> **注意：** Dapr 发布/订阅使用 Redis 5.0 引入的 redis Streams</a> ，该功能目前在 Azure 托管 Redis 缓存中不可用。 因此，只能将 Azure 托管 Redis 缓存用于状态持久性。 </p> 
> 
> {{% /codetab %}}</blockquote> 
> 
> {{% codetab %}}
> 
> [AWS Redis](https://aws.amazon.com/redis/) 
> 
> {{% /codetab %}}
> 
> {{% codetab %}}
> 
> [GCP Cloud MemoryStore](https://cloud.google.com/memorystore/) 
> 
> {{% /codetab %}}
> 
> {{< /tabs >}}
> 
> ## 相关链接
> 
> - [Dapr组件的基本格式]({{< ref component-schema >}})
> - 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
> - [状态管理构建块]({{< ref state-management >}})
