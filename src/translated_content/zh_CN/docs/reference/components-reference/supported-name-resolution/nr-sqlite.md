---
type: docs
title: "SQLite"
linkTitle: "SQLite"
description: 详细介绍SQLite名称解析组件
---

SQLite名称解析组件可以作为mDNS的替代方案，适用于在单节点环境中运行Dapr以及本地开发场景。集群中的Dapr sidecar会将其信息存储在本地机器上的SQLite数据库中。

{{% alert title="注意" color="primary" %}}

该组件经过优化，适用于所有Dapr实例运行在同一台物理机器上的场景，数据库通过同一个本地挂载的磁盘进行访问。  
通过网络（包括SMB/NFS）使用SQLite名称解析器访问数据库文件可能会导致数据损坏，因此**不支持**。
{{% /alert %}}

## 配置格式

名称解析通过[Dapr配置]({{< ref configuration-overview.md >}})进行设置。

在配置YAML中，将`spec.nameResolution.component`属性设置为`"sqlite"`，然后在`spec.nameResolution.configuration`字典中传递配置选项。

以下是一个基本的配置示例：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "sqlite"
    version: "v1"
    configuration:
      connectionString: "/home/user/.dapr/nr.db"
```

## 规格配置字段

使用SQLite名称解析组件时，`spec.nameResolution.configuration`字典包含以下选项：

| 字段        | 必需 | 类型 | 详情  | 示例 |
|--------------|:--------:|-----:|:---------|----------|
| `connectionString` | Y | `string` | SQLite数据库的连接字符串。通常，这是磁盘上文件的路径，可以是相对路径或绝对路径。 | `"nr.db"`（相对于工作目录），`"/home/user/.dapr/nr.db"` |
| `updateInterval` | N | [Go duration](https://pkg.go.dev/time#ParseDuration) (作为`string`) | 活跃的Dapr sidecar在数据库中更新其状态的间隔，用作健康检查。<br>较小的间隔减少了应用程序离线时返回过时数据的可能性，但增加了数据库的负载。<br>必须至少比`timeout`大1秒。带有秒数分数的值会被截断（例如，`1500ms`变为`1s`）。默认值：`5s` | `"2s"` |
| `timeout` | N | [Go duration](https://pkg.go.dev/time#ParseDuration) (作为`string`)。<br>必须至少为1秒。 | 数据库操作的超时时间。整数被解释为秒数。默认值为`1s` | `"2s"`，`2` |
| `tableName` | N | `string` | 存储数据的表的名称。如果表不存在，Dapr会创建该表。默认值为`hosts`。 | `"hosts"` |
| `metadataTableName` | N | `string` | Dapr用于存储组件元数据的表的名称。如果表不存在，Dapr会创建该表。默认值为`metadata`。 | `"metadata"` |
| `cleanupInterval` | N | [Go duration](https://pkg.go.dev/time#ParseDuration) (作为`string`) | 从数据库中删除过时记录的间隔。默认值：`1h`（1小时） | `"10m"` |
| `busyTimeout` | N | [Go duration](https://pkg.go.dev/time#ParseDuration) (作为`string`) | 在SQLite数据库当前忙于处理另一个请求时等待的间隔，然后返回“数据库忙”错误。这是一个高级设置。</br>`busyTimeout`控制SQLite中的锁定工作方式。对于SQLite，写入是独占的，因此每次任何应用程序写入时，数据库都会被锁定。如果另一个应用程序尝试写入，它会等待最多`busyTimeout`时间，然后返回“数据库忙”错误。然而，`timeout`设置控制整个操作的超时时间。例如，如果查询“挂起”，在数据库获取锁之后（即在忙超时清除之后），则`timeout`生效。默认值：`800ms`（800毫秒） | `"100ms"` |
| `disableWAL` | N | `bool` | 如果设置为true，则禁用SQLite数据库的预写日志记录。这仅适用于高级场景 | `true`，`false` |

## 相关链接

- [服务调用构建块]({{< ref service-invocation >}})
