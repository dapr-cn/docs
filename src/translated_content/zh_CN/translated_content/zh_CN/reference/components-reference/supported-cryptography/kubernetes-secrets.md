---
type: docs
title: "Kubernetes Secrets"
linkTitle: "Kubernetes Secrets"
description: Detailed information on the Kubernetes secret cryptography component
---

## Component format

The purpose of this component is to load the Kubernetes secret named after the key name.

{{% alert title="Note" color="primary" %}}
This component uses the cryptographic engine in Dapr to perform operations. Although keys are never exposed to your application, Dapr has access to the raw key material.

{{% /alert %}}

A Dapr `crypto.yaml` component file has the following structure:

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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field              | Required | 详情                                                                                                                                | 示例                      |
| ------------------ |:--------:| --------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `defaultNamespace` |    否     | Default namespace to retrieve secrets from. If unset, the namespace must be specified for each key, as `namespace/secretName/key` | `"default-ns"`          |
| `kubeconfigPath`   |    否     | The path to the kubeconfig file. If not specified, the component uses the default in-cluster config value                         | `"/path/to/kubeconfig"` |


## 相关链接
[Cryptography building block]({{< ref cryptography >}})