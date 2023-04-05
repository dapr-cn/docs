---
type: docs
title: "秘密存储组件"
linkTitle: "秘密存储"
description: "关于配置不同的秘密存储组件的指南"
weight: 800
aliases:
  - "/zh-hans/operations/components/setup-state-store/secret-stores-overview/"
---

Dapr integrates with secret stores to provide apps and other components with secure storage and access to secrets such as access keys and passwords. Each secret store component has a name and this name is used when accessing a secret.

与其他构建块组件一样，秘密存储组件是可扩展的，可以在 [components-contrib 仓库](https://github.com/dapr/components-contrib)中找到。

Dapr 中的密钥存储使用 `Component` 文件描述，其字段如下:

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

密钥存储的类型由 `type` 字段决定，连接地址和其他元数据等放在 `.metadata` 部分。

不同[支持的 secret stores]({{< ref supported-secret-stores >}}) 将有不同的特定字段需要配置。 例如，当配置一个使用 AWS Secrets Manager 秘密存储时，文件看起来就像这样：

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

{{% alert title="Important" color="warning" %}}
当在 EKS (AWS Kubernetes) 上与您的应用程序一起运行 Dapr sidecar (daprd) 时，如果您使用的node/pod 已附加到定义 AWS 资源访问权限的 IAM 策略，那么您 **不能**在正在使用的组件规范的定义中提供 AWS access-key、secret-key 和token。
{{% /alert %}}

## 应用配置

Once you have created the component's YAML file, follow these instructions to apply it based on your hosting environment:


{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--resources-path`.
{{% /codetab %}}

{{% codetab %}}
To deploy in Kubernetes, assuming your component file is named `secret-store.yaml`, run:

```bash
kubectl apply -f secret-store.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## 支持的秘密存储

Visit the [secret stores reference]({{< ref supported-secret-stores >}}) for a full list of supported secret stores.


## 相关链接

- [Supported secret store components]({{< ref supported-secret-stores >}})
- [秘密构建块]({{< ref secrets >}})
