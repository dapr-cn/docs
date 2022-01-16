---
type: docs
title: "Redis 绑定规范"
linkTitle: "Redis"
description: "Redis 组件绑定详细说明"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/redis/"
---

## 配置

To setup Redis binding create a component of type `bindings.redis`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段            | 必填 | 绑定支持 | 详情                                                                                                                        | 示例                  |
| ------------- |:--:| ---- | ------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| redisHost     | Y  | 输出   | The Redis host address                                                                                                    | `"localhost:6379"`  |
| redisPassword | Y  | 输出   | The Redis password                                                                                                        | `"password"`        |
| enableTLS     | N  | 输出   | If the Redis instance supports TLS with public certificates it can be configured to enable or disable TLS. 默认值为 `"false"` | `"true"`, `"false"` |


## 绑定支持

字段名为 `ttlInSeconds`。

- `create`

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
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
