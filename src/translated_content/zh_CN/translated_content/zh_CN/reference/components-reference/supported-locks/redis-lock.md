---
type: docs
title: "Redis"
linkTitle: "Redis"
description: Detailed information on the Redis lock component
---

## Component format

To set up the Redis lock, create a component of type `lock.redis`. See [this guide]({{< ref "howto-use-distributed-lock" >}}) on how to create a lock.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: lock.redis
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
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}


## 元数据字段规范

| Field                 | Required | 详情                                                                                                                                                                                              | 示例                                                              |
| --------------------- |:--------:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| redisHost             |    是     | Connection-string for the redis host                                                                                                                                                            | `localhost:6379`, `redis-master.default.svc.cluster.local:6379` |
| redisPassword         |    是     | Redis的密码 无默认值 可以用`secretKeyRef`来引用密钥。                                                                                                                                                           | `""`, `"KeFg23!"`                                               |
| redisUsername         |    否     | Redis 主机的用户名。 默认为空. 确保您的 redis 服务器版本为 6 或更高版本，并且已正确创建 acl 规则。                                                                                                                                   | `""`, `"default"`                                               |
| enableTLS             |    否     | 如果Redis实例支持使用公共证书的TLS，可以配置为启用或禁用。 默认值为 `"false"`                                                                                                                                                | `"true"`, `"false"`                                             |
| maxRetries            |    否     | 放弃前的最大重试次数。 默认值为 `3`。                                                                                                                                                                           | `5`, `10`                                                       |
| maxRetryBackoff       |    否     | Maximum backoff between each retry. 默认值为 2</code> 秒 `; <code>"-1"` 禁用回退。                                                                                                                     | `3000000000`                                                    |
| failover              |    否     | 已启用故障转移配置的属性。 Needs sentinelMasterName to be set. The redisHost should be the sentinel host address. See [Redis Sentinel Documentation](https://redis.io/docs/manual/sentinel/). 默认值为 `"false"` | `"true"`, `"false"`                                             |
| sentinelMasterName    |    否     | 哨兵主名称。 See [Redis Sentinel Documentation](https://redis.io/docs/manual/sentinel/)                                                                                                               | `"mymaster"`                                                    |
| redeliverInterval     |    否     | The interval between checking for pending messages to redelivery. Defaults to `"60s"`. `"0"` disables redelivery.                                                                               | `"30s"`                                                         |
| processingTimeout     |    否     | The amount time a message must be pending before attempting to redeliver it. Defaults to `"15s"`. `"0"` disables redelivery.                                                                    | `"30s"`                                                         |
| redisType             |    否     | The type of redis. There are two valid values, one is `"node"` for single node mode, the other is `"cluster"` for redis cluster mode. Defaults to `"node"`.                                     | `"cluster"`                                                     |
| redisDB               |    否     | Database selected after connecting to redis. If `"redisType"` is `"cluster"` this option is ignored. Defaults to `"0"`.                                                                         | `"0"`                                                           |
| redisMaxRetries       |    否     | Alias for `maxRetries`. If both values are set `maxRetries` is ignored.                                                                                                                         | `"5"`                                                           |
| redisMinRetryInterval |    否     | Minimum backoff for redis commands between each retry. Default is `"8ms"`;  `"-1"` disables backoff.                                                                                            | `"8ms"`                                                         |
| redisMaxRetryInterval |    否     | Alias for `maxRetryBackoff`. If both values are set `maxRetryBackoff` is ignored.                                                                                                               | `"5s"`                                                          |
| dialTimeout           |    否     | Dial timeout for establishing new connections. Defaults to `"5s"`.                                                                                                                              | `"5s"`                                                          |
| readTimeout           |    否     | Timeout for socket reads. 如果达到，redis命令将以超时的方式失败，而不是阻塞。 Defaults to `"3s"`, `"-1"` for no timeout.                                                                                               | `"3s"`                                                          |
| writeTimeout          |    否     | Timeout for socket writes. 如果达到，redis命令将以超时的方式失败，而不是阻塞。 Defaults is readTimeout.                                                                                                                | `"3s"`                                                          |
| poolSize              |    否     | Maximum number of socket connections. Default is 10 connections per every CPU as reported by runtime.NumCPU.                                                                                    | `"20"`                                                          |
| poolTimeout           |    否     | Amount of time client waits for a connection if all connections are busy before returning an error. Default is readTimeout + 1 second.                                                          | `"5s"`                                                          |
| maxConnAge            |    否     | Connection age at which the client retires (closes) the connection. Default is to not close aged connections.                                                                                   | `"30m"`                                                         |
| minIdleConns          |    否     | Minimum number of idle connections to keep open in order to avoid the performance degradation associated with creating new connections. Defaults to `"0"`.                                      | `"2"`                                                           |
| idleCheckFrequency    |    否     | Frequency of idle checks made by idle connections reaper. Default is `"1m"`. `"-1"` disables idle connections reaper.                                                                           | `"-1"`                                                          |
| idleTimeout           |    否     | Amount of time after which the client closes idle connections. Should be less than server's timeout. Default is `"5m"`. `"-1"` disables idle timeout check.                                     | `"10m"`                                                         |

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
    helm install redis bitnami/redis --set image.tag=6.2
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


## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Distributed lock building block]({{< ref distributed-lock-api-overview >}})
