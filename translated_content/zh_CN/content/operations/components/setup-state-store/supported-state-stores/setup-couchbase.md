---
type: docs
title: "Couchbase"
linkTitle: "Couchbase"
description: Detailed information on the Couchbase state store component
---

## 配置

To setup Couchbase state store create a component of type `state.couchbase`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.couchbase
  version: v1
  metadata:
  - name: couchbaseURL
    value: <REPLACE-WITH-URL> # Required. Example: "http://localhost:8091"
  - name: username
    value: <REPLACE-WITH-USERNAME> # Required.
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Required.
  - name: bucketName
    value: <REPLACE-WITH-BUCKET> # Required.
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段           | 必填 | 详情                              | 示例                        |
| ------------ |:--:| ------------------------------- | ------------------------- |
| couchbaseURL | Y  | The URL of the Couchbase server | `"http://localhost:8091"` |
| username     | Y  | The username for the database   | `"user"`                  |
| password     | Y  | The password for access         | `"password"`              |
| bucketName   | Y  | The bucket name to write to     | `"bucket"`                |

## Setup Couchbase

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Couchbase locally using Docker:

```
docker run -d --name db -p 8091-8094:8091-8094 -p 11210:11210 couchbase
```

You can then interact with the server using `localhost:8091` and start the server setup.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Couchbase on Kubernetes is by using the [Helm chart](https://github.com/couchbase-partners/helm-charts#deploying-for-development-quick-start):

```
helm repo add couchbase https://couchbase-partners.github.io/helm-charts/
helm install couchbase/couchbase-operator
helm install couchbase/couchbase-cluster
```
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
