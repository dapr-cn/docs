---
type: docs
title: "Hazelcast"
linkTitle: "Hazelcast"
description: Detailed information on the Hazelcast state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-hazelcast/"
---

## 创建 Dapr 组件

To setup Hazelcast state store create a component of type `state.hazelcast`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.hazelcast
  version: v1
  metadata:
  - name: hazelcastServers
    value: <REPLACE-WITH-HOSTS> # Required. 逗号分隔的服务器地址 Example: "hazelcast:3000,hazelcast2:3000"
  - name: hazelcastMap
    value: <REPLACE-WITH-MAP> # Required. Hazelcast map configuration.
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段               | 必填 | 详情                                  | Example                            |
| ---------------- |:--:| ----------------------------------- | ---------------------------------- |
| hazelcastServers | Y  | A comma delimited string of servers | `"hazelcast:3000,hazelcast2:3000"` |
| hazelcastMap     | Y  | Hazelcast Map configuration         | `"foo-map"`                        |

## Setup Hazelcast

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
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
