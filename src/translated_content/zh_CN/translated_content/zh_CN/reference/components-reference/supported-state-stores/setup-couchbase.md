---
type: docs
title: "Couchbase"
linkTitle: "Couchbase"
description: Couchbase 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-couchbase/"
---

## Component format

To setup Couchbase state store create a component of type `state.couchbase`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field        | 必填 | 详情                              | 示例                        |
| ------------ |:--:| ------------------------------- | ------------------------- |
| couchbaseURL | 是  | The URL of the Couchbase server | `"http://localhost:8091"` |
| username     | 是  | 数据库的用户名                         | `"user"`                  |
| password     | 是  | 用于访问的密码                         | `"password"`              |
| bucketName   | 是  | 要写入的 bucket 名称                  | `"bucket"`                |

## 设置 Couchbase

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
你可以使用 Docker 在本地运行 Couchbase：

```
docker run -d --name db -p 8091-8094:8091-8094 -p 11210:11210 couchbase
```

然后，您可以使用 `localhost:8091` 与服务器交互并开始服务器设置。
{{% /codetab %}}

{{% codetab %}}
在 Kuberntes 上安装 Couchbase 最简单的方法是使用 [Helm chart](https://github.com/couchbase-partners/helm-charts#deploying-for-development-quick-start):

```
helm repo add couchbase https://couchbase-partners.github.io/helm-charts/
helm install couchbase/couchbase-operator
helm install couchbase/couchbase-cluster
```
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
