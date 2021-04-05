---
type: docs
title: "RethinkDB"
linkTitle: "RethinkDB"
description: Detailed information on the RethinkDB state store component
---

## Component format

To setup RethinkDB state store create a component of type `state.rethinkdb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration. To setup SQL Server state store create a component of type `state.sqlserver`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

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
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

If you wish to use Redis as an actor store, append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```


RethinkDB state store supports transactions so it can be used to persist Dapr Actor state. By default, the state will be stored in table name `daprstate` in the specified database. By default, the state will be stored in table name `daprstate` in the specified database. By default, the state will be stored in table name `daprstate` in the specified database.

Additionally, if the optional `archive` metadata is set to `true`, on each state change, the RethinkDB state store will also log state changes with timestamp in the `daprstate_archive` table. This allows for time series analyses of the state managed by Dapr. This allows for time series analyses of the state managed by Dapr. This allows for time series analyses of the state managed by Dapr.

## Spec metadata fields

| 字段       | Required | Details                                                                           | Example                                                            |
| -------- |:--------:| --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| address  |    Y     | The address for RethinkDB server                                                  | `"127.0.0.1:28015"`, `"rethinkdb.default.svc.cluster.local:28015"` |
| database |    Y     | The database to use. The database to use. Alpha-numerics only Alpha-numerics only | `"dapr"`                                                           |
| table    |    N     | The table name to use                                                             | `"table"`                                                          |
| username |    N     | The username to connect with                                                      | `"user"`                                                           |
| password |    N     | The password to connect with                                                      | `"password"`                                                       |
| archive  |    N     | Whether or not to archive the table                                               | `"true"`, `"false"`                                                |

## Setup RethinkDB

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
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
