---
type: docs
title: "Redis Streams"
linkTitle: "Redis Streams"
description: "关于 Redis Streams pubsub 组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-redis-pubsub/"
---

## 组件格式

要设置 Redis Streams pub/sub，创建一个类型为 `pubsub.redis` 的组件。请参阅 [pub/sub broker 组件文件]({{< ref setup-pubsub.md >}}) 了解 ConsumerID 是如何自动生成的。阅读 [操作指南：发布和订阅指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) 了解如何创建和应用 pub/sub 配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: redis-pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: "KeFg23!"
  - name: consumerID
    value: "channel1"
  - name: useEntraID
    value: "true"
  - name: enableTLS
    value: "false"
```

{{% alert title="警告" color="warning" %}}
上述示例使用了明文字符串作为密钥。建议使用密钥存储来保护密钥，具体方法请参阅 [此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| redisHost          | Y        | Redis 主机的连接字符串。如果 `"redisType"` 是 `"cluster"`，可以是多个主机用逗号分隔，或仅一个主机 | `localhost:6379`, `redis-master.default.svc.cluster.local:6379`
| redisPassword      | N        | Redis 主机的密码。无默认值。可以是 `secretKeyRef` 以使用密钥引用 | `""`, `"KeFg23!"`
| redisUsername      | N        | Redis 主机的用户名。默认为空。确保您的 Redis 服务器版本为 6 或更高，并正确创建了 ACL 规则。 | `""`, `"default"`
| consumerID         | N        | 消费者组 ID。 | 可以设置为字符串值（如上例中的 `"channel1"`）或字符串格式值（如 `"{podName}"` 等）。[查看您可以在组件元数据中使用的所有模板标签。]({{< ref "component-schema.md#templated-metadata-values" >}})
| useEntraID | N | 实现对 Azure Cache for Redis 的 EntraID 支持。启用此功能之前：<ul><li>必须以 `"server:port"` 的形式指定 `redisHost` 名称</li><li>必须启用 TLS</li></ul> 了解更多关于此设置的信息，请参阅 [创建 Redis 实例 > Azure Cache for Redis]({{< ref "#setup-redis" >}}) | `"true"`, `"false"` |
| enableTLS          | N        | 如果 Redis 实例支持带有公共证书的 TLS，可以配置为启用或禁用。默认为 `"false"` | `"true"`, `"false"` |
| clientCert        | N        | 客户端证书的内容，用于需要客户端证书的 Redis 实例。必须与 `clientKey` 一起使用，并且 `enableTLS` 必须设置为 true。建议使用密钥存储，如 [此处]({{< ref component-secrets.md >}}) 所述 | `"----BEGIN CERTIFICATE-----\nMIIC..."` |
| clientKey        | N        | 客户端私钥的内容，与 `clientCert` 一起用于身份验证。建议使用密钥存储，如 [此处]({{< ref component-secrets.md >}}) 所述 | `"----BEGIN PRIVATE KEY-----\nMIIE..."` |
| redeliverInterval  | N        | 检查待处理消息以重新传递的间隔。可以使用 Go duration 字符串（例如 "ms", "s", "m"）或毫秒数。默认为 `"60s"`。`"0"` 禁用重新传递。 | `"30s"`, `"5000"`
| processingTimeout  | N        | 消息在尝试重新传递之前必须挂起的时间量。可以使用 Go duration 字符串（例如 "ms", "s", "m"）或毫秒数。默认为 `"15s"`。`"0"` 禁用重新传递。 | `"60s"`, `"600000"`
| queueDepth         | N        | 处理消息的队列大小。默认为 `"100"`。 | `"1000"`
| concurrency        | N        | 处理消息的并发工作者数量。默认为 `"10"`。 | `"15"`
| redisType        | N        | Redis 的类型。有两个有效值，一个是 `"node"` 表示单节点模式，另一个是 `"cluster"` 表示 Redis 集群模式。默认为 `"node"`。 | `"cluster"`
| redisDB        | N        | 连接到 Redis 后选择的数据库。如果 `"redisType"` 是 `"cluster"`，此选项将被忽略。默认为 `"0"`。 | `"0"`
| redisMaxRetries        | N        | 在放弃之前重试命令的最大次数。默认情况下不重试失败的命令。 | `"5"`
| redisMinRetryInterval        | N        | 每次重试之间 Redis 命令的最小回退时间。默认为 `"8ms"`；`"-1"` 禁用回退。 | `"8ms"`
| redisMaxRetryInterval        | N        | 每次重试之间 Redis 命令的最大回退时间。默认为 `"512ms"`；`"-1"` 禁用回退。 | `"5s"`
| dialTimeout        | N        | 建立新连接的拨号超时时间。默认为 `"5s"`。 | `"5s"`
| readTimeout        | N        | 套接字读取的超时时间。如果达到，Redis 命令将因超时而失败而不是阻塞。默认为 `"3s"`，`"-1"` 表示无超时。 | `"3s"`
| writeTimeout        | N        | 套接字写入的超时时间。如果达到，Redis 命令将因超时而失败而不是阻塞。默认值为 readTimeout。 | `"3s"`
| poolSize        | N        | 最大套接字连接数。默认是每个 CPU 10 个连接，由 runtime.NumCPU 报告。 | `"20"`
| poolTimeout        | N        | 如果所有连接都忙，客户端等待连接的时间量，然后返回错误。默认是 readTimeout + 1 秒。 | `"5s"`
| maxConnAge        | N        | 客户端退役（关闭）连接的连接年龄。默认是不关闭老化连接。 | `"30m"`
| minIdleConns        | N        | 为了避免创建新连接的性能下降，保持打开的最小空闲连接数。默认为 `"0"`。 | `"2"`
| idleCheckFrequency        | N        | 空闲连接清理器进行空闲检查的频率。默认为 `"1m"`。`"-1"` 禁用空闲连接清理器。 | `"-1"`
| idleTimeout        | N        | 客户端关闭空闲连接的时间量。应小于服务器的超时时间。默认为 `"5m"`。`"-1"` 禁用空闲超时检查。 | `"10m"`
| failover           | N         | 启用故障转移配置的属性。需要设置 sentinalMasterName。默认为 `"false"` | `"true"`, `"false"`
| sentinelMasterName | N         | Sentinel 主名称。参见 [Redis Sentinel 文档](https://redis.io/docs/manual/sentinel/) | `""`,  `"127.0.0.1:6379"`
| maxLenApprox        | N        | 流内的最大项目数。当达到指定长度时，旧条目会自动被驱逐，以便流保持恒定大小。默认为无限制。 | `"10000"`

## 创建 Redis 实例

Dapr 可以使用任何 Redis 实例 - 无论是容器化的、在本地开发机器上运行的，还是托管的云服务，只要 Redis 的版本是 5.x 或 6.x。

{{< tabs "Self-Hosted" "Kubernetes" "AWS" "Azure" "GCP" >}}

{{% codetab %}}
Dapr CLI 会自动为您创建并设置一个 Redis Streams 实例。
当您运行 `dapr init` 时，Redis 实例将通过 Docker 安装，并且组件文件将创建在默认目录中。(`$HOME/.dapr/components` 目录 (Mac/Linux) 或 `%USERPROFILE%\.dapr\components` 在 Windows 上)。
{{% /codetab %}}

{{% codetab %}}
您可以使用 [Helm](https://helm.sh/) 快速在 Kubernetes 集群中创建一个 Redis 实例。此方法需要 [安装 Helm](https://github.com/helm/helm#install)。

1. 将 Redis 安装到您的集群中。
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis --set image.tag=6.2
    ```

