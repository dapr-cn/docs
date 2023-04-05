---
type: docs
title: "Memcached"
linkTitle: "Memcached"
description: Memcached 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-memcached/"
---

## Component format

To setup Memcached state store create a component of type `state.memcached`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field              | 必填 | 详情                        | 示例                                            |
| ------------------ |:--:| ------------------------- | --------------------------------------------- |
| hosts              | 是  | Comma delimited endpoints | `"memcached.default.svc.cluster.local:11211"` |
| maxIdleConnections | 否  | 空闲连接的最大数量。 默认值为 `"2"`     | `"3"`                                         |
| timeout            | 否  | 调用超时时间。 默认值为 `"1000ms"`   | `"1000ms"`                                    |

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
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
