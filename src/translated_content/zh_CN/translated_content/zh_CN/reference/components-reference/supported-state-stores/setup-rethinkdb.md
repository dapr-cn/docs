---
type: docs
title: "RethinkDB"
linkTitle: "RethinkDB"
description: RethinkDB 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-rethinkdb/"
---

## Component format

要设置 RethinkDB 状态储存，请创建一个类型为 `state.rethinkdb`的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

If the optional `archive` metadata is set to `true`, on each state change, the RethinkDB state store will also log state changes with timestamp in the `daprstate_archive` table. This allows for time series analyses of the state managed by Dapr.

## 元数据字段规范

| Field    | 必填 | 详情                               | 示例                                                                 |
| -------- |:--:| -------------------------------- | ------------------------------------------------------------------ |
| address  | 是  | The address for RethinkDB server | `"127.0.0.1:28015"`, `"rethinkdb.default.svc.cluster.local:28015"` |
| database | 是  | 要使用的数据库。 仅限字母数字                  | `"dapr"`                                                           |
| table    | 否  | 要使用的表名                           | `"table"`                                                          |
| username | 否  | 连接使用的用户名                         | `"user"`                                                           |
| password | 否  | 连接使用的密码                          | `"password"`                                                       |
| archive  | 否  | 是否存档表                            | `"true"`, `"false"`                                                |

## 设置 RethinkDB

{{< tabs "Self-Hosted" >}}

{{% codetab %}}
You can run [RethinkDB](https://rethinkdb.com/) locally using Docker:

```
docker run --name rethinkdb -v "$PWD:/rethinkdb-data" -d rethinkdb:latest
```

To connect to the admin UI:

```shell
open "http://$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' rethinkdb):8080"
```
{{% /codetab %}}
{{% /codetab %}}

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明.
- [状态管理构建块]({{< ref state-management >}}).
