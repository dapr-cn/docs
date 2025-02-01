---
type: docs
title: "SQLite"
linkTitle: "SQLite"
description: SQLite 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-sqlite/"
---

此组件支持使用 SQLite 3 作为 Dapr 的状态存储。

> 该组件目前使用 SQLite 版本 3.41.2 编译。

## 创建一个 Dapr 组件

创建一个名为 `sqlite.yaml` 的文件，并粘贴以下内容，将 `<CONNECTION STRING>` 替换为您的连接字符串，即磁盘上文件的路径。

如果您还想配置 SQLite 来存储 actor，请在下例中添加 `actorStateStore` 选项。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.sqlite
  version: v1
  metadata:
  # 连接字符串
  - name: connectionString
    value: "data.db"
  # 数据库操作的超时时间，以秒为单位（可选）
  #- name: timeoutInSeconds
  #  value: 20
  # 存储状态的表名（可选）
  #- name: tableName
  #  value: "state"
  # 清理过期行的间隔时间，以秒为单位（可选）
  #- name: cleanupInterval
  #  value: "1h"
  # 设置数据库操作的忙等待时间
  #- name: busyTimeout
  #  value: "2s"
  # 如果希望使用 SQLite 作为 actor 的状态存储，请取消注释此行（可选）
  #- name: actorStateStore
  #  value: "true"
```

## 规格元数据字段

| 字段 | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `connectionString` | Y | SQLite 数据库的连接字符串。详见下文。 | `"path/to/data.db"`, `"file::memory:?cache=shared"` |
| `timeout` | N | 数据库操作的超时时间，格式为 [Go duration](https://pkg.go.dev/time#ParseDuration)。整数被解释为秒数。默认值为 `20s` | `"30s"`, `30` |
| `tableName` | N | 存储数据的表名。默认值为 `state`。 | `"state"` |
| `metadataTableName` | N | Dapr 用于存储组件元数据的表名。默认值为 `metadata`。 | `"metadata"` |
| `cleanupInterval` | N | 清理过期 TTL 行的间隔时间，格式为 [Go duration](https://pkg.go.dev/time#ParseDuration)。设置为 <=0 的值将禁用定期清理。默认值：`0`（即禁用） | `"2h"`, `"30m"`, `-1` |
| `busyTimeout` | N | 在 SQLite 数据库当前忙于处理其他请求时等待的时间间隔，格式为 [Go duration](https://pkg.go.dev/time#ParseDuration)，然后返回“数据库忙”错误。默认值：`2s` | `"100ms"`, `"5s"` |
| `disableWAL` | N | 如果设置为 true，则禁用 SQLite 数据库的预写日志记录。若数据库存储在网络文件系统上（例如，作为 SMB 或 NFS 共享挂载的文件夹），应将此设置为 `false`。此选项在只读或内存数据库中被忽略。 | `"true"`, `"false"` |
| `actorStateStore` | N | 将此状态存储视为 actor 的状态存储。默认值为 `"false"` | `"true"`, `"false"` |

**`connectionString`** 参数用于配置如何打开 SQLite 数据库。

- 通常，这是磁盘上文件的路径，可以是相对于当前工作目录的相对路径或绝对路径。例如：`"data.db"`（相对于工作目录）或 `"/mnt/data/mydata.db"`。
- 路径由 SQLite 库解释，因此如果路径以 `file:` 开头，可以使用“URI 选项”传递其他选项给 SQLite 驱动程序。例如：`"file:path/to/data.db?mode=ro"` 以只读模式打开路径 `path/to/data.db` 下的数据库。[请参阅 SQLite 文档以获取所有支持的 URI 选项](https://www.sqlite.org/uri.html)。
- 特殊情况 `":memory:"` 启动由内存 SQLite 数据库支持的组件。此数据库不会持久化到磁盘，不会在多个 Dapr 实例之间共享，并且当 Dapr sidecar 停止时，所有数据都会丢失。使用内存数据库时，Dapr 会自动设置 `cache=shared` URI 选项。

## 高级

### TTL 和清理

此状态存储支持 Dapr 存储记录的 [生存时间 (TTL)]({{< ref state-store-ttl.md >}})。使用 Dapr 存储数据时，您可以设置 `ttlInSeconds` 元数据属性以指示数据何时应被视为“过期”。

由于 SQLite 没有内置的 TTL 支持，Dapr 通过在状态表中添加一列来实现这一功能，该列指示数据何时应被视为“过期”。即使记录仍然物理存储在数据库中，过期的记录也不会返回给调用者。后台“垃圾收集器”会定期扫描状态表以查找过期行并删除它们。

`cleanupInterval` 元数据属性设置过期记录的删除间隔，默认情况下禁用。

- 较长的间隔需要较少频繁地扫描过期行，但可能导致数据库存储过期记录的时间更长，可能需要更多的存储空间。如果您计划在状态表中存储许多记录，并且 TTL 较短，请考虑将 `cleanupInterval` 设置为较小的值，例如 `5m`。
- 如果您不打算在 Dapr 和 SQLite 状态存储中使用 TTL，您应考虑将 `cleanupInterval` 设置为 <= 0 的值（例如 `0` 或 `-1`）以禁用定期清理并减少数据库的负载。这是默认行为。

状态表中存储记录过期日期的 `expiration_time` 列**默认没有索引**，因此每次定期清理都必须执行全表扫描。如果您有一个包含大量记录的表，并且只有其中的一部分使用 TTL，您可能会发现为该列创建索引很有用。假设您的状态表名为 `state`（默认值），您可以使用以下查询：

```sql
CREATE INDEX idx_expiration_time
  ON state (expiration_time);
```

> Dapr 不会自动 [vacuum](https://www.sqlite.org/lang_vacuum.html) SQLite 数据库。

### 共享 SQLite 数据库和使用网络文件系统

虽然您可以让多个 Dapr 实例访问同一个 SQLite 数据库（例如，因为您的应用程序水平扩展或因为您有多个应用程序访问同一个状态存储），但您应该注意一些注意事项。

SQLite 最适合所有客户端在同一个本地挂载的磁盘上访问数据库文件。使用从 SAN（存储区域网络）挂载的虚拟磁盘是可以的，这在虚拟化或云环境中是常见做法。

然而，将您的 SQLite 数据库存储在网络文件系统中（例如通过 NFS 或 SMB，但这些示例并不是详尽无遗的）应谨慎进行。官方 SQLite 文档有一页专门介绍 [在网络上运行 SQLite 的建议和注意事项](https://www.sqlite.org/useovernet.html)。

鉴于在网络文件系统（例如通过 NFS 或 SMB）上运行 SQLite 可能导致的数据损坏风险，我们不建议在生产环境中使用 Dapr 这样做。然而，如果您确实想这样做，您应该将 SQLite Dapr 组件配置为 `disableWAL` 设置为 `true`。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
