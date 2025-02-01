---
type: docs
title: "Redis"
linkTitle: "Redis"
description: Redis 配置存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-configuration-store/supported-configuration-stores/setup-redis/"
---

## 组件格式

要设置 Redis 配置存储，请创建一个类型为 `configuration.redis` 的组件。请参阅[本指南]({{< ref "howto-manage-configuration.md#configure-a-dapr-configuration-store" >}})了解如何创建和应用配置存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: configuration.redis
  version: v1
  metadata:
  - name: redisHost
    value: <address>:6379
  - name: redisPassword
    value: **************
  - name: useEntraID
    value: "true"
  - name: enableTLS
    value: <bool>
```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为秘密。建议使用秘密存储来存储秘密，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 说明 | 示例 |
|--------------------|:--------:|---------|---------|
| redisHost | Y | Redis 主机地址 | `"localhost:6379"` |
| redisPassword | N | Redis 密码 | `"password"` |
| redisUsername | N | Redis 主机的用户名。默认为空。确保您的 Redis 服务器版本为 6 或更高，并已正确创建 acl 规则。 | `"username"` |
| enableTLS | N | 如果 Redis 实例支持带有公共证书的 TLS，则可以配置启用或禁用 TLS。默认为 `"false"` | `"true"`, `"false"` |
| clientCert        | N | 客户端证书的内容，用于需要客户端证书的 Redis 实例。必须与 `clientKey` 一起使用，并且 `enableTLS` 必须设置为 true。建议使用秘密存储，如[此处]({{< ref component-secrets.md >}})所述 | `"----BEGIN CERTIFICATE-----\nMIIC..."` |
| clientKey        | N | 客户端私钥的内容，与 `clientCert` 一起用于身份验证。建议使用秘密存储，如[此处]({{< ref component-secrets.md >}})所述 | `"----BEGIN PRIVATE KEY-----\nMIIE..."` |
| failover           | N | 启用故障转移配置的属性。需要设置 sentinelMasterName。默认为 `"false"` | `"true"`, `"false"`
| sentinelMasterName | N | Sentinel 主名称。请参阅 [Redis Sentinel 文档](https://redis.io/docs/reference/sentinel-clients/) | `""`,  `"127.0.0.1:6379"`
| redisType        | N | Redis 的类型。有两个有效值，一个是 `"node"` 表示单节点模式，另一个是 `"cluster"` 表示 Redis 集群模式。默认为 `"node"`。 | `"cluster"`
| redisDB        | N | 连接到 Redis 后选择的数据库。如果 `"redisType"` 是 `"cluster"`，则忽略此选项。默认为 `"0"`。 | `"0"`
| redisMaxRetries        | N | 在放弃之前重试命令的最大次数。默认情况下不重试失败的命令。  | `"5"`
| redisMinRetryInterval        | N | 每次重试之间 Redis 命令的最小回退。默认为 `"8ms"`;  `"-1"` 禁用回退。 | `"8ms"`
| redisMaxRetryInterval        | N | 每次重试之间 Redis 命令的最大回退。默认为 `"512ms"`;`"-1"` 禁用回退。 | `"5s"`
| dialTimeout        | N | 建立新连接的拨号超时。默认为 `"5s"`。  | `"5s"`
| readTimeout        | N | 套接字读取的超时。如果达到，Redis 命令将因超时而失败而不是阻塞。默认为 `"3s"`，`"-1"` 表示无超时。 | `"3s"`
| writeTimeout        | N | 套接字写入的超时。如果达到，Redis 命令将因超时而失败而不是阻塞。默认为 readTimeout。 | `"3s"`
| poolSize        | N | 最大套接字连接数。默认情况下，每个 CPU 的连接数为 10 个，由 runtime.NumCPU 报告。 | `"20"`
| poolTimeout        | N | 如果所有连接都忙，客户端在返回错误之前等待连接的时间。默认值为 readTimeout + 1 秒。 | `"5s"`
| maxConnAge        | N | 客户端退役（关闭）连接的连接年龄。默认情况下不关闭老化连接。 | `"30m"`
| minIdleConns        | N | 保持打开的最小空闲连接数，以避免与创建新连接相关的性能下降。默认为 `"0"`。 | `"2"`
| idleCheckFrequency        | N | 空闲连接清理器进行空闲检查的频率。默认为 `"1m"`。`"-1"` 禁用空闲连接清理器。 | `"-1"`
| idleTimeout        | N | 客户端关闭空闲连接的时间。应小于服务器的超时。默认为 `"5m"`。`"-1"` 禁用空闲超时检查。 | `"10m"`

## 设置 Redis

Dapr 可以使用任何 Redis 实例：无论是容器化的、在本地开发机器上运行的，还是托管的云服务。

{{< tabs "Self-Hosted" "Kubernetes" "AWS" "Azure" "GCP" >}}

{{% codetab %}}
当您运行 `dapr init` 时，会自动创建一个 Redis 实例作为 Docker 容器。
{{% /codetab %}}

{{% codetab %}}
您可以使用 [Helm](https://helm.sh/) 在 Kubernetes 集群中快速创建一个 Redis 实例。此方法需要[安装 Helm](https://github.com/helm/helm#install)。

1. 将 Redis 安装到您的集群中。请注意，我们显式设置了一个镜像标签以获取版本大于 5 的版本，这是 Dapr 的 pubsub 功能所需的。如果您打算仅将 Redis 用作状态存储（而不是用于 pubsub），则无需设置镜像版本。
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis --set image.tag=6.2
    ```

