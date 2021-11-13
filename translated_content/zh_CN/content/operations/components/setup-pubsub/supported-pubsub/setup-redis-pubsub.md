---
type: docs
title: "Redis Streams"
linkTitle: "Redis Streams"
description: "关于Redis Streams pubsub组件的详细文档"
---

## 配置

要设置Redis Streams pubsub，请创建一个类型为`pubsub.redis`的组件。 See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: redis-pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: "KeFg23!"
  - name: consumerID
    value: "myGroup"
  - name: enableTLS
    value: "false"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段            | 必填 | 详情                                               | Example                                                         |
| ------------- |:--:| ------------------------------------------------ | --------------------------------------------------------------- |
| redisHost     | Y  | Redis的连接地址                                       | `localhost:6379`, `redis-master.default.svc.cluster.local:6379` |
| redisPassword | Y  | Redis的密码 无默认值 可以用`secretKeyRef`来引用密钥。            | `""`, `"KeFg23!"`                                               |
| consumerID    | N  | 消费组 ID                                           | `"mygroup"`                                                     |
| enableTLS     | N  | 如果Redis实例支持使用公共证书的TLS，可以配置为启用或禁用。 默认值为 `"false"` | `"true"`, `"false"`                                             |

## 创建Redis实例

Dapr可以使用任何Redis实例，无论是容器化的，运行在本地开发机器上的，或者是托管的云服务，前提是Redis的版本是5.0.0或更高。

{{< tabs "Self-Hosted" "Kubernetes" "AWS" "GCP" "Azure">}}

{{% codetab %}}
Dapr CLI将自动为你创建和设置一个Redis Streams实例。 当你执行`dapr init`时，Redis实例将通过Docker安装，组件文件将在默认目录下创建。 (默认目录位于`$HOME/.dapr/components` (Mac/Linux) ，`%USERPROFILE%\.dapr\components` (Windows)).
{{% /codetab %}}

{{% codetab %}}
您可以使用 [helm](https://helm.sh/) 在我们的 Kubernetes 集群中快速创建 dapr 实例。 这种方法需要[安装Helm](https://github.com/helm/helm#install)。

1. 安装 Redis 到你的集群：
    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install redis bitnami/redis
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

    - **Linux/MacOS**：执行 `kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode`并复制输出的密码。

    将此密码设置为redis.yaml文件的`redisPassword`的值。 例如:

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
作为`dapr init`命令的一部分，Dapr CLI会在自托管模式下自动部署本地redis实例。
{{% /alert %}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [发布/订阅构建块]({{< ref pubsub >}})