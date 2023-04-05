---
type: docs
title: "在自托管环境中升级 Dapr 的步骤"
linkTitle: "升级 Dapr"
weight: 40000
description: "按照这些步骤在自托管模式下升级 Dapr，并确保顺利升级"
---


1. Uninstall the current Dapr deployment:

   {{% alert title="Note" color="warning" %}}
   This will remove the default `$HOME/.dapr` directory, binaries and all containers (dapr_redis, dapr_placement and dapr_zipkin). Linux users need to run `sudo` if    docker command needs sudo.
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
