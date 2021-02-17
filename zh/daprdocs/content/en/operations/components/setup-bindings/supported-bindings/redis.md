---
type: docs
title: "Redis 绑定规范"
linkTitle: "Redis"
description: "Redis 组件绑定详细说明"
---

## 设置 Dapr 组件

To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
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
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [点击这里查看操作方法]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 输出绑定支持的操作

| Field                       | Required | Binding support | Details                                                                           | Example             |
| --------------------------- |:--------:| --------------- | --------------------------------------------------------------------------------- | ------------------- |
| `redisHost` 是 Redis 主机地址。   |    Y     | Output          | The Redis host address                                                            | `"localhost:6379"`  |
| `RedisPassword` 是 Redis 密码。 |    Y     | Output          | The Redis password                                                                | `"password"`        |
| enableTLS                   |    N     | Output          | `enableTLS` - 如果 Redis 实例支持使用公用证书的 TLS ，那么可以将其配置为启用或禁用 TLS。 Defaults to `"false"` | `"true"`, `"false"` |


## 相关链接

This component supports **output binding** with the following operations:

- `create`

## Create a Redis instance

Dapr can use any Redis instance - containerized, running on your local dev machine, or a managed cloud service, provided the version of Redis is 5.0.0 or later.

{{< tabs "Self-Hosted" "Kubernetes" "AWS" "GCP" "Azure">}}

{{% codetab %}}
The Dapr CLI will automatically create and setup a Redis Streams instance for you. The Redis instance will be installed via Docker when you run `dapr init`, and the component file will be created in default directory. (`$HOME/.dapr/components` directory (Mac/Linux) or `%USERPROFILE%\.dapr\components` on Windows).
{{% /codetab %}}

{{% codetab %}}
You can use [Helm](https://helm.sh/) to quickly create a Redis instance in our Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install).

1. Install Redis into your cluster.
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis
    ```

2. Run `kubectl get pods` to see the Redis containers now running in your cluster.
3. Add `redis-master:6379` as the `redisHost` in your redis.yaml file. For example:

    ```yaml
        metadata:
        - name: redisHost
          value: redis-master:6379
    ```

4. Next, we'll get our Redis password, which is slightly different depending on the OS we're using:
    - **Windows**: Run `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" > encoded.b64`, which will create a file with your encoded password. Next, run `certutil -decode encoded.b64 password.txt`, which will put your redis password in a text file called `password.txt`. Copy the password and delete the two files.

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
[Azure Redis](https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/quickstart-create-redis)
{{% /codetab %}}

{{< /tabs >}}


{{% alert title="Note" color="primary" %}}
The Dapr CLI automatically deploys a local redis instance in self hosted mode as part of the `dapr init` command.
{{% /alert %}}


## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [如何使用 Bindings 作为接口连接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 参考]({{< ref bindings_api.md >}})
