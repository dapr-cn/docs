---
type: docs
title: "Redis"
linkTitle: "Redis"
description: Redis 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-redis/"
---

## Component format

To setup Redis state store create a component of type `state.redis`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

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
    - name: failover
    value: # Optional
  - name: sentinelMasterName
    value: # Optional
  - name: redeliverInterval
    value: # Optional
  - name: processingTimeout
    value: # Optional
  - name: redisType
    value: # Optional
  - name: redisDB
    value: # Optional
  - name: redisMaxRetries
    value: # Optional
  - name: redisMinRetryInterval
    value: # Optional
  - name: redisMaxRetryInterval
    value: # Optional
  - name: dialTimeout
    value: # Optional
  - name: readTimeout
    value: # Optional
  - name: writeTimeout
    value: # Optional
  - name: poolSize
    value: # Optional
  - name: poolTimeout
    value: # Optional
  - name: maxConnAge
    value: # Optional
  - name: minIdleConns
    value: # Optional
  - name: idleCheckFrequency
    value: # Optional
  - name: idleTimeout
    value: # Optional
  - name: ttlInSeconds
    value: <int> # Optional
  - name: queryIndexes
    value: <string> # Optional
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}


如果您想要使用 RethinkDB 作为 Actor 存储，请在 yaml 上附上以下内容。

```yaml
  - name: actorStateStore
    value: "true"
```

## 元数据字段规范

