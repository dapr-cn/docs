---
type: docs
title: "绑定组件"
linkTitle: "绑定"
description: "关于设置Dapr绑定组件的指南"
weight: 4000
---

Dapr 与外部资源集成，允许应用同时被外部事件触发并与资源交互。 每个绑定组件都有一个名称，此名称用于与资源进行交互。

与其他构建块组件一样，密钥存储组件是可扩展的，可以在[components-contrib 仓库](https://github.com/dapr/components-contrib)中找到。

在 Dapr 中描述的绑定使用了 `Component` 文件，具有以下字段：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.<NAME>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

绑定类型由 `type` 字段确定，连接字符串和其他元数据等内容放在 `.metadata` 部分中。

不同的 [supported bindings]({{< ref supported-bindings >}}) 将有不同的特定字段需要配置。 例如，当配置一个 [Azure Blob Storage]({{< ref blobstorage>}})的绑定时，文件看起来就像这样：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.blobstorage
  version: v1
  metadata:
  - name: storageAccount
    value: myStorageAccountName
  - name: storageAccessKey
    value: ***********
  - name: container
    value: container1
  - name: decodeBase64
    value: <bool>
  - name: getBlobRetryCount
    value: <integer>
```

## 应用配置

一旦您创建了组件的 YAML 文件，按照以下说明来根据您的主机环境应用它：


{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
要在本地运行，创建一个包含YAML文件的`components`目录，并提供`dapr run`命令的路径，标志为`--components-path`。
{{% /codetab %}}

{{% codetab %}}
若要在 Kubernetes 中部署，假定您的组件文件名为 `mybinding.yaml`，运行：

```bash
kubectl apply -f mybinding.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## 已支持的绑定

访问 [绑定引用]({{< ref supported-bindings >}}) 获取完整的支持资源列表。

## 相关链接
- [绑定构建块]({{< ref bindings >}})
- [Supported bindings]({{<ref supported-bindings >}})