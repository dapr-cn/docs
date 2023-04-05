---
type: docs
title: "Redis 绑定规范"
linkTitle: "Redis"
description: "Redis 组件绑定详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/redis/"
---

## Component format

To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


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
    value: <address>:6379
  - name: redisPassword
    value: **************
  - name: enableTLS
    value: <bool>
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field                 | 必填 | 绑定支持   | 详情                                                                                                                                                          | 示例                        |
| --------------------- |:--:| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| redisHost             | 是  | Output | The Redis host address                                                                                                                                      | `"localhost:6379"`        |
| redisPassword         | 是  | 输出     | Redis 密码                                                                                                                                                    | `"password"`              |
| redisUsername         | 否  | 输出     | Redis 主机的用户名。 默认为空. 确保您的 redis 服务器版本为 6 或更高版本，并且已正确创建 acl 规则。                                                                                               | `"username"`              |
| enableTLS             | 否  | 输出     | `enableTLS` - 如果 Redis 实例支持使用公用证书的 TLS ，那么可以将其配置为启用或禁用 TLS。 默认值为 `"false"`                                                                                  | `"true"`, `"false"`       |
| failover              | 否  | 输出     | 已启用故障转移配置的属性。 需要设置 sentinalMasterName。 默认值为 `"false"`                                                                                                       | `"true"`, `"false"`       |
| sentinelMasterName    | 否  | Output | 哨兵主名称。 See [Redis Sentinel Documentation](https://redis.io/docs/reference/sentinel-clients/)                                                                | `""`,  `"127.0.0.1:6379"` |
| redeliverInterval     | 否  | Output | The interval between checking for pending messages to redelivery. Defaults to `"60s"`. `"0"` disables redelivery.                                           | `"30s"`                   |
| processingTimeout     | 否  | Output | The amount time a message must be pending before attempting to redeliver it. Defaults to `"15s"`. `"0"` disables redelivery.                                | `"30s"`                   |
| redisType             | 否  | Output | The type of redis. There are two valid values, one is `"node"` for single node mode, the other is `"cluster"` for redis cluster mode. Defaults to `"node"`. | `"cluster"`               |
| redisDB               | 否  | Output | Database selected after connecting to redis. If `"redisType"` is `"cluster"` this option is ignored. Defaults to `"0"`.                                     | `"0"`                     |
| redisMaxRetries       | 否  | Output | Maximum number of times to retry commands before giving up. Default is to not retry failed commands.                                                        | `"5"`                     |
| redisMinRetryInterval | 否  | Output | Minimum backoff for redis commands between each retry. Default is `"8ms"`;  `"-1"` disables backoff.                                                        | `"8ms"`                   |
| redisMaxRetryInterval | 否  | Output | Maximum backoff for redis commands between each retry. Default is `"512ms"`;`"-1"` disables backoff.                                                        | `"5s"`                    |
| dialTimeout           | 否  | Output | Dial timeout for establishing new connections. Defaults to `"5s"`.                                                                                          | `"5s"`                    |
| readTimeout           | 否  | Output | Timeout for socket reads. 如果达到，redis命令将以超时的方式失败，而不是阻塞。 Defaults to `"3s"`, `"-1"` for no timeout.                                                           | `"3s"`                    |
| writeTimeout          | 否  | Output | Timeout for socket writes. 如果达到，redis命令将以超时的方式失败，而不是阻塞。 Defaults is readTimeout.                                                                            | `"3s"`                    |
| poolSize              | 否  | Output | Maximum number of socket connections. Default is 10 connections per every CPU as reported by runtime.NumCPU.                                                | `"20"`                    |
| poolTimeout           | 否  | Output | Amount of time client waits for a connection if all connections are busy before returning an error. Default is readTimeout + 1 second.                      | `"5s"`                    |
| maxConnAge            | 否  | Output | Connection age at which the client retires (closes) the connection. Default is to not close aged connections.                                               | `"30m"`                   |
| minIdleConns          | 否  | Output | Minimum number of idle connections to keep open in order to avoid the performance degradation associated with creating new connections. Defaults to `"0"`.  | `"2"`                     |
| idleCheckFrequency    | 否  | Output | Frequency of idle checks made by idle connections reaper. Default is `"1m"`. `"-1"` disables idle connections reaper.                                       | `"-1"`                    |
| idleTimeout           | 否  | Output | Amount of time after which the client closes idle connections. Should be less than server's timeout. Default is `"5m"`. `"-1"` disables idle timeout check. | `"10m"`                   |


## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`
- `get`
- `delete`

### create

您可以使用 `create` 操作将记录存储在 Redis 中。 设置一个键值对。 如果键已经存在，值将会被覆写。

#### Request

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

请求成功，将返回HTTP 204状态码(无内容) 和空报文

### get

You can get a record in Redis using the `get` operation. This gets a key that was previously set.

#### Request

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

### delete

You can delete a record in Redis using the `delete` operation. Returns success whether the key exists or not.

#### Request

```json
{
  "operation": "delete",
  "metadata": {
    "key": "key1"
  }
}
```

#### 响应

请求成功，将返回HTTP 204状态码(无内容) 和空报文


## Create a Redis instance

Dapr can use any Redis instance - containerized, running on your local dev machine, or a managed cloud service, provided the version of Redis is 5.0.0 or later.

*Note: Dapr does not support Redis >= 7. It is recommended to use Redis 6*

{{< tabs "Self-Hosted" "Kubernetes" "AWS" "GCP" "Azure">}}

{{% codetab %}}
The Dapr CLI will automatically create and setup a Redis Streams instance for you. The Redis instance will be installed via Docker when you run `dapr init`, and the component file will be created in default directory. (`$HOME/.dapr/components` directory (Mac/Linux) or `%USERPROFILE%\.dapr\components` on Windows).
{{% /codetab %}}

{{% codetab %}}
你可以使用[Helm](https://helm.sh/)在我们的Kubernetes集群中快速创建一个Redis实例， 这种方法需要[安装Helm](https://github.com/helm/helm#install)。 这种方法需要[安装Helm](https://github.com/helm/helm#install)。

1. Install Redis into your cluster.
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis --set image.tag=6.2
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

    - **Linux/MacOS**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode` and copy the outputted password.

    Add this password as the `redisPassword` value in your redis.yaml file. For example:

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
The Dapr CLI automatically deploys a local redis instance in self hosted mode as part of the `dapr init` command.
{{% /alert %}}


## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