2. 运行 `kubectl get pods` 查看现在在您的集群中运行的 Redis 容器。
3. 在您的 redis.yaml 文件中将 `redis-master:6379` 添加为 `redisHost`。例如：

    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```

4. 接下来，我们将获取我们的 Redis 密码，这在不同操作系统上略有不同：
    - **Windows**: 运行 `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`，这将创建一个包含您编码密码的文件。接下来，运行 `certutil -decode encoded.b64 password.txt`，这将把您的 Redis 密码放入一个名为 `password.txt` 的文本文件中。复制密码并删除这两个文件。

    - **Linux/MacOS**: 运行 `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode` 并复制输出的密码。

    将此密码作为 `redisPassword` 值添加到您的 redis.yaml 文件中。例如：

    ```yaml
        - name: redisPassword
          value: "lhDOkwTlp0"
    ```
{{% /codetab %}}

{{% codetab %}}
[AWS Redis](https://aws.amazon.com/redis/)
{{% /codetab %}}

{{% codetab %}}
1. [使用官方 Microsoft 文档创建 Azure Cache for Redis 实例。](https://docs.microsoft.com/azure/azure-cache-for-redis/quickstart-create-redis)

1. 一旦您的实例创建完成，从 Azure 门户获取主机名（FQDN）和您的访问密钥。
   - 对于主机名：
     - 导航到资源的 **概览** 页面。
     - 复制 **主机名** 值。
   - 对于您的访问密钥：
     - 导航到 **设置** > **访问密钥**。
     - 复制并保存您的密钥。

1. 将您的密钥和主机名添加到 Dapr 可以应用到您集群的 `redis.yaml` 文件中。
   - 如果您正在运行一个示例，将主机和密钥添加到提供的 `redis.yaml` 中。
   - 如果您从头开始创建项目，请按照 [组件格式部分](#component-format) 中的说明创建一个 `redis.yaml` 文件。

1. 将 `redisHost` 键设置为 `[上一步中的主机名]:6379`，并将 `redisPassword` 键设置为您之前保存的密钥。

   **注意：** 在生产级应用程序中，请按照 [密钥管理]({{< ref component-secrets.md >}}) 指南安全地管理您的密钥。

1. 启用 EntraID 支持：
   - 在您的 Azure Redis 服务器上启用 Entra ID 身份验证。这可能需要几分钟。
   - 将 `useEntraID` 设置为 `"true"` 以实现对 Azure Cache for Redis 的 EntraID 支持。

1. 将 `enableTLS` 设置为 `"true"` 以支持 TLS。

> **注意：**`useEntraID` 假设您的 UserPrincipal（通过 AzureCLICredential）或 SystemAssigned 托管身份具有 RedisDataOwner 角色权限。如果使用用户分配的身份，[您需要指定 `azureClientID` 属性]({{< ref "howto-mi.md#set-up-identities-in-your-component" >}})。

{{% /codetab %}}

{{% codetab %}}
[GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)
{{% /codetab %}}

{{< /tabs >}}

{{% alert title="注意" color="primary" %}}
Dapr CLI 在 selfhost 模式下作为 `dapr init` 命令的一部分自动部署本地 redis 实例。
{{% /alert %}}

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) 以获取配置 pub/sub 组件的说明
- [Pub/Sub 构建块]({{< ref pubsub >}})
