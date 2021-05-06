---
type: docs
title: "HashiCorp Consul"
linkTitle: "HashiCorp Consul"
description: Detailed information on the HashiCorp Consul state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-consul/"
--- 

## 配置

To setup Hashicorp Consul state store create a component of type `state.consul`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.consul
  version: v1
  metadata:
  - name: datacenter
    value: <REPLACE-WITH-DATA-CENTER> # Required. Example: dc1
  - name: httpAddr
    value: <REPLACE-WITH-CONSUL-HTTP-ADDRESS> # Required. Example: "consul.default.svc.cluster.local:8500"
  - name: aclToken
    value: <REPLACE-WITH-ACL-TOKEN> # Optional. default: ""
  - name: scheme
    value: <REPLACE-WITH-SCHEME> # Optional. default: "http"
  - name: keyPrefixPath
    value: <REPLACE-WITH-TABLE> # Optional. default: "" Example: dc1
  - name: httpAddr
    value: <REPLACE-WITH-CONSUL-HTTP-ADDRESS> # Required. Example: "consul.default.svc.cluster.local:8500"
  - name: aclToken
    value: <REPLACE-WITH-ACL-TOKEN> # Optional. default: ""
  - name: scheme
    value: <REPLACE-WITH-SCHEME> # Optional. default: "http"
  - name: keyPrefixPath
    value: <REPLACE-WITH-TABLE> # Optional. default: "" Example: dc1
  - name: httpAddr
    value: <REPLACE-WITH-CONSUL-HTTP-ADDRESS> # Required. Example: "consul.default.svc.cluster.local:8500"
  - name: aclToken
    value: <REPLACE-WITH-ACL-TOKEN> # Optional. default: ""
  - name: scheme
    value: <REPLACE-WITH-SCHEME> # Optional. default: "http"
  - name: keyPrefixPath
    value: <REPLACE-WITH-TABLE> # Optional. default: ""
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段            | 必填 | 详情                                                                  | 示例                                        |
| ------------- |:--:| ------------------------------------------------------------------- | ----------------------------------------- |
| datacenter    | Y  | Datacenter to use                                                   | `"dc1"`                                   |
| httpAddr      | Y  | Address of the Consul server                                        | `"consul.default.svc.cluster.local:8500"` |
| aclToken      | N  | Per Request ACL Token. Default is `""`                              | `"token"`                                 |
| scheme        | N  | Scheme is the URI scheme for the Consul server. Default is `"http"` | `"http"`                                  |
| keyPrefixPath | N  | Key prefix path in Consul. Default is `""`                          | `"dapr"`                                  |

## Setup HashiCorp Consul

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Consul locally using Docker:

```
docker run -d --name=dev-consul -e CONSUL_BIND_INTERFACE=eth0 consul
```

然后您可以使用 `localhost:8500` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Consul on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/consul):

```
helm install consul stable/consul
```

This installs Consul into the `default` namespace. To interact with Consul, find the service with: `kubectl get svc consul`.

For example, if installing using the example above, the Consul host address would be:

`consul.default.svc.cluster.local:8500`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
