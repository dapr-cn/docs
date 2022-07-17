---
type: docs
title: "Redis"
linkTitle: "Redis"
weight: 2000
description: "Use Redis as a state store"
---

Dapr 在保存和检索状态时不会转换状态值。 Dapr requires all state store implementations to abide by a certain key format scheme (see [the state management spec]({{< ref state_api.md >}}). You can directly interact with the underlying store to manipulate the state data, such as:

- Querying states.
- Creating aggregated views.
- Making backups.

{{% alert title="Note" color="primary" %}}
The following examples uses Redis CLI against a Redis store using the default Dapr state store implementation.

{{% /alert %}}

## 连接Redis

You can use the official [redis-cli](https://redis.io/topics/rediscli) or any other Redis compatible tools to connect to the Redis state store to query Dapr states directly. If you are running Redis in a container, the easiest way to use redis-cli is via a container:

```bash
docker run --rm -it --link <name of the Redis container> redis redis-cli -h <name of the Redis container>
```

## 通过 App ID 列出键

要获取与应用程序"myapp"关联的所有状态，请使用命令：

```bash
KEYS myapp*
```

上述命令返回现有键的列表，例如：

```bash
1) "myapp||balance"
2) "myapp||amount"
```

## 获取特定状态数据

Dapr 将状态值保存为哈希值。 Each hash value contains a "data" field, which contains:

- The state data.
- A "version" field, with an ever-incrementing version serving as the ETag.

例如，要获取应用程序 "myapp" 的键 "balance" 的状态数据，请使用以下命令:

```bash
HGET myapp||balance data
```

要获取状态version/ETag ，请使用以下命令:

```bash
HGET myapp||balance version
```

## 获取 actor 状态

要获取应用ID为 "myets "，实例ID为"leroy"，actor类型为"cat"的相关联所有actor的状态键，请使用以下命令:

```bash
KEYS mypets||cat||leroy*
```

To get a specific actor state such as "food", use the command:

```bash
HGET mypets||cat||leroy||food value
```

{{% alert title="Warning" color="warning" %}}
You should not manually update or delete states in the store. 所有的写入和删除操作都应该通过Dapr运行时来完成。 **The only exception:** it is often required to delete actor records in a state store, _once you know that these are no longer in use_, to prevent a build up of unused actor instances that may never be loaded again.

{{% /alert %}}