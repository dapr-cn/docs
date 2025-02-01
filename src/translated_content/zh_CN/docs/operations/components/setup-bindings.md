---
type: docs
title: "Bindings 组件"
linkTitle: "Bindings"
description: "关于设置 Dapr bindings 组件的指导"
weight: 900
---

Dapr 可以与外部资源集成，使应用程序既能被外部事件触发，也能与资源进行交互。每个 bindings 组件都有一个名称，用于与资源进行交互时使用。

与其他构建块组件一样，bindings 组件是可扩展的，相关代码可以在 [components-contrib 仓库](https://github.com/dapr/components-contrib)中找到。

在 Dapr 中，bindings 使用一个 `Component` 文件描述，包含以下字段：

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

bindings 的类型由 `type` 字段指定，连接字符串和其他元数据则在 `.metadata` 部分定义。

不同的[支持的 bindings]({{< ref supported-bindings >}})会有不同的特定字段需要配置。例如，当为 [Azure Blob Storage]({{< ref blobstorage>}}) 配置 bindings 时，文件看起来像这样：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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

一旦创建了组件的 YAML 文件，请根据您的托管环境按照以下步骤进行配置：

{{< tabs "自托管" "Kubernetes" >}}

{{% codetab %}}
对于自托管环境，创建一个包含 YAML 文件的 `components` 目录，并使用 `--resources-path` 标志将路径提供给 `dapr run` 命令。
{{% /codetab %}}

{{% codetab %}}
对于 Kubernetes 部署，假设您的组件文件名为 `mybinding.yaml`，运行以下命令：

```bash
kubectl apply -f mybinding.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## 支持的 bindings

访问 [bindings 参考]({{< ref supported-bindings >}}) 以获取支持资源的完整列表。

## 相关链接
- [Bindings 构建块]({{< ref bindings >}})
- [支持的 bindings]({{<ref supported-bindings >}})
