---
type: docs
title: "Redis 绑定规范"
linkTitle: "Redis"
description: "关于 Redis 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/redis/"
---

## 组件格式

要设置 Redis 绑定，需创建一个类型为 `bindings.redis` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.redis
  version: v1
  metadata:
  - name: redisHost
    value: "<address>:6379"
  - name: redisPassword
    value: "**************"
  - name: useEntraID
    value: "true"
  - name: enableTLS
    value: "<bool>"
```

{{% alert title="警告" color="warning" %}}
上述示例使用了明文字符串作为秘密。建议使用秘密存储，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `redisHost` | Y | 输出 |  Redis 主机地址 | `"localhost:6379"` |
| `redisPassword` | N | 输出 | Redis 密码 | `"password"` |
| `redisUsername` | N | 输出 | Redis 主机的用户名。默认为空。确保您的 Redis 服务器版本为 6 或更高，并已正确创建 ACL 规则。 | `"username"` |
| `useEntraID` | N | 输出 | 实现 Azure Cache for Redis 的 EntraID 支持。启用此功能之前： <ul><li>必须以 `"server:port"` 的形式指定 `redisHost` 名称</li><li>必须启用 TLS</li></ul> 更多信息请参见[创建 Redis 实例 > Azure Cache for Redis]({{< ref "#create-a-redis-instance" >}})部分。 | `"true"`, `"false"` |
| `enableTLS` | N | 输出 |  如果 Redis 实例支持带有公共证书的 TLS，则可以配置启用或禁用 TLS。默认为 `"false"` | `"true"`, `"false"` |
| `clientCert`        | N | 输出        | 客户端证书的内容，用于需要客户端证书的 Redis 实例。必须与 `clientKey` 一起使用，并且 `enableTLS` 必须设置为 true。建议使用秘密存储，如[此处]({{< ref component-secrets.md >}})所述  | `"----BEGIN CERTIFICATE-----\nMIIC..."` |
| `clientKey`        | N | 输出        | 客户端私钥的内容，与 `clientCert` 一起用于身份验证。建议使用秘密存储，如[此处]({{< ref component-secrets.md >}})所述  | `"----BEGIN PRIVATE KEY-----\nMIIE..."` |
| `failover`           | N | 输出         | 启用故障转移配置的属性。需要设置 sentinalMasterName。默认为 `"false"` | `"true"`, `"false"`
| `sentinelMasterName` | N | 输出         | 哨兵主名称。参见 [Redis Sentinel 文档](https://redis.io/docs/reference/sentinel-clients/) | `""`,  `"127.0.0.1:6379"`
| `redeliverInterval`  | N | 输出        | 检查待处理消息以重新传递的间隔。默认为 `"60s"`。`"0"` 禁用重新传递。 | `"30s"`
| `processingTimeout`  | N | 输出        | 消息在尝试重新传递之前必须挂起的时间。默认为 `"15s"`。`"0"` 禁用重新传递。 | `"30s"`
| `redisType`        | N | 输出        | Redis 的类型。有两个有效值，一个是 `"node"` 表示单节点模式，另一个是 `"cluster"` 表示 Redis 集群模式。默认为 `"node"`。 | `"cluster"`
| `redisDB`        | N | 输出        | 连接到 Redis 后选择的数据库。如果 `"redisType"` 是 `"cluster"`，则忽略此选项。默认为 `"0"`。 | `"0"`
| `redisMaxRetries`        | N | 输出        | 在放弃之前重试命令的最大次数。默认情况下不重试失败的命令。  | `"5"`
| `redisMinRetryInterval`        | N | 输出        | 每次重试之间 Redis 命令的最小退避时间。默认为 `"8ms"`；`"-1"` 禁用退避。 | `"8ms"`
| `redisMaxRetryInterval`        | N | 输出        | 每次重试之间 Redis 命令的最大退避时间。默认为 `"512ms"`；`"-1"` 禁用退避。 | `"5s"`
| `dialTimeout`        | N | 输出        | 建立新连接的拨号超时时间。默认为 `"5s"`。  | `"5s"`
| `readTimeout`        | N | 输出        | 套接字读取的超时时间。如果达到，Redis 命令将因超时而失败而不是阻塞。默认为 `"3s"`，`"-1"` 表示无超时。 | `"3s"`
| `writeTimeout`        | N | 输出        | 套接字写入的超时时间。如果达到，Redis 命令将因超时而失败而不是阻塞。默认为 readTimeout。 | `"3s"`
| `poolSize`        | N | 输出        | 最大套接字连接数。默认是每个 CPU 10 个连接，如 runtime.NumCPU 报告。 | `"20"`
| `poolTimeout`        | N | 输出        | 如果所有连接都忙，客户端在返回错误之前等待连接的时间。默认是 readTimeout + 1 秒。 | `"5s"`
| `maxConnAge`        | N | 输出        | 客户端在此连接年龄时退役（关闭）连接。默认是不关闭老化连接。 | `"30m"`
| `minIdleConns`        | N | 输出        | 为了避免创建新连接的性能下降，保持打开的最小空闲连接数。默认为 `"0"`。 | `"2"`
| `idleCheckFrequency`        | N | 输出        | 空闲连接清理器进行空闲检查的频率。默认为 `"1m"`。`"-1"` 禁用空闲连接清理器。 | `"-1"`
| `idleTimeout`        | N | 输出        | 客户端关闭空闲连接的时间。应小于服务器的超时时间。默认为 `"5m"`。`"-1"` 禁用空闲超时检查。 | `"10m"`

## 绑定支持

此组件支持具有以下操作的**输出绑定**：

- `create`
- `get`
- `delete`

### create

您可以使用 `create` 操作在 Redis 中存储记录。这会设置一个键来保存一个值。如果键已经存在，则会覆盖该值。

#### 请求

```json
{
  "operation": "create",
  "metadata": {
    "key": "key1"
  },
  "data": {
    "Hello": "World",
    "Lorem": "Ipsum"
  }
}
```

#### 响应

如果成功，将返回 HTTP 204（无内容）和空响应体。

### get

您可以使用 `get` 操作在 Redis 中获取记录。这会获取之前设置的键。

这需要一个可选参数 `delete`，默认值为 `false`。当设置为 `true` 时，此操作使用 Redis 的 `GETDEL` 操作。例如，它返回之前设置的 `value`，然后删除它。

#### 请求

```json
{
  "operation": "get",
  "metadata": {
    "key": "key1"
  },
  "data": {
  }
}
```

#### 响应

```json
{
  "data": {
    "Hello": "World",
    "Lorem": "Ipsum"
  }
}
```

#### 带删除标志的请求

```json
{
  "operation": "get",
  "metadata": {
    "key": "key1",
    "delete": "true"
  },
  "data": {
  }
}
```

### delete

您可以使用 `delete` 操作在 Redis 中删除记录。无论键是否存在，都会返回成功。

#### 请求

```json
{
  "operation": "delete",
  "metadata": {
    "key": "key1"
  }
}
```

#### 响应

如果成功，将返回 HTTP 204（无内容）和空响应体。

## 创建 Redis 实例

Dapr 可以使用任何 Redis 实例 - 容器化的、在本地开发机器上运行的或托管的云服务，只要 Redis 的版本是 5.0.0 或更高。

*注意：Dapr 不支持 Redis >= 7。建议使用 Redis 6*

{{< tabs "自托管" "Kubernetes" "AWS" "Azure" "GCP" >}}

{{% codetab %}}
Dapr CLI 将自动为您创建和设置一个 Redis Streams 实例。
当您运行 `dapr init` 时，Redis 实例将通过 Docker 安装，并且组件文件将创建在默认目录中。(`$HOME/.dapr/components` 目录 (Mac/Linux) 或 `%USERPROFILE%\.dapr\components` 在 Windows 上)。
{{% /codetab %}}

{{% codetab %}}
您可以使用 [Helm](https://helm.sh/) 在我们的 Kubernetes 集群中快速创建一个 Redis 实例。此方法需要[安装 Helm](https://github.com/helm/helm#install)。

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

4. 接下来，我们将获取我们的 Redis 密码，这在我们使用的操作系统上略有不同：
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
     - 导航到资源的**概览**页面。
     - 复制**主机名**值。
   - 对于您的访问密钥：
     - 导航到**设置** > **访问密钥**。
     - 复制并保存您的密钥。

1. 将您的密钥和主机名添加到 Dapr 可以应用到您集群的 `redis.yaml` 文件中。
   - 如果您正在运行示例，请将主机和密钥添加到提供的 `redis.yaml` 中。
   - 如果您从头开始创建项目，请按照[组件格式部分](#component-format)中指定的创建 `redis.yaml` 文件。

1. 将 `redisHost` 键设置为 `[HOST NAME FROM PREVIOUS STEP]:6379`，并将 `redisPassword` 键设置为您之前保存的密钥。

   **注意：** 在生产级应用程序中，请遵循[秘密管理]({{< ref component-secrets.md >}})说明以安全管理您的秘密。

1. 启用 EntraID 支持：
   - 在您的 Azure Redis 服务器上启用 Entra ID 身份验证。这可能需要几分钟。
   - 将 `useEntraID` 设置为 `"true"` 以实现 Azure Cache for Redis 的 EntraID 支持。

1. 将 `enableTLS` 设置为 `"true"` 以支持 TLS。

> **注意：**`useEntraID` 假设您的 UserPrincipal（通过 AzureCLICredential）或 SystemAssigned 托管身份具有 RedisDataOwner 角色权限。如果使用用户分配的身份，[您需要指定 `azureClientID` 属性]({{< ref "howto-mi.md#set-up-identities-in-your-component" >}})。

{{% /codetab %}}

{{% codetab %}}
[GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)
{{% /codetab %}}

{{< /tabs >}}

{{% alert title="注意" color="primary" %}}
Dapr CLI 在自托管模式下作为 `dapr init` 命令的一部分自动部署本地 redis 实例。
{{% /alert %}}

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