2. 运行 `kubectl get pods` 查看现在在您的集群中运行的 Redis 容器。
3. 在您的 [redis.yaml](#component-format) 文件中将 `redis-master:6379` 添加为 `redisHost`。例如：
    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```
4. 接下来，获取 Redis 密码，这在我们使用的操作系统上略有不同：
    - **Windows**: 运行 `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`，这将创建一个包含您编码密码的文件。接下来，运行 `certutil -decode encoded.b64 password.txt`，这将把您的 redis 密码放入一个名为 `password.txt` 的文本文件中。复制密码并删除这两个文件。

    - **Linux/MacOS**: 运行 `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode` 并复制输出的密码。

    将此密码作为 `redisPassword` 值添加到您的 [redis.yaml](#component-format) 文件中。例如：
    ```yaml
        metadata:
        - name: redisPassword
          value: lhDOkwTlp0
    ```
{{% /codetab %}}

{{% codetab %}}
[AWS Redis](https://aws.amazon.com/redis/)
{{% /codetab %}}

{{% codetab %}}

1. [使用官方 Microsoft 文档创建 Azure Cache for Redis 实例。](https://docs.microsoft.com/azure/azure-cache-for-redis/quickstart-create-redis)

1. 实例创建后，从 Azure 门户获取主机名（FQDN）和访问密钥。
   - 对于主机名：
     - 导航到资源的**概览**页面。
     - 复制**主机名**值。
   - 对于访问密钥：
     - 导航到**设置** > **访问密钥**。
     - 复制并保存您的密钥。

1. 将您的密钥和主机名添加到 Dapr 可以应用于您的集群的 `redis.yaml` 文件中。
   - 如果您正在运行示例，请将主机和密钥添加到提供的 `redis.yaml` 中。
   - 如果您从头开始创建项目，请按照[组件格式部分](#component-format)中指定的创建 `redis.yaml` 文件。

1. 将 `redisHost` 键设置为 `[HOST NAME FROM PREVIOUS STEP]:6379`，并将 `redisPassword` 键设置为您之前保存的密钥。

   **注意：** 在生产级应用程序中，请遵循[秘密管理]({{< ref component-secrets.md >}})说明以安全管理您的秘密。

1. 启用 EntraID 支持：
   - 在您的 Azure Redis 服务器上启用 Entra ID 身份验证。这可能需要几分钟。
   - 设置 `useEntraID` 为 `"true"` 以实现对 Azure Cache for Redis 的 EntraID 支持。

1. 设置 `enableTLS` 为 `"true"` 以支持 TLS。

> **注意：**`useEntraID` 假设您的 UserPrincipal（通过 AzureCLICredential）或 SystemAssigned 托管身份具有 RedisDataOwner 角色权限。如果使用用户分配的身份，[您需要指定 `azureClientID` 属性]({{< ref "howto-mi.md#set-up-identities-in-your-component" >}})。

{{% /codetab %}}

{{% codetab %}}
[GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[如何：从存储中管理配置]({{< ref "howto-manage-configuration" >}})以获取有关如何使用 Redis 作为配置存储的说明。
- [配置构建块]({{< ref configuration-api-overview >}})