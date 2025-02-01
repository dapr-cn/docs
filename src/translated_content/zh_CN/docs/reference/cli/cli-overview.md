---
type: docs
title: "Dapr 命令行界面 (CLI) 参考"
linkTitle: "概述"
description: "关于 Dapr CLI 的详细信息"
weight: 10
---

Dapr CLI 使您能够在本地开发环境或 Kubernetes 集群上配置 Dapr，提供调试支持，并启动和管理 Dapr 实例。

```bash

         __
    ____/ /___ _____  _____
   / __  / __ '/ __ \/ ___/
  / /_/ / /_/ / /_/ / /
  \__,_/\__,_/ .___/_/
              /_/

===============================
分布式应用运行时

用法:
  dapr [命令]

可用命令:
  annotate       为 Kubernetes 配置添加 Dapr 注释。适用平台：Kubernetes
  build-info     显示 Dapr CLI 和运行时的构建信息
  completion     生成 shell 自动补全脚本
  components     列出所有 Dapr 组件。适用平台：Kubernetes
  configurations 列出所有 Dapr 配置。适用平台：Kubernetes
  dashboard      启动 Dapr 仪表板。适用平台：Kubernetes 和 本地托管
  help           获取任何命令的帮助信息
  init           在支持的平台上安装 Dapr。适用平台：Kubernetes 和 本地托管
  invoke         调用指定 Dapr 应用程序上的方法。适用平台：本地托管
  list           列出所有 Dapr 实例。适用平台：Kubernetes 和 本地托管
  logs           获取应用程序的 Dapr sidecar 日志。适用平台：Kubernetes
  mtls           检查 mTLS 是否已启用。适用平台：Kubernetes
  publish        发布一个 pubsub 事件。适用平台：本地托管
  run            运行 Dapr 并可选择与您的应用程序一起运行。适用平台：本地托管
  status         显示 Dapr 服务的健康状态。适用平台：Kubernetes
  stop           停止 Dapr 实例及其关联的应用程序。适用平台：本地托管
  uninstall      卸载 Dapr 运行时。适用平台：Kubernetes 和 本地托管
  upgrade        升级集群中的 Dapr 控制平面安装。适用平台：Kubernetes
  version        显示 Dapr 运行时和 CLI 的版本信息

标志:
  -h, --help          获取 dapr 的帮助信息
      --log-as-json   以 JSON 格式记录输出
  -v, --version       获取 dapr 的版本信息

使用 "dapr [command] --help" 获取有关命令的更多信息。
```

### 命令参考

您可以通过以下链接了解每个 Dapr 命令的详细信息。

 - [`dapr annotate`]({{< ref dapr-annotate.md >}})
 - [`dapr build-info`]({{< ref dapr-build-info.md >}})
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
 - [`dapr version`]({{< ref dapr-version.md >}})

### 环境变量

一些 Dapr 标志可以通过环境变量进行设置（例如，`dapr init` 命令的 `--network` 标志可以通过 `DAPR_NETWORK` 环境变量设置）。请注意，在命令行中指定的标志会覆盖任何已设置的环境变量。