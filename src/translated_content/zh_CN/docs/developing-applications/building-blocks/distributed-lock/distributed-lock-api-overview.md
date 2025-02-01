---
type: docs
title: "分布式锁概述"
linkTitle: "概述"
weight: 1000
description: "分布式锁API构建模块概述"
---

## 介绍
锁用于确保资源的互斥访问。例如，您可以使用锁来：

- 独占访问数据库的行、表或整个数据库
- 顺序锁定从队列中读取消息

任何需要更新的共享资源都可以被锁定。锁通常用于改变状态的操作，而不是读取操作。

每个锁都有一个名称。应用程序决定锁定哪些资源。通常，同一应用程序的多个实例使用这个命名锁来独占访问资源并进行更新。

例如，在竞争消费者模式中，应用程序的多个实例访问一个队列。您可以选择在应用程序执行其业务逻辑时锁定队列。

在下图中，同一应用程序的两个实例，`App1`，使用[Redis锁组件]({{< ref redis-lock >}})来锁定共享资源。

- 第一个应用程序实例获取命名锁并获得独占访问权。
- 第二个应用程序实例无法获取锁，因此在锁被释放之前不允许访问资源，释放方式可以是：
   - 通过应用程序显式调用解锁API，或
   - 由于租约超时而在一段时间后自动释放。

<img src="/images/lock-overview.png" width=900>

*此API目前处于`Alpha`状态。

## 特性

### 资源的互斥访问
在任何给定时刻，只有一个应用程序实例可以持有命名锁。锁的范围限定在Dapr应用程序ID内。

### 使用租约防止死锁
Dapr分布式锁使用基于租约的锁定机制。如果应用程序获取锁后遇到异常，无法释放锁，则锁将在一段时间后通过租约自动释放。这防止了在应用程序故障时发生资源死锁。

## 演示

观看[此视频以了解分布式锁API的概述](https://youtu.be/wLYYOJLt_KQ?t=583)：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/wLYYOJLt_KQ?start=583" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 下一步

请参阅以下指南：
- [如何在您的应用程序中使用分布式锁]({{< ref howto-use-distributed-lock.md >}})