---
type: docs
title: "Redis"
linkTitle: "Redis"
description: 有关 Redis 配置存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-configuration-store/supported-configuration-stores/setup-redis/"
---

## Component format

To setup Redis configuration store create a component of type `configuration.redis`. See [this guide]({{< ref "howto-manage-configuration.md#configure-a-dapr-configuration-store" >}}) on how to create and apply a configuration store configuration.

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
  - name: enableTLS
    value: <bool>

```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}


## 元数据字段规范

| Field                 | Required | 详情     | 示例                                                                                                                                                                        |
| --------------------- |:--------:| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| redisHost             |    是     | Output | The Redis host address | `"localhost:6379"`                                                                                                                               |
| redisPassword         |    是     | Output | The Redis password | `"password"`                                                                                                                                         |
| redisUsername         |    否     | Output | Redis 主机的用户名。 默认为空. Make sure your Redis server version is 6 or above, and have created acl rule correctly. | `"username"`                                                |
| enableTLS             |    否     | Output | `enableTLS` - 如果 Redis 实例支持使用公用证书的 TLS ，那么可以将其配置为启用或禁用 TLS。 Defaults to `"false"` | `"true"`, `"false"`                                                                   |
| failover              |    否     | Output | 已启用故障转移配置的属性。 Needs sentinelMasterName to be set. Defaults to `"false"` | `"true"`, `"false"`                                                                             |
| sentinelMasterName    |    否     | Output | The Sentinel master name. See [Redis Sentinel Documentation](https://redis.io/docs/reference/sentinel-clients/) | `""`,  `"127.0.0.1:6379"`                               |
| redisType             |    否     | Output | The type of Redis. There are two valid values, one is `"node"` for single node mode, the other is `"cluster"` for Redis cluster mode. Defaults to `"node"`. | `"cluster"` |
| redisDB               |    否     | Output | Database selected after connecting to Redis. If `"redisType"` is `"cluster"`, this option is ignored. Defaults to `"0"`. | `"0"`                                          |
| redisMaxRetries       |    否     | Output | Maximum number of times to retry commands before giving up. Default is to not retry failed commands.  | `"5"`                                                             |
| redisMinRetryInterval |    否     | Output | Minimum backoff for Redis commands between each retry. Default is `"8ms"`;  `"-1"` disables backoff. | `"8ms"`                                                            |
| redisMaxRetryInterval |    否     | Output | Maximum backoff for Redis commands between each retry. Default is `"512ms"`;`"-1"` disables backoff. | `"5s"`                                                             |
| dialTimeout           |    否     | Output | Dial timeout for establishing new connections. Defaults to `"5s"`.  | `"5s"`                                                                                              |
| readTimeout           |    否     | Output | Timeout for socket reads. If reached, Redis commands fail with a timeout instead of blocking. Defaults to `"3s"`, `"-1"` for no timeout. | `"3s"`                         |
| writeTimeout          |    否     | Output | Timeout for socket writes. If reached, Redis commands fail with a timeout instead of blocking. Defaults is readTimeout. | `"3s"`                                          |
| poolSize              |    否     | Output | Maximum number of socket connections. Default is 10 connections per every CPU as reported by runtime.NumCPU. | `"20"`                                                     |
| poolTimeout           |    否     | Output | Amount of time client waits for a connection if all connections are busy before returning an error. Default is readTimeout + 1 second. | `"5s"`                           |
| maxConnAge            |    否     | Output | Connection age at which the client retires (closes) the connection. Default is to not close aged connections. | `"30m"`                                                   |
| minIdleConns          |    否     | Output | Minimum number of idle connections to keep open in order to avoid the performance degradation associated with creating new connections. Defaults to `"0"`. | `"2"`        |
| idleCheckFrequency    |    否     | Output | Frequency of idle checks made by idle connections reaper. Default is `"1m"`. `"-1"` disables idle connections reaper. | `"-1"`                                            |
| idleTimeout           |    否     | Output | Amount of time after which the client closes idle connections. Should be less than server's timeout. Default is `"5m"`. `"-1"` disables idle timeout check. | `"10m"`     |

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
- 有关如何将 Redis 用作配置存储的说明，请阅读 [操作方法：管理存储中的配置]({{< ref "howto-manage-configuration" >}}) 。
- [配置构建基块]({{< ref configuration-api-overview >}})
