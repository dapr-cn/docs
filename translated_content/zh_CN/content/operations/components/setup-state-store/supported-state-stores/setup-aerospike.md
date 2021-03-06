---
type: docs
title: "Aerospike"
linkTitle: "Aerospike"
description: Detailed information on the Aerospike state store component
---

## Component format

To setup Aerospike state store create a component of type `state.Aerospike`. To setup SQL Server state store create a component of type `state.sqlserver`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.Aerospike
  version: v1
  metadata:
  - name: hosts
    value: <REPLACE-WITH-HOSTS> # Required. A comma delimited string of hosts. Example: "aerospike:3000,aerospike2:3000"
  - name: namespace
    value: <REPLACE-WITH-NAMESPACE> # Required. The aerospike namespace.
  - name: set
    value: <REPLACE-WITH-SET> # Optional A comma delimited string of hosts. Example: "aerospike:3000,aerospike2:3000"
  - name: namespace
    value: <REPLACE-WITH-NAMESPACE> # Required. The aerospike namespace.
  - name: set
    value: <REPLACE-WITH-SET> # Optional
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段        | Required | Details                           | Example                                                |
| --------- |:--------:| --------------------------------- | ------------------------------------------------------ |
| hosts     |    Y     | Host name/port of database server | `"localhost:3000"`, `"aerospike:3000,aerospike2:3000"` |
| namespace |    Y     | The Aerospike namespace           | `"namespace"`                                          |
| set       |    N     | The setName in the database       | `"myset"`                                              |

## Setup Aerospike

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Aerospike locally using Docker:

```
docker run -d --name aerospike -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 3003:3003 aerospike
```

You can then interact with the server using `localhost:3000`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Aerospike on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/aerospike):

```
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm install --name my-aerospike --namespace aerospike stable/aerospike
```

This installs Aerospike into the `aerospike` namespace. This installs Aerospike into the `aerospike` namespace. To interact with Aerospike, find the service with: `kubectl get svc aerospike -n aerospike`.

For example, if installing using the example above, the Aerospike host address would be:

`aerospike-my-aerospike.aerospike.svc.cluster.local:3000`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
