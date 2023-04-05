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
  - name: queryIndexes
    value: <string> # Optional
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}


如果您想要使用 RethinkDB 作为 Actor 存储，请在 yaml 上附上以下内容。

```yaml
  - name: actorStateStore
    value: "true"
```

## 元数据字段规范

| 字段                    | 必填 | 详情                                                                                                                                          | 示例                                                              |
| --------------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| redisHost             | 是  | Redis的连接地址                                                                                                                                  | `localhost:6379`, `redis-master.default.svc.cluster.local:6379` |
| redisPassword         | 是  | Redis的密码 无默认值 可以用`secretKeyRef`来引用密钥。                                                                                                       | `""`, `"KeFg23!"`                                               |
| redisUsername         | 否  | Redis 主机的用户名。 默认为空. 确保您的 redis 服务器版本为 6 或更高版本，并且已正确创建 acl 规则。                                                                               | `""`, `"default"`                                               |
| consumerID            | 否  | 消费组 ID                                                                                                                                      | `"mygroup"`                                                     |
| enableTLS             | 否  | 如果Redis实例支持使用公共证书的TLS，可以配置为启用或禁用。 默认值为 `"false"`                                                                                            | `"true"`, `"false"`                                             |
| maxRetries            | 否  | 放弃前的最大重试次数。 默认值为 `3`。                                                                                                                       | `5`, `10`                                                       |
| maxRetryBackoff       | 否  | 每次重试之间的最小回退。 默认值为 2</code> 秒 `; <code>"-1"` 禁用回退。                                                                                        | `3000000000`                                                    |
| failover              | 否  | 已启用故障转移配置的属性。 需要设置 sentinalMasterName。 redisHost 应该是哨兵主机地址。 请参阅 [Redis Sentinel 文档](https://redis.io/docs/manual/sentinel/). 默认值为 `"false"` | `"true"`, `"false"`                                             |
| sentinelMasterName    | 否  | 哨兵主名称。 请参阅 [Redis Sentinel 文档](https://redis.io/docs/manual/sentinel/)                                                                      | `""`,  `"127.0.0.1:6379"`                                       |
| redeliverInterval     | 否  | 检查待处理消息到重发的间隔。 默认为 `"60s"`. `"0"` 禁用重发。                                                                                                     | `"30s"`                                                         |
| processingTimeout     | 否  | 在尝试重新发送消息之前必须等待的时间。 默认为 `"15s"`。 `"0"` 禁用重发。                                                                                                | `"30s"`                                                         |
| redisType             | 否  | Redis 的类型。 有两个有效的值，一个是 `"node"` 用于单节点模式，另一个是 `"cluster"` 用于 redis 集群模式。 默认为 `"node"`。                                                       | `"cluster"`                                                     |
| redisDB               | 否  | 连接到 redis 后选择的数据库。 如果 `"redisType"` 是 `"cluster "` 此选项被忽略。 默认值为 `"0"`.                                                                      | `"0"`                                                           |
| redisMaxRetries       | 否  | `maxRetrie` 的别名。 如果两个值都被设置了，则忽略 `maxRetries`。                                                                                               | `"5"`                                                           |
| redisMinRetryInterval | 否  | 每次重试之间 redis 命令的最小回退时间。 默认值为 `"8ms"`;  `"-1"` 禁用回退。                                                                                         | `"8ms"`                                                         |
| redisMaxRetryInterval | 否  | `maxRetryBackoff` 的别名。 如果两个值都被设置了，则忽略 `maxRetryBackoff`。                                                                                    | `"5s"`                                                          |
| dialTimeout           | 否  | 建立新连接的拨号超时。 默认为 `"5s"`。                                                                                                                     | `"5s"`                                                          |
| readTimeout           | 否  | 套接字读取超时。 如果达到，redis命令将以超时的方式失败，而不是阻塞。 默认为 `"3s"`, `"-1"` 表示没有超时。                                                                            | `"3s"`                                                          |
| writeTimeout          | 否  | 套接字写入超时。 如果达到，redis命令将以超时的方式失败，而不是阻塞。 默认值为 readTimeout。                                                                                     | `"3s"`                                                          |
| poolSize              | 否  | 最大套接字连接数。 默认是每个CPU有10个连接，由 runtime.NumCPU 所述。                                                                                               | `"20"`                                                          |
| poolTimeout           | 否  | 如果所有连接都处于繁忙状态，客户端等待连接时间，超时后返回错误。 默认值为 readTimeout + 1 秒。                                                                                    | `"5s"`                                                          |
| maxConnAge            | 否  | 客户端退出（关闭）连接时的连接期限。 默认值是不关闭过期的连接。                                                                                                            | `"30m"`                                                         |
| minIdleConns          | 否  | 保持开放的最小空闲连接数，以避免创建新连接带来的性能下降。 默认值为 `"0"`.                                                                                                   | `"2"`                                                           |
| idleCheckFrequency    | 否  | 空闲连接后的空闲检查频率。 默认值为 `"1m"`。 `"-1"` 禁用空闲连接回收。                                                                                                 | `"-1"`                                                          |
| idleTimeout           | 否  | 客户端关闭空闲连接的时间量。 应小于服务器的超时。 默认值为 `"5m"`。 `"-1"` 禁用空闲超时检查。                                                                                     | `"10m"`                                                         |
| actorStateStore       | 否  | 是否将此状态存储给 Actor 使用。 默认值为 `"false"`                                                                                                          | `"true"`, `"false"`                                             |
| ttlInseconds          | 否  | 允许按秒指定默认的生存时间 (TTL)，这将应用到每个状态存储请求，除非通过 [请求元数据]({{< ref "state-store-ttl.md" >}}) 显示指定。                                                      | `600`                                                           |
| queryIndexes          | 否  | 用于查询 JSON 对象的索引格式                                                                                                                           | 请参阅 [查询 JSON 对象](#querying-json-objects)                        |

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
> ## 查询 JSON 对象（可选）
> 
> 除了支持以键/值对的形式存储和查询状态数据外，Redis 状态存储还可以选择支持查询 JSON 对象以满足更复杂的查询或过滤要求。 要启用此功能，需要执行以下步骤：
> 
> 1. Redis 存储必须支持 Redis 模块，特别是 Redisearch 和 RedisJson。 如果您正在部署和运行 Redis，则在部署 Redis 服务时加载 [个 redisearch](https://oss.redis.com/redisearch/) 和 [redisjson](https://oss.redis.com/redisjson/) 模块。 ``
> 
> 2. 在组件配置的元数据中指定 `queryIndexes` 条目。 `queryIndexes` 的值是如下格式的JSON数组：
> 
> ```json
> [
>   {
>     "name": "<indexing name>",
>     "indexes": [
>       {
>         "key": "<JSONPath-like syntax for selected element inside documents>",
>         "type": "<value type (supported types: TEXT, NUMERIC)>",
>       },
>       ...
>     ]
>   },
>   ...
> ]
> ```
> 
> 3. 调用状态管理 API 时，将以下元数据添加到 API 调用中：
> 
> - [保存状态]({{< ref "state_api.md#save-state" >}}), [获取状态]({{< ref "state_api.md#get-state" >}}), [删除状态]({{< ref "state_api.md#delete-state" >}}): 
>     - 将 `metadata.contentType=application/json` URL 请求参数添加到 HTTP API 请求
>     - 将 `"contentType": "application/json"` 添加到 gRPC API 请求的元数据中
> - [查询状态]({{< ref "state_api.md#query-state" >}})： 
>     - 将 `metadata.contentType=application/json&metadata.queryIndexName=<indexing name>` URL 请求参数添加到 HTTP API 请求
>     - 将`"contentType" : "application/json"`和`"queryIndexName" : "<indexing name>"`对添加到gRPC API请求的元数据中
> 
> 考虑一个这样存储文档的示例：
> 
> ```json
> {
>   "key": "1",
>   "value": {
>     "person": {
>       "org": "Dev Ops",
>       "id": 1036
>     },
>     "city": "Seattle",
>     "state": "WA"
> }
> ```
> 
> 该文档配置文件包含如下格式的索引结构：
> 
> ```yaml
> apiVersion: dapr.io/v1alpha1
> kind: Component
> metadata:
>   name: statestore
> spec:
>   type: state.redis
>   version: v1
>   initTimeout: 1m
>   metadata:
>   - name: redisHost
>     value: "localhost:6379"
>   - name: redisPassword
>     value: ""
>   - name: queryIndexes
>     value: |
>       [
>         {
>           "name": "orgIndx",
>           "indexes": [
>             {
>               "key": "person.org",
>               "type": "TEXT"
>             },
>             {
>               "key": "person.id",
>               "type": "NUMERIC"
>             },
>             {
>               "key": "state",
>               "type": "TEXT"
>             },
>             {
>               "key": "city",
>               "type": "TEXT"
>             }
>           ]
>         }
>       ]
> ```
> 
> 现在，您现在可以存储、检索和查询这些文档。
> 
> 考虑 ["如何查询状态"]({{< ref "howto-state-query-api.md#example-data-and-query" >}}) 指南中的示例。 让我们用 Redis 运行它。
> 
> {{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" "Redis Enterprise Cloud" "Alibaba Cloud" >}}
> 
> {{% codetab %}}
> 
> 如果您使用的是 Dapr 的自托管部署，则在您运行 `dapr init`时，会自动将不带 JSON 模块的 Redis 实例创建为 Docker 容器。
> 
> 或者，您可以通过运行以下命令来创建 Redis 实例：
> 
> ```bash
>  docker run -p 6379:6379 --name redis --rm redis
> ```
> 
> 在 dapr init 或通过上述命令创建的 Redis 容器不能单独与状态存储查询 API 一起使用。 您可以在不同的端口上运行 redislabs/rejson docker 映像（与已安装的 Redis 正在使用的端口不同）以使用它们查询 API。
> 
> > 注意： `redislabs/rejson` 仅支持 amd64 架构。
> 
> 使用以下命令创建一个与查询 API 兼容的 redis 实例。
> 
> ```bash
> docker run -p 9445:9445 --name rejson --rm redislabs/rejson:2.0.6
> ```
> 
> {{% /codetab %}}
> 
> {{% codetab %}}
> 
> 遵循[在Kubernetes中部署Redis ](#setup-redis) 的说明以及额外的细节信息
> 
> 安装 Redis Helm 包时，提供一个配置文件，指定容器镜像并启用所需模块：
> 
> ```bash
> helm install redis bitnami/redis -f values.yaml
> ```
> 
> 其中 `values.yaml` 看起来像：
> 
> ```yaml
> image:
>   repository: redislabs/rejson
>   tag: 2.0.6
> 
> master:
>   extraFlags:
>    - --loadmodule
>    - /usr/lib/redis/modules/rejson.so
>    - --loadmodule
>    - /usr/lib/redis/modules/redisearch.so
> ```
> 
> {{% /codetab %}}
> 
> {{% codetab %}}
> 
> 
> 
> {{% alert title="Note" color="warning" %}}
> 
> Azure Redis 托管服务不支持 RedisJson 模块，不能与查询一起使用。 
> 
> {{% /alert %}}
> 
> {{% /codetab %}}
> 
> {{% codetab %}}
> 
> 遵循[在AWS中部署Redis](#setup-redis)说明。 
> 
> {{% alert title="Note" color="primary" %}}
> 
> 对于查询支持，您需要启用 RediSearch 和 RedisJson。 
> 
> {{% /alert %}}
> 
> 
> 
> {{% /codetab %}}
> 
> {{% codetab %}}
> 
> 
> 
> {{% alert title="Note" color="warning" %}}
> 
> 内存存储不支持模块，不能与查询一起使用。 
> 
> {{% /alert %}}
> 
> 
> 
> {{% /codetab %}}
> 
> {{% codetab %}}
> 
> [Redis 企业云](https://docs.redis.com/latest/rc/) 
> 
> {{% /codetab %}}
> 
> {{% codetab %}}
> 
>
<!-- IGNORE_LINKS -->
[阿里云](https://www.alibabacloud.com/product/apsaradb-for-redis)
<!-- END_IGNORE -->
> 
> {{% /codetab %}}
> 
> {{< /tabs >}}
> 
> 接下来是启动 Dapr 应用程序。 请参阅此 [组件配置文件](../../../../developing-applications/building-blocks/state-management/query-api-examples/components/redis/redis.yml)，其中包含查询索引格式。 确保修改 `redisHost` ，反射到`redislabs/rejson` 使用的本地转发端口。
> 
> ```bash
> dapr run --app-id demo --dapr-http-port 3500 --components-path query-api-examples/components/redis
> ```
> 
> 现在，使用员工数据集填充状态存储，以便以后可以查询它。
> 
> ```bash
> curl -X POST -H "Content-Type: application/json" -d @query-api-examples/dataset.json \
>   http://localhost:3500/v1.0/state/querystatestore?metadata.contentType=application/json
> ```
> 
> 为确保数据已正确存储，您可以检索特定对象
> 
> ```bash
> curl http://localhost:3500/v1.0/state/querystatestore/1?metadata.contentType=application/json
> ```
> 
> 这样结果会是：
> 
> ```json
> {
>   "city": "Seattle",
>   "state": "WA",
>   "person": {
>     "org": "Dev Ops",
>     "id": 1036
>   }
> }
> ```
> 
> 现在，让我们查找加利福尼亚州的所有员工，并按其员工 ID 降序对他们进行排序。
> 
> 这是 [查询](../../../../developing-applications/building-blocks/state-management/query-api-examples/query1.json)：
> 
> ```json
> {
>     "filter": {
>         "EQ": { "state": "CA" }
>     },
>     "sort": [
>         {
>             "key": "person.id",
>             "order": "DESC"
>         }
>     ]
> }
> ```
> 
> 使用以下命令执行查询：
> 
> ```bash
> curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query1.json \
>   'http://localhost:3500/v1.0-alpha1/state/querystatestore/query?metadata.contentType=application/json&metadata.queryIndexName=orgIndx'
> ```
> 
> 这样结果会是：
> 
> ```json
> {
>   "results": [
>     {
>       "key": "3",
>       "data": {
>         "person": {
>           "org": "Finance",
>           "id": 1071
>         },
>         "city": "Sacramento",
>         "state": "CA"
>       },
>       "etag": "1"
>     },
>     {
>       "key": "7",
>       "data": {
>         "person": {
>           "org": "Dev Ops",
>           "id": 1015
>         },
>         "city": "San Francisco",
>         "state": "CA"
>       },
>       "etag": "1"
>     },
>     {
>       "key": "5",
>       "data": {
>         "person": {
>           "org": "Hardware",
>           "id": 1007
>         },
>         "city": "Los Angeles",
>         "state": "CA"
>       },
>       "etag": "1"
>     },
>     {
>       "key": "9",
>       "data": {
>         "person": {
>           "org": "Finance",
>           "id": 1002
>         },
>         "city": "San Diego",
>         "state": "CA"
>       },
>       "etag": "1"
>     }
>   ]
> }
> ```
> 
> 查询语法和文档参阅[此处]({{< ref howto-state-query-api.md >}})
> 
> ## 相关链接
> 
> - [Dapr组件的基本格式]({{< ref component-schema >}})
> - 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
> - [状态管理构建块]({{< ref state-management >}})
