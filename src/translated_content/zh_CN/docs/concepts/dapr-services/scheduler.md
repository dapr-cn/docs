---
type: docs
title: "Dapr Scheduler 控制平面服务概述"
linkTitle: "Scheduler"
description: "Dapr Scheduler 服务概述"
---

Dapr Scheduler 服务用于作业调度，可以在[自托管模式]({{< ref self-hosted >}})或[Kubernetes]({{< ref kubernetes >}})上运行。

下图展示了如何通过作业 API 从您的应用程序调用 Scheduler 服务。Scheduler 服务跟踪的所有作业都存储在嵌入式 Etcd 数据库中。

<img src="/images/scheduler/scheduler-architecture.png" alt="展示 Scheduler 控制平面服务和作业 API 的图示">

## actor 提醒

在 Dapr v1.15 之前，[actor 提醒]({{< ref "actors-timers-reminders.md#actor-reminders" >}})是通过 Placement 服务运行的。现在，默认情况下，[`SchedulerReminders` 功能标志]({{< ref "support-preview-features.md#current-preview-features" >}})被设置为 `true`，您创建的所有新 actor 提醒都通过 Scheduler 服务运行，以提高其可扩展性。

当您部署 Dapr v1.15 时，所有现有的 actor 提醒会从 Placement 服务迁移到 Scheduler 服务。这是针对每种 actor 类型的一次性迁移操作。您可以通过在 actor 类型的应用程序配置文件中将 `SchedulerReminders` 标志设置为 `false` 来阻止此迁移。

## 自托管模式

Scheduler 服务的 Docker 容器作为 `dapr init` 的一部分自动启动。如果您在[精简初始化模式]({{< ref self-hosted-no-docker.md >}})下运行，也可以手动作为进程运行。

## Kubernetes 模式

Scheduler 服务作为 `dapr init -k` 的一部分或通过 Dapr Helm 图表部署。您可以在高可用性模式下运行 Scheduler。[了解更多关于在 Kubernetes 服务中设置高可用性模式的信息。]({{< ref "kubernetes-production.md#individual-service-ha-helm-configuration" >}})

有关在 Kubernetes 上运行 Dapr 的更多信息，请访问[Kubernetes 托管页面]({{< ref kubernetes >}})。

## 相关链接

[了解更多关于作业 API 的信息。]({{< ref jobs_api.md >}})
