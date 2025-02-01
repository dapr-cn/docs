---
type: docs
title: "CockroachDB"
linkTitle: "CockroachDB"
description: CockroachDB 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-cockroachdb/"
---

## 创建一个 Dapr 组件

创建一个名为 `cockroachdb.yaml` 的文件，粘贴以下内容并将 `<CONNECTION STRING>` 值替换为您的连接字符串。CockroachDB 的连接字符串与 PostgreSQL 的连接字符串标准相同。例如，`"host=localhost user=root port=26257 connect_timeout=10 database=dapr_test"`。有关如何定义连接字符串的信息，请参阅 CockroachDB [数据库连接文档](https://www.cockroachlabs.com/docs/stable/connect-to-the-database.html)。

如果您还想配置 CockroachDB 来存储 actor 状态，请添加 `actorStateStore` 选项，如下面的示例所示。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.cockroachdb
  version: v1
  metadata:
  # 连接字符串
  - name: connectionString
    value: "<CONNECTION STRING>"
  # 数据库操作的超时时间，以秒为单位（可选）
  #- name: timeoutInSeconds
  #  value: 20
  # 存储状态的表名（可选）
  #- name: tableName
  #  value: "state"
  # Dapr 使用的元数据存储表名（可选）
  #- name: metadataTableName
  #  value: "dapr_metadata"
  # 清理过期行的间隔时间，以秒为单位（可选）
  #- name: cleanupIntervalInSeconds
  #  value: 3600
  # 连接关闭前的最大空闲时间（可选）
  #- name: connectionMaxIdleTime
  #  value: 0
  # 如果希望使用 CockroachDB 作为 actor 的状态存储，请取消注释此行（可选）
  #- name: actorStateStore
  #  value: "true"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来存储 secret。建议使用 secret 存储来保护 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规格元数据字段

| 字段                  | 必需 | 详情 | 示例 |
|--------------------|:----:|-----|-----|
| `connectionString` | Y | CockroachDB 的连接字符串 | `"host=localhost user=root port=26257 connect_timeout=10 database=dapr_test"`
| `timeoutInSeconds` | N | 所有数据库操作的超时时间，以秒为单位。默认值为 `20` | `30`
| `tableName` | N | 存储数据的表名。默认值为 `state`。可以选择性地在前面加上模式名称，如 `public.state` | `"state"`, `"public.state"`
| `metadataTableName` | N | Dapr 用于存储一些元数据属性的表名。默认值为 `dapr_metadata`。可以选择性地在前面加上模式名称，如 `public.dapr_metadata` | `"dapr_metadata"`, `"public.dapr_metadata"`
| `cleanupIntervalInSeconds` | N | 清理具有过期 TTL 的行的间隔时间，以秒为单位。默认值：`3600`（即 1 小时）。将此值设置为 <=0 可禁用定期清理。 | `1800`, `-1`
| `connectionMaxIdleTime` | N | 在连接池中未使用的连接自动关闭前的最大空闲时间。默认情况下，没有值，由数据库驱动程序选择。 | `"5m"`
| `actorStateStore` | N | 将此状态存储视为 actor 的状态存储。默认值为 `"false"` | `"true"`, `"false"`

## 设置 CockroachDB

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

1. 运行一个 CockroachDB 实例。您可以使用以下命令在 Docker CE 中运行 CockroachDB 的本地实例：

     此示例不适用于生产环境，因为它设置了一个单节点集群，仅推荐用于本地开发和测试。

     ```bash
     docker run --name roach1 -p 26257:26257 cockroachdb/cockroach:v21.2.3 start-single-node --insecure
     ```

2. 为状态数据创建一个数据库。

    要在 CockroachDB 中创建一个新数据库，请在容器内运行以下 SQL 命令：

    ```bash
    docker exec -it roach1 ./cockroach sql --insecure -e 'create database dapr_test'
    ```
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 CockroachDB 的最简单方法是使用 [CockroachDB Operator](https://github.com/cockroachdb/cockroach-operator)：
{{% /codetab %}}

{{% /tabs %}}

## 高级

### TTL 和清理

此状态存储支持 Dapr 存储记录的[生存时间 (TTL)]({{< ref state-store-ttl.md >}})。使用 Dapr 存储数据时，您可以设置 `ttlInSeconds` 元数据属性，以指示数据在多少秒后应被视为“过期”。

由于 CockroachDB 没有内置的 TTL 支持，您可以通过在状态表中添加一列来实现这一点，该列指示数据何时应被视为“过期”。即使“过期”记录仍然物理存储在数据库中，也不会返回给调用者。后台“垃圾收集器”定期扫描状态表以删除过期的行。

您可以使用 `cleanupIntervalInSeconds` 元数据属性设置删除过期记录的间隔时间，默认为 3600 秒（即 1 小时）。

- 较长的间隔需要较少频繁地扫描过期行，但可能需要更长时间存储过期记录，可能需要更多的存储空间。如果您计划在状态表中存储许多记录，并且 TTL 较短，请考虑将 `cleanupIntervalInSeconds` 设置为较小的值，例如 `300`（300 秒或 5 分钟）。
- 如果您不打算在 Dapr 和 CockroachDB 状态存储中使用 TTL，您应考虑将 `cleanupIntervalInSeconds` 设置为 <= 0（例如 `0` 或 `-1`）以禁用定期清理并减少数据库的负载。

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取有关配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