| Field                 | 必填 | 详情                                                                                                                                                                                                         | 示例                                                              |
| --------------------- |:--:| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| redisHost             | 是  | Connection-string for the redis host                                                                                                                                                                       | `localhost:6379`, `redis-master.default.svc.cluster.local:6379` |
| redisPassword         | 是  | Redis的密码 无默认值 可以用`secretKeyRef`来引用密钥。                                                                                                                                                                      | `""`, `"KeFg23!"`                                               |
| redisUsername         | 否  | Redis 主机的用户名。 默认为空. 确保您的 redis 服务器版本为 6 或更高版本，并且已正确创建 acl 规则。                                                                                                                                              | `""`, `"default"`                                               |
| enableTLS             | 否  | 如果Redis实例支持使用公共证书的TLS，可以配置为启用或禁用。 默认值为 `"false"`                                                                                                                                                           | `"true"`, `"false"`                                             |
| maxRetries            | 否  | 放弃前的最大重试次数。 默认值为 `3`。                                                                                                                                                                                      | `5`, `10`                                                       |
| maxRetryBackoff       | 否  | Maximum backoff between each retry. 默认值为 2</code> 秒 `; <code>"-1"` 禁用回退。                                                                                                                                | `3000000000`                                                    |
| failover              | 否  | 已启用故障转移配置的属性。 Needs sentinelMasterName to be set. The redisHost should be the sentinel host address. See [Redis Sentinel Documentation](https://redis.io/docs/manual/sentinel/). 默认值为 `"false"`            | `"true"`, `"false"`                                             |
| sentinelMasterName    | 否  | 哨兵主名称。 See [Redis Sentinel Documentation](https://redis.io/docs/manual/sentinel/)                                                                                                                          | `""`,  `"127.0.0.1:6379"`                                       |
| redeliverInterval     | 否  | The interval between checking for pending messages to redelivery. Defaults to `"60s"`. `"0"` disables redelivery.                                                                                          | `"30s"`                                                         |
| processingTimeout     | 否  | The amount time a message must be pending before attempting to redeliver it. Defaults to `"15s"`. `"0"` disables redelivery.                                                                               | `"30s"`                                                         |
| redisType             | 否  | The type of redis. There are two valid values, one is `"node"` for single node mode, the other is `"cluster"` for redis cluster mode. Defaults to `"node"`.                                                | `"cluster"`                                                     |
| redisDB               | 否  | Database selected after connecting to redis. If `"redisType"` is `"cluster"` this option is ignored. Defaults to `"0"`.                                                                                    | `"0"`                                                           |
| redisMaxRetries       | 否  | Alias for `maxRetries`. If both values are set `maxRetries` is ignored.                                                                                                                                    | `"5"`                                                           |
| redisMinRetryInterval | 否  | Minimum backoff for redis commands between each retry. Default is `"8ms"`;  `"-1"` disables backoff.                                                                                                       | `"8ms"`                                                         |
| redisMaxRetryInterval | 否  | Alias for `maxRetryBackoff`. If both values are set `maxRetryBackoff` is ignored.                                                                                                                          | `"5s"`                                                          |
| dialTimeout           | 否  | Dial timeout for establishing new connections. Defaults to `"5s"`.                                                                                                                                         | `"5s"`                                                          |
| readTimeout           | 否  | Timeout for socket reads. 如果达到，redis命令将以超时的方式失败，而不是阻塞。 Defaults to `"3s"`, `"-1"` for no timeout.                                                                                                          | `"3s"`                                                          |
| writeTimeout          | 否  | Timeout for socket writes. 如果达到，redis命令将以超时的方式失败，而不是阻塞。 Defaults is readTimeout.                                                                                                                           | `"3s"`                                                          |
| poolSize              | 否  | Maximum number of socket connections. Default is 10 connections per every CPU as reported by runtime.NumCPU.                                                                                               | `"20"`                                                          |
| poolTimeout           | 否  | Amount of time client waits for a connection if all connections are busy before returning an error. Default is readTimeout + 1 second.                                                                     | `"5s"`                                                          |
| maxConnAge            | 否  | Connection age at which the client retires (closes) the connection. Default is to not close aged connections.                                                                                              | `"30m"`                                                         |
| minIdleConns          | 否  | Minimum number of idle connections to keep open in order to avoid the performance degradation associated with creating new connections. Defaults to `"0"`.                                                 | `"2"`                                                           |
| idleCheckFrequency    | 否  | Frequency of idle checks made by idle connections reaper. Default is `"1m"`. `"-1"` disables idle connections reaper.                                                                                      | `"-1"`                                                          |
| idleTimeout           | 否  | Amount of time after which the client closes idle connections. Should be less than server's timeout. Default is `"5m"`. `"-1"` disables idle timeout check.                                                | `"10m"`                                                         |
| actorStateStore       | 否  | Consider this state store for actors. 默认值为 `"false"`                                                                                                                                                       | `"true"`, `"false"`                                             |
| ttlInSeconds          | 否  | Allows specifying a default Time-to-live (TTL) in seconds that will be applied to every state store request unless TTL is explicitly defined via the [request metadata]({{< ref "state-store-ttl.md" >}}). | `600`                                                           |
| queryIndexes          | 否  | Indexing schemas for querying JSON objects                                                                                                                                                                 | see [Querying JSON objects](#querying-json-objects)             |

## 安装 Redis

Dapr can use any Redis instance: containerized, running on your local dev machine, or a managed cloud service.

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
当您运行 dapr init `时，Redis 实例会自动创建为 Docker 容器`
{{% /codetab %}}

{{% codetab %}}
你可以使用[Helm](https://helm.sh/)在我们的Kubernetes集群中快速创建一个Redis实例， 这种方法需要[安装Helm](https://github.com/helm/helm#install)。 这种方法需要[安装Helm](https://github.com/helm/helm#install)。

1. Install Redis into your cluster. Note that we're explicitly setting an image tag to get a version greater than 5, which is what Dapr' pub/sub functionality requires. If you're intending on using Redis as just a state store (and not for pub/sub), you do not have to set the image version.
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis
    ```

2. Run `kubectl get pods` to see the Redis containers now running in your cluster.
3. Add `redis-master:6379` as the `redisHost` in your [redis.yaml](#configuration) file. For example:
    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```
4. Next, get the Redis password, which is slightly different depending on the OS we're using:
    - **Windows**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`, which creates a file with your encoded password. Next, run `certutil -decode encoded.b64 password.txt`, which will put your redis password in a text file called `password.txt`. Copy the password and delete the two files.

    - **Linux/MacOS**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode` and copy the outputted password.

    Add this password as the `redisPassword` value in your [redis.yaml](#configuration) file. For example:
    ```yaml
        metadata:
        - name: redisPassword
          value: lhDOkwTlp0
    ```
{{% /codetab %}}

{{% codetab %}}
**注意**：此方法需要具有 Azure 订阅。

1. [Start the Azure Cache for Redis creation flow](https://ms.portal.azure.com/#create/Microsoft.Cache). Log in if necessary.
2. 填写必要的信息并 **选中"Unblock port 6379"框**，这将使我们能够在没有SSL的情况下保留状态。
3. 点击“创建”来启动您的 Redis 实例的部署。
4. Once your instance is created, you'll need to grab the Host name (FQDN) and your access key:
   - For the Host name: navigate to the resource's "Overview" and copy "Host name".
   - For your access key: navigate to "Settings" > "Access Keys" to copy and save your key.
5. Add your key and your host to a `redis.yaml` file that Dapr can apply to your cluster.
   - If you're running a sample, add the host and key to the provided `redis.yaml`.
   - If you're creating a project from the ground up, create a `redis.yaml` file as specified in [Configuration](#configuration).

   Set the `redisHost` key to `[HOST NAME FROM PREVIOUS STEP]:6379` and the `redisPassword` key to the key you saved earlier.

   **Note:** In a production-grade application, follow [secret management]({{< ref component-secrets.md >}}) instructions to securely manage your secrets.

> **NOTE:** Dapr pub/sub uses [Redis Streams](https://redis.io/topics/streams-intro) that was introduced by Redis 5.0, which isn't currently available on Azure Managed Redis Cache. Consequently, you can use Azure Managed Redis Cache only for state persistence. 
> 
> {{% /codetab %}}

{{% codetab %}}
[AWS Redis](https://aws.amazon.com/redis/)
{{% /codetab %}}

{{% codetab %}}
[GCP Cloud MemoryStore](https://cloud.google.com/memorystore/)
{{% /codetab %}}

{{< /tabs >}}

## 查询 JSON 对象（可选）

除了支持以键/值对的形式存储和查询状态数据外，Redis 状态存储还可以选择支持查询 JSON 对象以满足更复杂的查询或过滤要求。 要启用此功能，需要执行以下步骤：

1. Redis 存储必须支持 Redis 模块，特别是 Redisearch 和 RedisJson。 如果您正在部署和运行 Redis，则在部署 Redis 服务时加载 [个 redisearch](https://oss.redis.com/redisearch/) 和 [redisjson](https://oss.redis.com/redisjson/) 模块。 ``
2. 在组件配置的元数据中指定 `queryIndexes` 条目。 `queryIndexes` 的值是如下格式的JSON数组：
```json
[
  {
    "name": "<indexing name>",
    "indexes": [
      {
        "key": "<JSONPath-like syntax for selected element inside documents>",
        "type": "<value type (supported types: TEXT, NUMERIC)>",
      },
      ...
    ]
  },
  ...
]
```
3. 调用状态管理 API 时，将以下元数据添加到 API 调用中：
- [保存状态]({{< ref "state_api.md#save-state" >}}), [获取状态]({{< ref "state_api.md#get-state" >}}), [删除状态]({{< ref "state_api.md#delete-state" >}}):
  - 将 `metadata.contentType=application/json` URL 请求参数添加到 HTTP API 请求
  - 将 `"contentType": "application/json"` 添加到 gRPC API 请求的元数据中
- [查询状态]({{< ref "state_api.md#query-state" >}})：
  - 将 `metadata.contentType=application/json&metadata.queryIndexName=<indexing name>` URL 请求参数添加到 HTTP API 请求
  - 将`"contentType" : "application/json"`和`"queryIndexName" : "<indexing name>"`对添加到gRPC API请求的元数据中

考虑一个这样存储文档的示例：
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

该文档配置文件包含如下格式的索引结构：

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

现在，您现在可以存储、检索和查询这些文档。

考虑 ["如何查询状态"]({{< ref "howto-state-query-api.md#example-data-and-query" >}}) 指南中的示例。 让我们用 Redis 运行它。


{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" "Redis Enterprise Cloud" "Alibaba Cloud" >}}

{{% codetab %}}
如果您使用的是 Dapr 的自托管部署，则在您运行 `dapr init`时，会自动将不带 JSON 模块的 Redis 实例创建为 Docker 容器。

或者，您可以通过运行以下命令来创建 Redis 实例：
 ```bash
 docker run -p 6379:6379 --name redis --rm redis
 ```
 在 dapr init 或通过上述命令创建的 Redis 容器不能单独与状态存储查询 API 一起使用。 您可以在不同的端口上运行 redislabs/rejson docker 映像（与已安装的 Redis 正在使用的端口不同）以使用它们查询 API。

> 注意： `redislabs/rejson` 仅支持 amd64 架构。

Use following command to create an instance of redis compatible with query API.

```bash
docker run -p 9445:9445 --name rejson --rm redislabs/rejson:2.0.6
```
{{% /codetab %}}

{{% codetab %}}
遵循[在Kubernetes中部署Redis ](#setup-redis) 的说明以及额外的细节信息

安装 Redis Helm 包时，提供一个配置文件，指定容器镜像并启用所需模块：
```bash
helm install redis bitnami/redis --set image.tag=6.2 -f values.yaml
```

其中 `values.yaml` 看起来像：
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
{{% alert title="Note" color="warning" %}}
Azure Redis 托管服务不支持 RedisJson 模块，不能与查询一起使用。
{{% /alert %}}

{{% /codetab %}}

{{% codetab %}}
遵循[在AWS中部署Redis](#setup-redis)说明。
{{% alert title="Note" color="primary" %}}
对于查询支持，您需要启用 RediSearch 和 RedisJson。
{{% /alert %}}
{{% /codetab %}}

{{% codetab %}}
{{% alert title="Note" color="warning" %}}
内存存储不支持模块，不能与查询一起使用。
{{% /alert %}}
{{% /codetab %}}

{{% codetab %}}
[Redis 企业云](https://docs.redis.com/latest/rc/)
{{% /codetab %}}

{{% codetab %}}
<!-- IGNORE_LINKS -->
[阿里云](https://www.alibabacloud.com/product/apsaradb-for-redis)
<!-- END_IGNORE -->
{{% /codetab %}}

{{< /tabs >}}

Next is to start a Dapr application. 请参阅此 [组件配置文件](../../../../developing-applications/building-blocks/state-management/query-api-examples/components/redis/redis.yml)，其中包含查询索引格式。 确保修改 `redisHost` ，反射到`redislabs/rejson` 使用的本地转发端口。
```bash
dapr run --app-id demo --dapr-http-port 3500 --resources-path query-api-examples/components/redis
```

Now populate the state store with the employee dataset, so you can then query it later.
```bash
curl -X POST -H "Content-Type: application/json" -d @query-api-examples/dataset.json \
  http://localhost:3500/v1.0/state/querystatestore?metadata.contentType=application/json
```

为确保数据已正确存储，您可以检索特定对象
```bash
curl http://localhost:3500/v1.0/state/querystatestore/1?metadata.contentType=application/json
```

这样结果会是：
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

现在，让我们查找加利福尼亚州的所有员工，并按其员工 ID 降序对他们进行排序。

这是 [查询](../../../../developing-applications/building-blocks/state-management/query-api-examples/query1.json)：
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

Execute the query with the following command:
```bash
curl -s -X POST -H "Content-Type: application/json" -d @query-api-examples/query1.json \
  'http://localhost:3500/v1.0-alpha1/state/querystatestore/query?metadata.contentType=application/json&metadata.queryIndexName=orgIndx'
```

这样结果会是：
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

查询语法和文档参阅[此处]({{< ref howto-state-query-api.md >}})

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
