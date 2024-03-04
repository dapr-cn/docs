---
type: docs
title: "分布式锁概述"
linkTitle: "概述"
weight: 1000
description: "分布式锁应用程序接口构件概述"
---

## 介绍
锁用于提供对资源的互斥访问。 例如，您可以使用锁来

- 提供对数据库行、表或整个数据库的独占访问权限
- 锁定从队列中按顺序读取信息

任何发生更新的共享资源都可能成为锁的目标。 锁通常用于改变状态的操作，而不是读取操作。

每个锁都有一个名字。 应用程序决定命名锁访问的资源。 通常情况下，同一应用程序的多个实例都会使用这个命名锁来专门访问资源和执行更新。

例如，在竞争消费者模式中，应用程序的多个实例访问一个队列。 您可以决定在应用程序运行业务逻辑时锁定队列。

在下图中，同一应用程序的两个实例 `App1`，使用 [Redis 锁组件]({{< ref redis-lock >}}) 对共享资源加锁。

- 第一个应用程序实例会获取指定的锁，并获得独占访问权。
- 第二个应用程序实例无法获取锁，因此在释放锁之前也无法访问资源：
   - 由应用程序通过解锁应用程序接口明示，或
   - 一段时间后，由于租约超时。

<img src="/images/lock-overview.png" width=900>

*This API is currently in `Alpha` state.

## 特性

### 相互独占资源
在任何时刻，只有一个应用程序实例可以持有命名锁。 锁的作用域是 Dapr 应用程序标识。

### 利用租约消除僵局
Dapr 分布式锁使用基于租赁的锁定机制。 如果应用程序获取了一个锁，遇到异常并无法释放该锁，该锁会在一段时间后通过租约自动释放。 这样就能在应用程序发生故障时防止资源死锁。

## 例子

观看 [这段视频，了解分布式锁 API 的概述](https://youtu.be/wLYYOJLt_KQ?t=583)：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/wLYYOJLt_KQ?start=583" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 下一步

关注以下指南：
- [操作方法：在应用程序中使用分布式锁]({{< ref howto-use-distributed-lock.md >}})

