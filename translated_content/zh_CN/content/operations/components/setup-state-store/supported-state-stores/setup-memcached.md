---
type: docs
title: "Memcached"
linkTitle: "Memcached"
description: Memcached 状态存储组件的详细信息
---

## 配置

要设置 Memcached 状态存储，请创建一个类型为 `state.memcached` 的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.memcached
  version: v1
  metadata:
  - name: hosts
    value: <REPLACE-WITH-COMMA-DELIMITED-ENDPOINTS> # Required. Example: "memcached.default.svc.cluster.local:11211"
  - name: maxIdleConnections
    value: <REPLACE-WITH-MAX-IDLE-CONNECTIONS> # Optional. default: "2"
  - name: timeout
    value: <REPLACE-WITH-TIMEOUT> # Optional. default: "1000ms"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段                 | 必填 | 详情                      | Example                                       |
| ------------------ |:--:| ----------------------- | --------------------------------------------- |
| hosts              | Y  | 逗号分隔的 endpoints         | `"memcached.default.svc.cluster.local:11211"` |
| maxIdleConnections | N  | 空闲连接的最大数量。 默认值为 `"2"`   | `"3"`                                         |
| timeout            | N  | 调用超时时间。 默认值为 `"1000ms"` | `"1000ms"`                                    |

## 设置 Memcached

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 Memcached：

```
docker run --name my-memcache -d memcached
```

然后您可以使用 `localhost:11211` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 Memcached 最简单的方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/stable/memcached)：

```
helm install memcached stable/memcached
```

这将将 Memcached 安装到 `default` 命名空间。 要与 Memcached 交互，请通过 `kubectl get svc memcached` 找到 service。

例如，如果使用上面的例子安装，Memcached 主机地址将是：

`memcached.default.svc.cluster.local:11211`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
