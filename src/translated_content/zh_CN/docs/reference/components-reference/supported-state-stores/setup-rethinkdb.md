---
type: docs
title: "RethinkDB"
linkTitle: "RethinkDB"
description: RethinkDB 状态存储组件的详细介绍
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-rethinkdb/"
---

## 组件格式

要配置 RethinkDB 状态存储，创建一个类型为 `state.rethinkdb` 的组件。请参阅[操作指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})以创建和应用状态存储配置。

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
    value: <REPLACE-RETHINKDB-ADDRESS> # 必需，例如 127.0.0.1:28015 或 rethinkdb.default.svc.cluster.local:28015。
  - name: database
    value: <REPLACE-RETHINKDB-DB-NAME> # 必需，例如 dapr（仅限字母数字）
  - name: table
    value: # 可选
  - name: username
    value: <USERNAME> # 可选
  - name: password
    value: <PASSWORD> # 可选
  - name: archive
    value: bool # 可选（是否保留所有状态更改的存档表）
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 以明文字符串形式使用。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

如果可选的 `archive` 元数据设置为 `true`，则每次状态更改时，RethinkDB 状态存储还将在 `daprstate_archive` 表中记录带有时间戳的状态更改。这允许对 Dapr 管理的状态进行时间序列分析。

## 元数据字段说明

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| address            | Y        | RethinkDB 服务器的地址 | `"127.0.0.1:28015"`，`"rethinkdb.default.svc.cluster.local:28015"`
| database           | Y        | 要使用的数据库。仅限字母数字 | `"dapr"`
| table              | N        | 要使用的表名 | `"table"`
| username           | N        | 用于连接的用户名 | `"user"`
| password           | N        | 用于连接的密码 | `"password"`
| archive            | N        | 是否保留存档表 | `"true"`，`"false"`

## 设置 RethinkDB

{{< tabs "Self-Hosted" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 [RethinkDB](https://rethinkdb.com/)：

```
docker run --name rethinkdb -v "$PWD:/rethinkdb-data" -d rethinkdb:latest
```

要连接到管理 UI：

```shell
open "http://$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' rethinkdb):8080"
```
{{% /codetab %}}
{{% /codetab %}}

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[操作指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明。
- [状态管理构建块]({{< ref state-management >}})。
