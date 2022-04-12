---
type: docs
title: "RethinkDB"
linkTitle: "RethinkDB"
description: RethinkDB 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-rethinkdb/"
---

## 配置

To setup RethinkDB state store, create a component of type `state.rethinkdb`. See [the how-to guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.rethinkdb
  version: v1
  metadata:
  - name: address
    value: <REPLACE-RETHINKDB-ADDRESS> # Required, e.g. 127.0.0.1:28015 or rethinkdb.default.svc.cluster.local:28015).
  - name: database
    value: <REPLACE-RETHINKDB-DB-NAME> # Required, e.g. dapr (alpha-numerics only)
  - name: table
    value: # Optional
  - name: username
    value: <USERNAME> # Optional
  - name: password
    value: <PASSWORD> # Optional
  - name: archive
    value: bool # Optional (whether or not store should keep archive table of all the state changes)
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

If you wish to use RethinkDB as an actor store, append the following to the YAML.

```yaml
  - name: actorStateStore
    value: "true"
```

RethinkDB state store supports transactions, so it can be used to persist Dapr Actor state. By default, the state will be stored in table named `daprstate` in the specified database.

此外，如果可选的 `archive` 元数据被设置为 `true`，在每个状态改变时，RethinkDB 状态存储将在 `daprstate_archive` 表中记录带有时间戳的状态存储。 这允许对 Dapr 管理的状态进行时间序列分析。

## 元数据字段规范

| 字段       | 必填 | 详情               | 示例                                                                 |
| -------- |:--:| ---------------- | ------------------------------------------------------------------ |
| address  | Y  | RethinkDB 服务器的地址 | `"127.0.0.1:28015"`, `"rethinkdb.default.svc.cluster.local:28015"` |
| database | Y  | 要使用的数据库。 仅限字母数字  | `"dapr"`                                                           |
| table    | 否  | 要使用的表名           | `"table"`                                                          |
| username | 否  | 连接使用的用户名         | `"user"`                                                           |
| password | N  | 连接使用的密码          | `"password"`                                                       |
| archive  | N  | 是否存档表            | `"true"`, `"false"`                                                |

## 设置 RethinkDB

{{< tabs "Self-Hosted" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 [RethinkDB](https://rethinkdb.com/) ：

```
docker run --name rethinkdb -v "$PWD:/rethinkdb-data" -d rethinkdb:latest
```

连接到管理 UI：

```shell
open "http://$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' rethinkdb):8080"
```
{{% /codetab %}}
{{% /codetab %}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- Read [the how-to guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components.
- [State management building block]({{< ref state-management >}}).
