---
type: docs
title: "秘密存储组件"
linkTitle: "秘密存储"
description: "关于配置不同的秘密存储组件的指南"
weight: 3000
aliases:
  - "/zh-hans/operations/components/setup-state-store/secret-stores-overview/"
---

Dapr 集成秘密存储，为应用程序和其他组件提供安全存储和对秘密的访问，如访问密钥和密码。 每个秘密存储组件都有一个名称，访问秘密时将使用此名称。

与其他构建块组件一样，秘密存储组件是可扩展的，可以在 [components-contrib 仓库](https://github.com/dapr/components-contrib)中找到。

Dapr 中的秘密存储使用 `Component` 文件描述，其字段如下:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstore
  namespace: default
spec:
  type: secretstores.<NAME>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

秘密存储的类型由 `type` 字段决定，连接地址和其他元数据等放在 `.metadata` 部分。

不同的 [受支持的秘密存储]({{< ref supported-secret-stores >}}) 将有不同的特定字段需要配置。 例如，配置使用 AWS Secrets Manager 的秘密存储时，文件将如下所示：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awssecretmanager
  namespace: default
spec:
  type: secretstores.aws.secretmanager
  version: v1
  metadata:
  - name: region
    value: "[aws_region]"
  - name: accessKey
    value: "[aws_access_key]"
  - name: secretKey
    value: "[aws_secret_key]"
  - name: sessionToken
    value: "[aws_session_token]"
```

## 应用配置

创建组件的 YAML 文件后，请按照以下说明根据您的主机环境应用该文件：


{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
要在本地运行，创建一个包含 YAML 文件的 `components` 目录，并为 `dapr run` 命令提供路径，标志为 `--components-path`。
{{% /codetab %}}

{{% codetab %}}
若要在 Kubernetes 中部署，假定您的组件文件名为 `secret-store.yaml`，运行：

```bash
kubectl apply -f secret-store.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## 支持的秘密存储

访问 [ 秘密存储参考文档]({{< ref supported-secret-stores >}}) 获取支持的秘密存储的完整列表。


## 相关链接

- [支持的秘密存储组件]({{< ref supported-secret-stores >}})
- [秘密构建块]({{< ref secrets >}})
