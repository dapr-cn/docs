---
type: 文档
title: "Redis"
linkTitle: "Redis"
weight: 2000
description: "使用 Redis 作为后端状态存储"
---

Dapr 在保存和检索状态时不会改变状态值。 Dapr 要求所有状态存储的实现都遵守特定的关键格式(见 [Dapr 状态管理]({{X16X}}))。 您可以直接与基础存储进行交互以操作状态数据，例如查询状态、创建聚合视图和进行备份。
> **NOTE:** The following examples uses Redis CLI against a Redis store using the default Dapr state store implementation.

## 1. 连接Redis

您可以使用官方 [redis-cli](https://redis.io/topics/rediscli) 或任何其他 Redis 兼容工具连接到 Redis 状态存储以直接查询 Dapr 状态。 如果您正在容器中运行 Redis ，那么使用 redis-cli 的最简单方法是使用容器:

```bash
docker run --rm -it --link <name of the Redis container> redis redis-cli -h <name of the Redis container>
```

## 2. 通过 App ID 列出键

要获取与应用程序"myapp"关联的所有状态键，请使用命令：

```bash
KEYS myapp*
```

上述命令返回现有键的列表，例如：

```bash
1) "myapp||balance"
2) "myapp||amount"
```

## 3. 获取特定状态数据

Dapr 将状态值保存为hash值。 每个hash包含一个 "data" 字段，其中包含状态数据和 "version" 字段，该字段包含作为 ETag的不断递增的版本。

例如，要获取应用程序 "myapp" 的键 "balance" 的状态数据，请使用以下命令:

```bash
HGET myapp||balance data
```

要获取状态version/ETag ，请使用以下命令:

```bash
HGET myapp||balance version
```

## 4. 获取 actor 状态

To get all the state keys associated with an actor with the instance ID "leroy" of actor type "cat" belonging to the application with ID "mypets", use the command:

```bash
KEYS mypets||cat||leroy*
```

And to get a specific actor state such as "food", use the command:

```bash
HGET mypets||cat||leroy||food value
```

> **WARNING:** You should not manually update or delete states in the store. All writes and delete operations should be done via the Dapr runtime.
