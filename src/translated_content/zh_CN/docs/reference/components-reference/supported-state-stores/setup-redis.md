---
type: docs
title: "Redis"
linkTitle: "Redis"
description: Redis 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-redis/"
---

## 组件格式

要配置 Redis 状态存储，需创建一个类型为 `state.redis` 的组件。参见[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})以了解如何创建和应用状态存储配置。

{{% alert title="限制" color="warning" %}}
在使用 Redis 和事务 API 之前，请确保您熟悉 [Redis 关于事务的限制](https://redis.io/docs/interact/transactions/#what-about-rollbacks)。
{{% /alert %}}

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: <HOST>
  - name: redisPassword # 可选。
    value: <PASSWORD>
  - name: useEntraID
    value: <bool> # 可选。允许值：true, false。
  - name: enableTLS
    value: <bool> # 可选。允许值：true, false。
  - name: clientCert
    value: # 可选
  - name: clientKey
    value: # 可选    
  - name: maxRetries
    value: # 可选
  - name: maxRetryBackoff
    value: # 可选
  - name: failover
    value: <bool> # 可选。允许值：true, false。
  - name: sentinelMasterName
    value: <string> # 可选
  - name: redeliverInterval
    value: # 可选
  - name: processingTimeout
    value: # 可选
  - name: redisType
    value: # 可选
  - name: redisDB
    value: # 可选
  - name: redisMaxRetries
    value: # 可选
  - name: redisMinRetryInterval
    value: # 可选
  - name: redisMaxRetryInterval
    value: # 可选
  - name: dialTimeout
    value: # 可选
  - name: readTimeout
    value: # 可选
  - name: writeTimeout
    value: # 可选
  - name: poolSize
    value: # 可选
  - name: poolTimeout
    value: # 可选
  - name: maxConnAge
    value: # 可选
  - name: minIdleConns
    value: # 可选
  - name: idleCheckFrequency
    value: # 可选
  - name: idleTimeout
    value: # 可选
  - name: ttlInSeconds
    value: <int> # 可选
  - name: queryIndexes
    value: <string> # 可选
  # 如果希望将 Redis 用作 actor 的状态存储，请取消注释以下内容（可选）
  #- name: actorStateStore
  #  value: "true"
```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为 secret。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

如果希望将 Redis 用作 actor 存储，请在 yaml 中添加以下内容。

```yaml
  - name: actorStateStore
    value: "true"
```

## 规格元数据字段

| 字段              | 必需 | 详细信息 | 示例 |
|--------------------|:--------:|---------|---------|
| redisHost          | Y        | Redis 主机的连接字符串  | `localhost:6379`, `redis-master.default.svc.cluster.local:6379`
| redisPassword      | N        | Redis 主机的密码。无默认值。可以使用 `secretKeyRef` 来使用 secret 引用  | `""`, `"KeFg23!"`
| redisUsername      | N        | Redis 主机的用户名。默认为空。确保您的 Redis 服务器版本为 6 或更高，并正确创建了 ACL 规则。 | `""`, `"default"`
| useEntraID | N | 实现对 Azure Cache for Redis 的 EntraID 支持。启用此功能之前： <ul><li>必须以 `"server:port"` 的形式指定 `redisHost` 名称</li><li>必须启用 TLS</li></ul> 在[创建 Redis 实例 > Azure Cache for Redis]({{< ref "#setup-redis" >}})下了解有关此设置的更多信息 | `"true"`, `"false"` |
| enableTLS          | N         | 如果 Redis 实例支持带有公共证书的 TLS，可以配置为启用或禁用。默认为 `"false"` | `"true"`, `"false"`
| clientCert         | N         | 客户端证书的内容，用于需要客户端证书的 Redis 实例。必须与 `clientKey` 一起使用，并且 `enableTLS` 必须设置为 true。建议使用 secret 存储，如[此处]({{< ref component-secrets.md >}})所述   | `"----BEGIN CERTIFICATE-----\nMIIC..."` |
| clientKey          | N         | 客户端私钥的内容，与 `clientCert` 一起用于身份验证。建议使用 secret 存储，如[此处]({{< ref component-secrets.md >}})所述 | `"----BEGIN PRIVATE KEY-----\nMIIE..."` |
| maxRetries         | N         | 放弃之前的最大重试次数。默认为 `3` | `5`, `10`
| maxRetryBackoff    | N         | 每次重试之间的最大退避时间。默认为 `2` 秒；`"-1"` 禁用退避。 | `3000000000`
| failover           | N         | 启用故障转移配置的属性。需要设置 sentinelMasterName。redisHost 应为哨兵主机地址。请参阅 [Redis Sentinel 文档](https://redis.io/docs/manual/sentinel/)。默认为 `"false"` | `"true"`, `"false"`
| sentinelMasterName | N         | 哨兵主名称。请参阅 [Redis Sentinel 文档](https://redis.io/docs/manual/sentinel/) | `""`,  `"127.0.0.1:6379"`
| redeliverInterval  | N        | 检查待处理消息以重新传递的间隔。默认为 `"60s"`。`"0"` 禁用重新传递。 | `"30s"`
| processingTimeout  | N        | 消息必须待处理的时间量，然后才尝试重新传递。默认为 `"15s"`。`"0"` 禁用重新传递。 | `"30s"`
| redisType          | N        | Redis 的类型。有两个有效值，一个是 `"node"` 表示单节点模式，另一个是 `"cluster"` 表示 Redis 集群模式。默认为 `"node"`。 | `"cluster"`
| redisDB            | N        | 连接到 Redis 后选择的数据库。如果 `"redisType"` 是 `"cluster"`，则忽略此选项。默认为 `"0"`。 | `"0"`
| redisMaxRetries    | N        | `maxRetries` 的别名。如果同时设置了两个值，则忽略 `maxRetries`。 | `"5"`
| redisMinRetryInterval        | N        | 每次重试之间 Redis 命令的最小退避时间。默认为 `"8ms"`；`"-1"` 禁用退避。 | `"8ms"`
| redisMaxRetryInterval        | N        | `maxRetryBackoff` 的别名。如果同时设置了两个值，则忽略 `maxRetryBackoff`。  | `"5s"`
| dialTimeout        | N        | 建立新连接的拨号超时时间。默认为 `"5s"`。  | `"5s"`
| readTimeout        | N        | 套接字读取的超时时间。如果达到，Redis 命令将因超时而失败，而不是阻塞。默认为 `"3s"`，`"-1"` 表示无超时。 | `"3s"`
| writeTimeout       | N        | 套接字写入的超时时间。如果达到，Redis 命令将因超时而失败，而不是阻塞。默认为 readTimeout。 | `"3s"`
| poolSize           | N        | 最大套接字连接数。默认是每个 CPU 10 个连接，由 runtime.NumCPU 报告。 | `"20"`
| poolTimeout        | N        | 如果所有连接都忙，客户端等待连接的时间量，然后返回错误。默认是 readTimeout + 1 秒。 | `"5s"`
| maxConnAge         | N        | 客户端退休（关闭）连接的连接年龄。默认是不关闭老化连接。 | `"30m"`
| minIdleConns       | N        | 为了避免创建新连接的性能下降，保持打开的最小空闲连接数。默认为 `"0"`。 | `"2"`
| idleCheckFrequency        | N        | 空闲连接清理器进行空闲检查的频率。默认是 `"1m"`。`"-1"` 禁用空闲连接清理器。 | `"-1"`
| idleTimeout        | N        | 客户端关闭空闲连接的时间量。应小于服务器的超时时间。默认是 `"5m"`。`"-1"` 禁用空闲超时检查。 | `"10m"`
| ttlInSeconds       | N         | 允许指定一个默认的生存时间（TTL），以秒为单位，将应用于每个状态存储请求，除非通过[请求元数据]({{< ref "state-store-ttl.md" >}})显式定义 TTL。 | `600`
| queryIndexes       | N         | 用于查询 JSON 对象的索引架构 | 参见 [查询 JSON 对象](#querying-json-objects)
| actorStateStore    | N        | 将此状态存储视为 actor。默认为 `"false"` | `"true"`, `"false"`

## 设置 Redis

Dapr 可以使用任何 Redis 实例：容器化的、在本地开发机器上运行的或托管的云服务。

{{< tabs "Self-Hosted" "Kubernetes" "AWS" "Azure" "GCP" >}}

{{% codetab %}}
当您运行 `dapr init` 时，会自动创建一个 Redis 实例作为 Docker 容器。
{{% /codetab %}}

{{% codetab %}}
您可以使用 [Helm](https://helm.sh/) 在我们的 Kubernetes 集群中快速创建一个 Redis 实例。此方法需要[安装 Helm](https://github.com/helm/helm#install)。

1. 将 Redis 安装到您的集群中。请注意，我们显式设置了一个镜像标签以获取大于 5 的版本，这是 Dapr 的 pub/sub 功能所需的。如果您打算仅将 Redis 用作状态存储（而不是用于 pub/sub），则无需设置镜像版本。
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis
    ```

2. 运行 `kubectl get pods` 查看现在在您的集群中运行的 Redis 容器。
3. 在您的 [redis.yaml](#configuration) 文件中将 `redis-master:6379` 添加为 `redisHost`。例如：
    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```
4. 接下来，获取 Redis 密码，这在我们使用的操作系统上略有不同：
    - **Windows**: 运行 `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`，这将创建一个包含您编码密码的文件。接下来，运行 `certutil -decode encoded.b64 password.txt`，这将把您的 Redis 密码放入一个名为 `password.txt` 的文本文件中。复制密码并删除这两个文件。

    - **Linux/MacOS**: 运行 `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode` 并复制输出的密码。

    将此密码添加为您的 [redis.yaml](#configuration) 文件中的 `redisPassword` 值。例如：
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

1. 创建实例后，从 Azure 门户获取主机名（FQDN）和访问密钥。
   - 对于主机名：
     - 导航到资源的**概览**页面。
     - 复制**主机名**值。
   - 对于访问密钥：
     - 导航到**设置** > **访问密钥**。
     - 复制并保存您的密钥。

1. 将您的密钥和主机名添加到 Dapr 可以应用于您的集群的 `redis.yaml` 文件中。
   - 如果您正在运行示例，请将主机和密钥添加到提供的 `redis.yaml` 中。
   - 如果您从头开始创建项目，请按照[组件格式部分](#component-format)中指定的方式创建 `redis.yaml` 文件。

1. 将 `redisHost` 键设置为 `[HOST NAME FROM PREVIOUS STEP]:6379`，将 `redisPassword` 键设置为您之前保存的密钥。

   **注意：** 在生产级应用程序中，请按照[秘密管理]({{< ref component-secrets.md >}})说明安全管理您的秘密。

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

## 查询 JSON 对象（可选）

除了支持将状态数据存储和查询为键/值对外，Redis 状态存储还可选支持查询 JSON 对象，以满足更复杂的查询或过滤要求。要启用此功能，需要执行以下步骤：

1. Redis 存储必须支持 Redis 模块，特别是 Redisearch 和 RedisJson。如果您正在部署和运行 Redis，请在部署 Redis 服务时加载 [redisearch](https://oss.redis.com/redisearch/) 和 [redisjson](https://oss.redis.com/redisjson/) 模块。
2. 在组件配置的元数据中指定 `queryIndexes` 条目。`queryIndexes` 的值是以下格式的 JSON 数组：
```json
[
  {
    "name": "<索引名称>",
    "indexes": [
      {
        "key": "<文档内选定元素的 JSONPath 类似语法>",
        "type": "<值类型（支持的类型：TEXT, NUMERIC）>",
      },
      ...
    ]
  },
  ...
]
```
3. 调用状态管理 API 时，将以下元数据添加到 API 调用中：
- [保存状态]({{< ref "state_api.md#save-state" >}})、[获取状态]({{< ref "state_api.md#get-state" >}})、[删除状态]({{< ref "state_api.md#delete-state" >}})：
  - 在 HTTP API 请求中添加 `metadata.contentType=application/json` URL 查询参数
  - 在 gRPC API 请求的元数据中添加 `"contentType": "application/json"` 对
- [查询状态]({{< ref "state_api.md#query-state" >}})：
  - 在 HTTP API 请求中添加 `metadata.contentType=application/json&metadata.queryIndexName=<索引名称>` URL 查询参数
  - 在 gRPC API 请求的元数据中添加 `"contentType" : "application/json"` 和 `"queryIndexName" : "<索引名称>"` 对

考虑一个示例，您存储的文档如下：
```json
{
  "key": "1",
  "value": {
    "person": {
      "org": "Dev Ops",
      "id": 1036
    },
    "city": "Seattle",
    "state": "WA"
  }
}
```

包含相应索引架构的组件配置文件如下所示：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  initTimeout: 1m
  metadata:
  - name: redisHost
    value: "localhost:6379"
  - name: redisPassword
    value: ""
  - name: queryIndexes
    value: |
      [
        {
          "name": "orgIndx",
          "indexes": [
            {
              "key": "person.org",
              "type": "TEXT"
            },
            {
              "key": "person.id",
              "type": "NUMERIC"
            },
            {
              "key": "state",
              "type": "TEXT"
            },
            {
              "key": "city",
              "type": "TEXT"
            }
          ]
        }
      ]
```

接下来，您现在可以存储、检索和查询这些文档。

考虑来自["如何：查询状态"]({{< ref "howto-state-query-api.md#example-data-and-query" >}})指南的示例。让我们在 Redis 上运行它。

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" "Redis Enterprise Cloud" "Alibaba Cloud" >}}

{{% codetab %}}
如果您使用的是 Dapr 的自托管部署，则在运行 `dapr init` 时会自动创建一个不带 JSON 模块的 Redis 实例作为 Docker 容器。

或者，您可以通过运行以下命令创建一个 Redis 实例：
 ```bash
 docker run -p 6379:6379 --name redis --rm redis
 ```
 在 dapr init 或通过上述命令创建的 Redis 容器，不能单独用于状态存储查询 API。您可以在不同的端口（与已安装的 Redis 使用的端口不同）上运行 redislabs/rejson docker 镜像以使用查询 API。

> 注意：`redislabs/rejson` 仅支持 amd64 架构。

使用以下命令创建与查询 API 兼容的 Redis 实例。

```bash
docker run -p 9445:9445 --name rejson --rm redislabs/rejson:2.0.6
```
{{% /codetab %}}

{{% codetab %}}
按照[在 Kubernetes 中部署 Redis](#setup-redis)的说明进行操作，并添加一个额外的细节。

安装 Redis Helm 包时，提供一个指定容器镜像并启用所需模块的配置文件：
```bash
helm install redis bitnami/redis --set image.tag=6.2 -f values.yaml
```

其中 `values.yaml` 如下所示：
```yaml
image:
  repository: redislabs/rejson
  tag: 2.0.6

master:
  extraFlags:
   - --loadmodule
   - /usr/lib/redis/modules/rejson.so
   - --loadmodule
   - /usr/lib/redis/modules/redisearch.so
```

{{% /codetab %}}

{{% codetab %}}
{{% alert title="注意" color="warning" %}}
Azure Redis 托管服务不支持 RedisJson 模块，无法用于查询。
{{% /alert %}}

{{% /codetab %}}

{{% codetab %}}
按照[在 AWS 中部署 Redis](#setup-redis)的说明进行操作。
{{% alert title="注意" color="primary" %}}
要支持查询，您需要启用 RediSearch 和 RedisJson。
{{% /alert %}}
{{% /codetab %}}

{{% codetab %}}
{{% alert title="注意" color="warning" %}}
Memory Store 不支持模块，无法用于查询。
{{% /alert %}}
{{% /codetab %}}

{{% codetab %}}
[Redis Enterprise Cloud](https://docs.redis.com/latest/rc/)
{{% /codetab %}}

{{% codetab %}}
<!-- IGNORE_LINKS -->
[阿里云](https://www.alibabacloud.com/product/apsaradb-for-redis)
<!-- END_IGNORE -->
{{% /codetab %}}

{{< /tabs >}}

接下来是启动一个 Dapr 应用程序。请参考此[组件配置文件](../../../../developing-applications/building-blocks/state-management/query-api-examples/components/redis/redis.yml)，其中包含查询索引架构。确保修改 `redisHost` 以反映 `redislabs/rejson` 使用的本地转发端口。
```bash
dapr run --app-id demo --dapr-http-port 3500 --resources-path query-api-examples/components/redis
```

现在用员工数据集填充状态存储，以便您可以稍后查询它。
```bash
curl -X POST -H "Content-Type: application/json" -d @query-api-examples/dataset.json \
  http://localhost:3500/v1.0/state/querystatestore?metadata.contentType=application/json
```

为了确保数据已正确存储，您可以检索特定对象
```bash
curl http://localhost:3500/v1.0/state/querystatestore/1?metadata.contentType=application/json
```

结果将是：
```json
{
  "city": "Seattle",
  "state": "WA",
  "person": {
    "org": "Dev Ops",
    "id": 1036
  }
}
```

现在，让我们找到所有在加利福尼亚州的员工，并按其员工 ID 降序排序。

这是[查询](../../../../developing-applications/building-blocks/state-management/query-api-examples/query1.json)：
```json
{
    "filter": {
        "EQ": { "state": "CA" }
    },
    "sort": [
        {
            "key": "person.id",
            "order": "DESC"
        }
    ]
}
```

使用以下命令执行查询：
```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query1.json \
  'http://localhost:3500/v1.0-alpha1/state/querystatestore/query?metadata.contentType=application/json&metadata.queryIndexName=orgIndx'
```

结果将是：
```json
{
  "results": [
    {
      "key": "3",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1071
        },
        "city": "Sacramento",
        "state": "CA"
      },
      "etag": "1"
    },
    {
      "key": "7",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1015
        },
        "city": "San Francisco",
        "state": "CA"
      },
      "etag": "1"
    },
    {
      "key": "5",
      "data": {
        "person": {
          "org": "Hardware",
          "id": 1007
        },
        "city": "Los Angeles",
        "state": "CA"
      },
      "etag": "1"
    },
    {
      "key": "9",
      "data": {
        "person": {
          "org": "Finance",
          "id": 1002
        },
        "city": "San Diego",
        "state": "CA"
      },
      "etag": "1"
    }
  ]
}
```

查询语法和文档可在[此处]({{< ref howto-state-query-api.md >}})找到。

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取有关配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
