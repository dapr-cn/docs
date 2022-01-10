---
type: docs
title: "Redis"
linkTitle: "Redis"
description: Detailed information on the Redis configuration store component
aliases:
  - "/operations/components/setup-state-store/supported-configuration-stores/setup-redis/"
---

## 配置

To setup Redis configuration store create a component of type `configuration.redis`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a configuration store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: configuration.redis
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

```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}


## 元数据字段规范

| 字段                 | 必填 | 详情                                                                                                                                                                                                                      | 示例                                                              |
| ------------------ |:--:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| redisHost          | Y  | Redis的连接地址                                                                                                                                                                                                              | `localhost:6379`, `redis-master.default.svc.cluster.local:6379` |
| redisPassword      | Y  | Redis的密码 无默认值 可以用`secretKeyRef`来引用密钥。                                                                                                                                                                                   | `""`, `"KeFg23!"`                                               |
| enableTLS          | N  | 如果Redis实例支持使用公共证书的TLS，可以配置为启用或禁用。 默认值为 `"false"`                                                                                                                                                                        | `"true"`, `"false"`                                             |
| maxRetries         | N  | Maximum number of retries before giving up. Defaults to `3`                                                                                                                                                             | `5`, `10`                                                       |
| maxRetryBackoff    | N  | Minimum backoff between each retry. Defaults to `2` seconds; `"-1"` disables backoff.                                                                                                                                   | `3000000000`                                                    |
| failover           | N  | Property to enabled failover configuration. Needs sentinalMasterName to be set. The redisHost should be the sentinel host address. See [Redis Sentinel Documentation](https://redis.io/topics/sentinel). 默认值为 `"false"` | `"true"`, `"false"`                                             |
| sentinelMasterName | N  | The sentinel master name. See [Redis Sentinel Documentation](https://redis.io/topics/sentinel)                                                                                                                          | `""`,  `"127.0.0.1:6379"`                                       |


## Setup Redis

Dapr can use any Redis instance - containerized, running on your local dev machine, or a managed cloud service.

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
A Redis instance is automatically created as a Docker container when you run `dapr init`
{{% /codetab %}}

{{% codetab %}}
We can use [Helm](https://helm.sh/) to quickly create a Redis instance in our Kubernetes cluster. 这种方法需要[安装Helm](https://github.com/helm/helm#install)。

1. 安装 Redis 到你的集群： Note that we're explicitly setting an image tag to get a version greater than 5, which is what Dapr' pub/sub functionality requires. If you're intending on using Redis as just a state store (and not for pub/sub), you do not have to set the image version.
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis
    ```

2. 执行`kubectl get pods`来查看现在正在集群中运行的Redis容器。
3. Add `redis-master:6379` as the `redisHost` in your [redis.yaml](#configuration) file. 例如:
    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```
4. Next, we'll get the Redis password, which is slightly different depending on the OS we're using:
    - **Windows**：执行`kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`，这将创建一个有你的加密后密码的文件。 接下来，执行`certutil -decode encoded.b64 password.txt`，它将把你的redis密码放在一个名为`password.txt`的文本文件中。 复制密码，删除这两个文件。

    - **Linux/MacOS**：执行 `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode`并复制输出的密码。

    Add this password as the `redisPassword` value in your [redis.yaml](#configuration) file. 例如:
    ```yaml
        metadata:
        - name: redisPassword
          value: lhDOkwTlp0
    ```
{{% /codetab %}}

{{% codetab %}}
**Note**: this approach requires having an Azure Subscription.

1. Open [this link](https://ms.portal.azure.com/#create/Microsoft.Cache) to start the Azure Cache for Redis  creation flow. 如有必要，请登录。
2. Fill out necessary information and **check the "Unblock port 6379" box**, which will allow us to persist state without SSL.
3. 点击“创建”来启动您的 Redis 实例的部署。
4. Once your instance is created, you'll need to grab the Host name (FQDN) and your access key.
   - for the Host name navigate to the resources "Overview" and copy "Host name"
   - for your access key navigate to "Access Keys" under "Settings" and copy your key.
5. Finally, we need to add our key and our host to a `redis.yaml` file that Dapr can apply to our cluster. If you're running a sample, you'll add the host and key to the provided `redis.yaml`. If you're creating a project from the ground up, you'll create a `redis.yaml` file as specified in [Configuration](#configuration). Set the `redisHost` key to `[HOST NAME FROM PREVIOUS STEP]:6379` and the `redisPassword` key to the key you copied in step 4. **Note:** In a production-grade application, follow [secret management]({{< ref component-secrets.md >}}) instructions to securely manage your secrets.

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
- [Dapr组件的基本格式]({{< ref component-schema >}})
- Read [How-To: Manage configuration from a store]({{< ref "howto-manage-configuration" >}}) for instructions on how to use Redis as a configuration store.
- [Configuration building block]({{< ref configuration-api-overview >}})
