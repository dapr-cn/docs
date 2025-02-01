---
type: docs
title: "在自托管环境中升级 Dapr 的步骤"
linkTitle: "升级 Dapr"
weight: 50000
description: "按照这些步骤在自托管模式下升级 Dapr，确保升级过程顺利"
---

1. 卸载当前的 Dapr 部署：

   {{% alert title="注意" color="warning" %}}
   这将删除默认的 `$HOME/.dapr` 目录、二进制文件和所有容器（dapr_redis、dapr_placement 和 dapr_zipkin）。如果在 Linux 上运行 docker 命令需要使用 sudo，请使用 `sudo`。
   {{% /alert %}}

   ```bash
   dapr uninstall --all
   ```

1. 访问[本指南]({{< ref install-dapr-cli.md >}})以下载并安装最新版本的 CLI。

1. 初始化 Dapr 运行时：

   ```bash
   dapr init
   ```

1. 确认您正在使用最新版本的 Dapr (v{{% dapr-latest-version long="true" %}})：

   ```bash
   $ dapr --version

   CLI version: {{% dapr-latest-version short="true" %}}
   Runtime version: {{% dapr-latest-version short="true" %}}
   