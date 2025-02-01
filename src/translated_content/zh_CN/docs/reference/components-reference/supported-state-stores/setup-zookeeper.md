---
type: docs
title: "Zookeeper"
linkTitle: "Zookeeper"
description: Zookeeper 状态存储组件的详细介绍
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-zookeeper/"
---

## 组件格式说明

要设置 Zookeeper 状态存储，您需要创建一个类型为 `state.zookeeper` 的组件。请参考[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.zookeeper
  version: v1
  metadata:
  - name: servers
    value: <REPLACE-WITH-COMMA-DELIMITED-SERVERS> # 必需。示例: "zookeeper.default.svc.cluster.local:2181"
  - name: sessionTimeout
    value: <REPLACE-WITH-SESSION-TIMEOUT> # 必需。示例: "5s"
  - name: maxBufferSize
    value: <REPLACE-WITH-MAX-BUFFER-SIZE> # 可选。默认: "1048576"
  - name: maxConnBufferSize
    value: <REPLACE-WITH-MAX-CONN-BUFFER-SIZE> # 可选。默认: "1048576"
  - name: keyPrefixPath
    value: <REPLACE-WITH-KEY-PREFIX-PATH> # 可选。
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来表示 secret。建议使用 secret 存储来安全地管理这些 secret，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段               | 必需 | 详情 | 示例 |
|--------------------|:----:|------|------|
| servers            | Y    | 逗号分隔的服务器列表 | `"zookeeper.default.svc.cluster.local:2181"`
| sessionTimeout     | Y    | 会话超时时间 | `"5s"`
| maxBufferSize      | N    | 缓冲区的最大大小，默认值为 `"1048576"` | `"1048576"`
| maxConnBufferSize  | N    | 连接缓冲区的最大大小，默认值为 `"1048576"` | `"1048576"`
| keyPrefixPath      | N    | Zookeeper 中的键前缀路径，无默认值 | `"dapr"`

## 设置 Zookeeper

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 Zookeeper：

```
docker run --name some-zookeeper --restart always -d zookeeper
```

然后可以使用 `localhost:2181` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 Zookeeper 的最简单方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/incubator/zookeeper)：

```
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm install zookeeper incubator/zookeeper
```

这会将 Zookeeper 安装到 `default` 命名空间中。
要与 Zookeeper 交互，请使用以下命令查找服务：`kubectl get svc zookeeper`。

例如，如果使用上述示例进行安装，Zookeeper 主机地址将是：

`zookeeper.default.svc.cluster.local:2181`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
