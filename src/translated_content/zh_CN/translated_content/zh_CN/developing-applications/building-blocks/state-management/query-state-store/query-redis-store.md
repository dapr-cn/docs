---
type: docs
title: "Redis"
linkTitle: "Redis"
weight: 2000
description: "使用 Redis 作为状态存储"
---

Dapr 在保存和检索状态时不会转换状态值。 Dapr 要求所有的状态存储实现都要遵守特定的密钥格式 (参见[Dapr 状态管理规范]({{< ref state_api.md >}}))。 您可以直接与底层存储交互，以操纵状态数据，例如：

- 查询状态。
- 创建聚合视图。
- 制作备份。

{{% alert title="Note" color="primary" %}}
以下示例使用 Redis CLI 来查询作为Dapr默认状态存储实现的 Redis 中的状态数据。

{{% /alert %}}

## 连接Redis

您可以使用官方 [redis-cli](https://redis.io/topics/rediscli) 或任何其他 Redis 兼容工具连接到 Redis 状态存储以直接查询 Dapr 状态。 如果您正在容器中运行 Redis ，那么使用 redis-cli 的最简单方法是使用容器:

```bash
docker run --rm -it --link <name of the Redis container> redis redis-cli -h <name of the Redis container>
```

## 通过 App ID 列出键

要获取与应用程序 "myapp" 关联的所有状态，请使用命令：

```bash
KEYS myapp*
```

上述命令返回现有键的列表，例如：

```bash
1) "myapp||balance"
2) "myapp||amount"
```

## 获取特定状态数据

Dapr 将状态值保存为哈希值。 每个哈希值都包含一个"data"字段，其中包含：

- 状态数据。
- 一个"version"字段，其中不断增加的版本用作ETag。

例如，要获取应用程序 "myapp" 的键 "balance" 的状态数据，请使用以下命令:

```bash
HGET myapp||balance data
```

要获取状态 version/ETag ，请使用以下命令:

```bash
HGET myapp||balance version
```

## 读取Actor 状态

要获取应用ID为 "myets"，实例ID为 "leroy"，actor 类型为 "cat" 的相关联所有 actor 的状态键，请使用以下命令:

```bash
KEYS mypets||cat||leroy*
```

要获取特定 actor 状态（如 "food"） ，请使用以下命令:

```bash
HGET mypets||cat||leroy||food value
```

{{% alert title="Warning" color="warning" %}}
不应手动更新或删除存储中的状态。 所有的写入和删除操作都应该通过 Dapr 运行时来完成。 **唯一的例外：**通常需要在状态存储中删除 Actor 记录，_一旦您知道这些不再使用_，以防止未使用的 Actor 实例的累积，这些实例可能永远不会再次加载。

{{% /alert %}}