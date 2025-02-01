---
type: docs
title: "在自托管环境中卸载 Dapr"
linkTitle: "卸载 Dapr"
weight: 60000
description: "从本地机器中移除 Dapr 的步骤"
---

以下 CLI 命令用于移除 Dapr sidecar 二进制文件和 placement 容器：

```bash
dapr uninstall
```
上述命令不会移除在 `dapr init` 时默认安装的 Redis 或 Zipkin 容器，以防您将它们用于其他用途。要移除 Redis、Zipkin、actor placement 容器，以及位于 `$HOME/.dapr` 或 `%USERPROFILE%\.dapr\` 的默认 Dapr 目录，请运行以下命令：

```bash
dapr uninstall --all
```

{{% alert title="注意" color="primary" %}}
对于 Linux/MacOS 用户，如果您使用 sudo 运行 docker 命令，或者 Dapr 安装在 `/usr/local/bin`（默认安装路径），则需要使用 `sudo dapr uninstall` 来移除 Dapr 二进制文件和/或容器。
{{% /alert %}}