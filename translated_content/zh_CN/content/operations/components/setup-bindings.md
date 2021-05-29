---
type: docs
title: "绑定组件"
linkTitle: "绑定"
description: "关于设置Dapr绑定组件的指南"
weight: 4000
---

Dapr integrates with external resources to allow apps to both be triggered by external events and interact with the resources. Each binding component has a name and this name is used when interacting with the resource.

As with other building block components, binding components are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

A binding in Dapr is described using a `Component` file with the following fields:

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

The type of binding is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section.

Different [supported bindings]({{< ref supported-bindings >}}) will have different specific fields that would need to be configured. For example, when configuring a binding for [Azure Blob Storage]({{< ref blobstorage>}}), the file would look like this:

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

## Supported bindings

Visit the [bindings reference]({{< ref supported-bindings >}}) for a full list of supported resources.

## 相关链接
- [绑定构建块]({{< ref bindings >}})
- [Supported bindings]({{<ref supported-bindings >}})