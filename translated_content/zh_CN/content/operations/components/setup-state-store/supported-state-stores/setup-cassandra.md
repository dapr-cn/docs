---
type: docs
title: "Cassandra"
linkTitle: "Cassandra"
description: Cassandra 状态存储组件的详细信息
--- 

## 配置

要设置 Cassandra 状态存储，请创建一个类型为 `state.cassandra` 的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.cassandra
  version: v1
  metadata:
  - name: hosts
    value: <REPLACE-WITH-COMMA-DELIMITED-HOSTS> # Required. Example: cassandra.cassandra.svc.cluster.local
  - name: username
    value: <REPLACE-WITH-PASSWORD> # Optional. default: ""
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Optional. default: ""
  - name: consistency
    value: <REPLACE-WITH-CONSISTENCY> # Optional. default: "All"
  - name: table
    value: <REPLACE-WITH-TABLE> # Optional. default: "items"
  - name: keyspace
    value: <REPLACE-WITH-KEYSPACE> # Optional. default: "dapr"
  - name: protoVersion
    value: <REPLACE-WITH-PROTO-VERSION> # Optional. default: "4"
  - name: replicationFactor
    value: <REPLACE-WITH-REPLICATION-FACTOR> #  Optional. default: "1"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段                | 必填 | 详情                                    | Example                                    |
| ----------------- |:--:| ------------------------------------- | ------------------------------------------ |
| hosts             | Y  | 主机的逗号分隔值                              | `"cassandra.cassandra.svc.cluster.local"`. |
| port              | N  | 通信端口 默认值：`9042`                       | `"9042"`                                   |
| username          | Y  | 数据库用户名。 无默认值                          | `"user"`                                   |
| password          | Y  | 用户密码                                  | `"password"`                               |
| consistency       | N  | 一致性值                                  | `"All"`, `"Quorum"`                        |
| table             | N  | 表名称 默认值为 `"items"`                    | `"items"`, `"tab"`                         |
| keyspace          | N  | 要使用的cassandra keyspace。 默认值为 `"dapr"` | `"dapr"`                                   |
| protoVersion      | N  | 客户端的 proto 版本。 默认值为 `"4"`             | `"3"`, `"4"`                               |
| replicationFactor | N  | 调用的副本因子。 默认值为 `"1"`                   | `"3"`                                      |

## 配置 Cassandra

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用 DataStax Docker Image 在本地运行Cassandra：

```
docker run -e DS_LICENSE=accept --memory 4g --name my-dse -d datastax/dse-server -g -s -k
```

然后您可以使用 `localhost:9042` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 Cassandra 最简单的方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/incubator/cassandra)：

```
kubectl create namespace cassandra
helm install cassandra incubator/cassandra --namespace cassandra
```

默认情况下，这会将Cassandra安装到 `cassandra·` 命名空间中。 要与 Cassandra 交互，请通过 `kubectl get svc -n cassandra` 找到 service。

例如，如果使用上面的例子安装，Cassandra DNS 将是：

`cassandra.cassandra.svc.cluster.local`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
