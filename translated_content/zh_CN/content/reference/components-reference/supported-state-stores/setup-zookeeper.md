---
type: docs
title: "Zookeeper"
linkTitle: "Zookeeper"
description: Detailed information on the Zookeeper state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-zookeeper/"
---

## 配置

To setup Zookeeper state store create a component of type `state.zookeeper`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.zookeeper
  version: v1
  metadata:
  - name: servers
    value: <REPLACE-WITH-COMMA-DELIMITED-SERVERS> # Required. Example: "zookeeper.default.svc.cluster.local:2181"
  - name: sessionTimeout
    value: <REPLACE-WITH-SESSION-TIMEOUT> # Required. Example: "5s"
  - name: maxBufferSize
    value: <REPLACE-WITH-MAX-BUFFER-SIZE> # Optional. default: "1048576"
  - name: maxConnBufferSize
    value: <REPLACE-WITH-MAX-CONN-BUFFER-SIZE> # Optional. default: "1048576"
  - name: keyPrefixPath
    value: <REPLACE-WITH-KEY-PREFIX-PATH> # Optional.
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段                | 必填 | 详情                                                             | Example                                      |
| ----------------- |:--:| -------------------------------------------------------------- | -------------------------------------------- |
| servers           | Y  | Comma delimited list of servers                                | `"zookeeper.default.svc.cluster.local:2181"` |
| sessionTimeout    | Y  | The session timeout value                                      | `"5s"`                                       |
| maxBufferSize     | N  | The maximum size of buffer. 默认值为 `"1048576"`                   | `"1048576"`                                  |
| maxConnBufferSize | N  | The maximum size of connection buffer. Defaults to `"1048576`" | `"1048576"`                                  |
| keyPrefixPath     | N  | The key prefix path in Zookeeper. 无默认值                         | `"dapr"`                                     |

## Setup Zookeeper

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Zookeeper locally using Docker:

```
docker run --name some-zookeeper --restart always -d zookeeper
```

然后您可以使用 `localhost:2181` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Zookeeper on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/incubator/zookeeper):

```
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm install zookeeper incubator/zookeeper
```

This installs Zookeeper into the `default` namespace. To interact with Zookeeper, find the service with: `kubectl get svc zookeeper`.

For example, if installing using the example above, the Zookeeper host address would be:

`zookeeper.default.svc.cluster.local:2181`
{{% /codetab %}}

{{< /tabs >}}


## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
