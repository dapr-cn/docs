---
type: docs
title: "Couchbase"
linkTitle: "Couchbase"
description: Detailed information on the Couchbase state store component
---

## Component format

To setup Couchbase state store create a component of type `state.couchbase`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration. To setup SQL Server state store create a component of type `state.sqlserver`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


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
    value: <REPLACE-WITH-BUCKET> # Required. Example: "http://localhost:8091"
  - name: username
    value: <REPLACE-WITH-USERNAME> # Required.
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Required.
  - name: bucketName
    value: <REPLACE-WITH-BUCKET> # Required.
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段           | Required | Details                         | Example                   |
| ------------ |:--------:| ------------------------------- | ------------------------- |
| couchbaseURL |    Y     | The URL of the Couchbase server | `"http://localhost:8091"` |
| username     |    Y     | The username for the database   | `"user"`                  |
| password     |    Y     | The password for access         | `"password"`              |
| bucketName   |    Y     | The bucket name to write to     | `"bucket"`                |

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
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
