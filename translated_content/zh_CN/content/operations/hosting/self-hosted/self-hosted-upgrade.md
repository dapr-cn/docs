---
type: docs
title: "在自托管环境中升级 Dapr 的步骤"
linkTitle: "升级 Dapr"
weight: 40000
description: "按照这些步骤在自托管模式下升级 Dapr，并确保顺利升级"
---


1. 卸载当前的Dapr部署：

   {{% alert title="Note" color="warning" %}}
   这将删除默认 `$HOME/.dapr` 目录、 二进制文件和所有容器 (dapr_redis、 dapr_placement 和 dapr_zipkin)。 如果docker 命令需要sudo，Linux 用户需要运行 `sudo` 。
   {{% /alert %}}

   ```bash
   dapr uninstall --all
   ```

1. 通过访问[本指南]({{< ref install-dapr-cli.md >}})下载并安装最新的 CLI。

1. 初始化 Dapr 运行时：

   ```bash
   dapr init
   ```

1. 确保您使用了 Dapr 的最新版本 (v{{% dapr-latest-version long="true" %}}))：

   ```bash
   $ dapr --version

   CLI version: {{% dapr-latest-version short="true" %}}
   Runtime version: {{% dapr-latest-version short="true" %}}
   ```
