---
type: docs
title: "Hazelcast"
linkTitle: "Hazelcast"
description: Hazelcast 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-hazelcast/"
---

## Create a Dapr component

要设置 Hazelcast 状态储存，请创建一个类型为 `state.hazelcast`的组件。 See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.hazelcast
  version: v1
  metadata:
  - name: hazelcastServers
    value: <REPLACE-WITH-HOSTS> # Required. A comma delimited string of servers. Example: "hazelcast:3000,hazelcast2:3000"
  - name: hazelcastMap
    value: <REPLACE-WITH-MAP> # Required. Hazelcast map configuration.
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field            | 必填 | 详情               | 示例                                 |
| ---------------- |:--:| ---------------- | ---------------------------------- |
| hazelcastServers | 是  | 逗号分隔的服务器地址       | `"hazelcast:3000,hazelcast2:3000"` |
| hazelcastMap     | 是  | Hazelcast Map 配置 | `"foo-map"`                        |

## 设置 Hazelcast

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
你可以使用Docker在本地运行Hazelcast：

```
docker run -e JAVA_OPTS="-Dhazelcast.local.publicAddress=127.0.0.1:5701" -p 5701:5701 hazelcast/hazelcast
```

然后你可以通过`127.0.0.1:5701`与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在Kubernetes上安装Hazelcast的最简单方法是使用[Helm chart](https://github.com/helm/charts/tree/master/stable/hazelcast)。
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
