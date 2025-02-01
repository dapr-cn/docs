---
type: docs
title: "Redis"
linkTitle: "Redis"
weight: 2000
description: "使用 Redis 作为状态存储"
---

Dapr 在保存和检索状态时不对状态值进行转换。Dapr 要求所有状态存储实现遵循特定的键格式规范（参见[状态管理规范]({{< ref state_api.md >}})）。您可以直接与底层存储交互以操作状态数据，例如：

- 查询状态。
- 创建聚合视图。
- 进行备份。

{{% alert title="注意" color="primary" %}}
以下示例使用 Redis CLI 针对使用默认 Dapr 状态存储实现的 Redis 存储。

{{% /alert %}}

## 连接到 Redis

您可以使用官方的 [redis-cli](https://redis.io/topics/rediscli) 或任何其他兼容 Redis 的工具连接到 Redis 状态存储以直接查询 Dapr 状态。如果您在容器中运行 Redis，最简单的使用 redis-cli 的方法是通过容器：

```bash
docker run --rm -it --link <Redis 容器的名称> redis redis-cli -h <Redis 容器的名称>
```

## 按应用 ID 列出键

要获取与应用程序 "myapp" 关联的所有状态键，请使用命令：

```bash
KEYS myapp*
```

上述命令返回现有键的列表，例如：

```bash
1) "myapp||balance"
2) "myapp||amount"
```

## 获取特定状态数据

Dapr 将状态值保存为哈希值。每个哈希值包含一个 "data" 字段，其中存储状态数据，以及一个 "version" 字段，作为 ETag，表示不断递增的版本。

例如，要通过键 "balance" 获取应用程序 "myapp" 的状态数据，请使用命令：

```bash
HGET myapp||balance data
```

要获取状态版本/ETag，请使用命令：

```bash
HGET myapp||balance version
```

## 读取 actor 状态

要获取与应用程序 ID 为 "mypets" 的 actor 类型 "cat" 的实例 ID 为 "leroy" 关联的所有状态键，请使用命令：

```bash
KEYS mypets||cat||leroy*
```

要获取特定的 actor 状态，例如 "food"，请使用命令：

```bash
HGET mypets||cat||leroy||food value
```

{{% alert title="警告" color="warning" %}}
您不应手动更新或删除存储中的状态。所有写入和删除操作应通过 Dapr 运行时完成。**唯一的例外：**通常需要在状态存储中删除 actor 记录，_一旦您知道这些记录不再使用_，以防止未使用的 actor 实例积累，这些实例可能永远不会再次加载。

{{% /alert %}}