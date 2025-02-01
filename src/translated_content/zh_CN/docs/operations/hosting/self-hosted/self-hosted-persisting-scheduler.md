---
type: docs
title: "操作指南：持久化调度器作业"
linkTitle: "操作指南：持久化调度器作业"
weight: 50000
description: "配置调度器以持久化其数据库，使其在重启时具有弹性"
---

[调度器]({{< ref scheduler.md >}})服务负责将作业写入嵌入式数据库并进行调度执行。
默认情况下，调度器服务会将数据写入本地卷`dapr_scheduler`，这意味着**数据在重启时会被持久化**。

此本地卷的主机文件位置通常位于`/var/lib/docker/volumes/dapr_scheduler/_data`或`~/.local/share/containers/storage/volumes/dapr_scheduler/_data`，具体取决于您的容器运行时。
请注意，如果您使用的是Docker Desktop，此卷位于Docker Desktop虚拟机的文件系统中，可以通过以下命令访问：

```bash
docker run -it --privileged --pid=host debian nsenter -t 1 -m -u -n -i sh
```

调度器的持久卷可以通过使用预先存在的自定义卷进行修改，或者由Dapr自动创建。

{{% alert title="注意" color="primary" %}}
默认情况下，`dapr init`会在您的驱动器上创建一个名为`dapr_scheduler`的本地持久卷。如果Dapr已经安装，您需要完全[卸载]({{< ref dapr-uninstall.md >}})控制平面，然后才能使用新的持久卷重新创建调度器容器。
{{% /alert %}}

```bash
dapr init --scheduler-volume my-scheduler-volume
```
