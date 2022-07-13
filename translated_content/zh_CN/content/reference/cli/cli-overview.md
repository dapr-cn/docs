---
type: docs
title: "Dapr 命令行接口 （CLI） 参考"
linkTitle: "概述"
description: "Dapr CLI 命令的详细信息"
weight: 10
---

Dapr CLI 允许您在本地开发机或Kubernetes集群上安装Dapr。 提供调试支持，启动和管理 Dapr 实例。

```bash

         __                
    ____/ /___ _____  _____
   / __  / __ '/ __ \/ ___/
  / /_/ / /_/ / /_/ / /    
  \__,_/\__,_/ .___/_/     
              /_/            

===============================
Distributed Application Runtime

Usage:
  dapr [command]

Available Commands:
  completion     Generates shell completion scripts
  components     List all Dapr components. Supported platforms: Kubernetes
  configurations List all Dapr configurations. Supported platforms: Kubernetes
  dashboard      Start Dapr dashboard. Supported platforms: Kubernetes and self-hosted
  help           Help about any command
  init           Install Dapr on supported hosting platforms. Supported platforms: Kubernetes and self-hosted
  invoke         Invoke a method on a given Dapr application. Supported platforms: Self-hosted
  list           List all Dapr instances. Supported platforms: Kubernetes and self-hosted
  logs           Get Dapr sidecar logs for an application. Supported platforms: Kubernetes
  mtls           Check if mTLS is enabled. Supported platforms: Kubernetes
  publish        Publish a pub-sub event. Supported platforms: Self-hosted
  run            Run Dapr and (optionally) your application side by side. Supported platforms: Self-hosted
  status         Show the health status of Dapr services. Supported platforms: Kubernetes
  stop           Stop Dapr instances and their associated apps. . Supported platforms: Self-hosted
  uninstall      Uninstall Dapr runtime. Supported platforms: Kubernetes and self-hosted
  upgrade        Upgrades a Dapr control plane installation in a cluster. Supported platforms: Kubernetes

Flags:
  -h, --help      help for dapr
  -v, --version   version for dapr

Use "dapr [command] --help" for more information about a command.
```

## 命令参考

您可以通过以下链接了解有关每个 Dapr 命令的详细信息。

 - [`dapr completion`]({{< ref dapr-completion.md >}})
 - [`dapr components`]({{< ref dapr-components.md >}})
 - [`dapr configurations`]({{< ref dapr-configurations.md >}})
 - [`dapr dashboard`]({{< ref dapr-dashboard.md >}})
 - [`dapr help`]({{< ref dapr-help.md >}})
 - [`dapr init`]({{< ref dapr-init.md >}})
 - [`dapr invoke`]({{< ref dapr-invoke.md >}})
 - [`dapr list`]({{< ref dapr-list.md >}})
 - [`dapr logs`]({{< ref dapr-logs.md >}})
 - [`dapr mtls`]({{< ref dapr-mtls >}})
 - [`dapr publish`]({{< ref dapr-publish.md >}})
 - [`dapr run`]({{< ref dapr-run.md >}})
 - [`dapr status`]({{< ref dapr-status.md >}})
 - [`dapr stop`]({{< ref dapr-stop.md >}})
 - [`dapr uninstall`]({{< ref dapr-uninstall.md >}})
 - [`dapr upgrade`]({{< ref dapr-upgrade.md >}})

## 环境变量

一些 Dapr 参数可以通过环境变量进行设置（例如 `DAPR_NETWORK` 自动用在 `dapr init` 命令的 `--network` 参数上）。 请注意，在命令行上指定标志将覆盖环境变量。