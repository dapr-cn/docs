---
type: docs
title: "HashiCorp Consul"
linkTitle: "HashiCorp Consul"
description: 详细介绍了关于 HashiCorp Consul 状态存储 组件的信息
--- 

## 配置

要设置HashiCorp Vault状态存储，请创建一个类型为`state.consul`的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。


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
    value: <REPLACE-WITH-TABLE> # Optional. default: ""
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段            | 必填 | 详情                                      | 示例                                        |
| ------------- |:--:| --------------------------------------- | ----------------------------------------- |
| datacenter    | Y  | Datacenter                              | `"dc1"`                                   |
| httpAddr      | Y  | Consul 服务器地址                            | `"consul.default.svc.cluster.local:8500"` |
| aclToken      | N  | 请求 ACL 令牌。 默认值 `""`                     | `"token"`                                 |
| scheme        | N  | Scheme 是Consul服务器的 URI 方案。 默认值 `"http"` | `"http"`                                  |
| keyPrefixPath | N  | Consul中的密钥前缀路径. 默认值 `""`                | `"dapr"`                                  |

## 搭建 Hashicorp Consul

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行Consul：

```
docker run -d --name=dev-consul -e CONSUL_BIND_INTERFACE=eth0 consul
```

然后您可以使用 `localhost:8500` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 Consul 最简单的方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/stable/consul)：

```
helm install consul stable/consul
```

这将把 Consul 安装到 `default` 命名空间。 要与 Consul 进行交互，请使用以下方法找到服务：`kubectl get svc consul`.

例如，如果使用上面的例子安装，Consul主机地址将是：

`consul.default.svc.cluster.local:8500`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
