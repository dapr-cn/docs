---
type: docs
title: "Secret 存储组件"
linkTitle: "Secret 存储"
description: "关于设置不同 Secret 存储组件的指南"
weight: 800
aliases:
  - "/zh-hans/operations/components/setup-state-store/secret-stores-overview/"
---

Dapr 集成了 Secret 存储，为应用程序和其他组件提供安全的 Secret 存储和访问，例如访问密钥和密码。每个 Secret 存储组件都有一个名称，用于访问 Secret 时使用。

与其他构建块组件类似，Secret 存储组件是可扩展的，相关代码可以在 [components-contrib 仓库](https://github.com/dapr/components-contrib)中找到。

在 Dapr 中，Secret 存储通过一个 `Component` 文件进行描述，包含以下字段：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstore
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

Secret 存储的类型由 `type` 字段指定，连接字符串和其他元数据信息放在 `.metadata` 部分。

不同的[支持的 Secret 存储]({{< ref supported-secret-stores >}})会有不同的特定字段需要配置。例如，配置使用 AWS Secrets Manager 的 Secret 存储时，文件格式如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awssecretmanager
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

{{% alert title="重要" color="warning" %}}
在 EKS (AWS Kubernetes) 上运行 Dapr sidecar (daprd) 时，如果节点/Pod 已附加了允许访问 AWS 资源的 IAM 策略，则**不应**在组件配置中提供 AWS access-key、secret-key 和 tokens。
{{% /alert %}}

## 应用配置

创建组件的 YAML 文件后，请根据您的托管环境按照以下说明应用它：

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
在本地运行时，创建一个包含 YAML 文件的 `components` 目录，并使用 `--resources-path` 标志提供给 `dapr run` 命令。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 中部署时，假设您的组件文件名为 `secret-store.yaml`，运行：

```bash
kubectl apply -f secret-store.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## 支持的 Secret 存储

访问 [Secret 存储参考]({{< ref supported-secret-stores >}}) 以获取支持的 Secret 存储的完整列表。

## 相关链接

- [支持的 Secret 存储组件]({{< ref supported-secret-stores >}})
- [Secrets 构建块]({{< ref secrets >}})
