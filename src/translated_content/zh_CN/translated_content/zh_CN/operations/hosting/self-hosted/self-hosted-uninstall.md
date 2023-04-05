---
type: docs
title: "在自托管的环境中卸载 Dapr"
linkTitle: "卸载 Dapr"
weight: 20000
description: "从本地机器中删除 Dapr 的步骤"
---

The following CLI command removes the Dapr sidecar binaries and the placement container:

```bash
dapr uninstall
```
上述命令不会删除在 `dapr init` 期间默认安装的 Redis 或 Zipkin 容器，以防你将它们用于其他目的。 要删除 Redis, Zipkin, Actor Placement 容器，以及位于 `$HOME/.dapr` 或 `%USERPROFILE%\.dapr\`, 运行：

```bash
dapr uninstall --all
```

{{% alert title="Note" color="primary" %}}
对于 Linux/MacOS 用户，如果你用 sudo 运行你的 docker 或安装路径是 `/usr/local/bin`(默认安装路径)， 您需要使用 `sudo dapr uninstall` 移除 Dapr 二进制文件 和/或 容器。
{{% /alert %}}