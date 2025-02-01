---
type: docs
title: "Cassandra"
linkTitle: "Cassandra"
description: Cassandra 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-cassandra/"
---

## 组件格式

要配置 Cassandra 状态存储组件，请创建一个类型为 `state.cassandra` 的组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})以了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.cassandra
  version: v1
  metadata:
  - name: hosts
    value: <用逗号分隔的主机列表> # 必需。示例：cassandra.cassandra.svc.cluster.local
  - name: username
    value: <用户名> # 可选。默认值：""
  - name: password
    value: <密码> # 可选。默认值：""
  - name: consistency
    value: <一致性级别> # 可选。默认值："All"
  - name: table
    value: <表名> # 可选。默认值："items"
  - name: keyspace
    value: <键空间> # 可选。默认值："dapr"
  - name: protoVersion
    value: <协议版本> # 可选。默认值："4"
  - name: replicationFactor
    value: <复制因子> # 可选。默认值："1"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来存储秘密信息。建议使用秘密存储来保护这些信息，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 说明 | 示例 |
|--------------------|:--------:|---------|---------|
| hosts             | 是        | 用逗号分隔的主机列表 | `"cassandra.cassandra.svc.cluster.local"`。
| port              | 否        | 通信端口。默认值为 `"9042"` | `"9042"`
| username          | 是        | 数据库用户的用户名。无默认值 | `"user"`
| password          | 是        | 用户的密码  | `"password"`
| consistency       | 否        | 一致性级别 | `"All"`，`"Quorum"`
| table             | 否        | 表名。默认值为 `"items"` | `"items"`，`"tab"`
| keyspace          | 否        | 要使用的 Cassandra 键空间。默认值为 `"dapr"` | `"dapr"`
| protoVersion      | 否        | 客户端的协议版本。默认值为 `"4"` | `"3"`，`"4"`
| replicationFactor | 否        | 复制因子。默认值为 `"1"` | `"3"`

## 设置 Cassandra

{{< tabs "自托管" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Datastax 的 Docker 镜像在本地运行 Cassandra：

```
docker run -e DS_LICENSE=accept --memory 4g --name my-dse -d datastax/dse-server -g -s -k
```

然后可以通过 `localhost:9042` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 Cassandra 的最简单方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/incubator/cassandra)：

```
kubectl create namespace cassandra
helm install cassandra incubator/cassandra --namespace cassandra
```

这会默认将 Cassandra 安装到 `cassandra` 命名空间中。
要与 Cassandra 交互，请使用以下命令查找服务：`kubectl get svc -n cassandra`。

例如，如果使用上述示例进行安装，Cassandra 的 DNS 将是：

`cassandra.cassandra.svc.cluster.local`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
