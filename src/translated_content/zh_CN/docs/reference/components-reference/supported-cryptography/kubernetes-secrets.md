---
type: docs
title: "Kubernetes Secrets"
linkTitle: "Kubernetes Secrets"
description: 关于Kubernetes secret加密组件的详细信息
---

## 组件格式

此组件旨在加载以密钥名称命名的Kubernetes secret。

{{% alert title="注意" color="primary" %}}
此组件依赖于Dapr的加密引擎进行操作。虽然密钥不会直接暴露给您的应用程序，但Dapr可以访问原始密钥材料。

{{% /alert %}}

一个Dapr `crypto.yaml`组件文件的结构如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: crypto.dapr.kubernetes.secrets
  version: v1
  metadata:[]
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串形式的secrets。建议使用secret存储来保存secrets，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `defaultNamespace` | 否 | 用于检索secrets的默认命名空间。如果未设置，必须为每个密钥指定命名空间，例如`namespace/secretName/key` | `"default-ns"` |
| `kubeconfigPath` | 否 | kubeconfig文件的路径。如果未指定，组件将使用默认的集群内配置 | `"/path/to/kubeconfig"`


## 相关链接
[加密构建块]({{< ref cryptography >}})