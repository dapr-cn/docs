---
type: docs
title: "Dapr sidecar (daprd) 概述"
linkTitle: "Sidecar"
weight: 100
description: "Dapr sidecar 进程概述"
---

Dapr 采用 [sidecar 模式]({{< ref "concepts/overview.md#sidecar-architecture" >}})，这意味着 Dapr API 运行在一个独立的进程中，即 Dapr sidecar，并与您的应用程序一起运行。Dapr sidecar 进程命名为 `daprd`，并根据托管环境以不同的方式启动。

Dapr sidecar 提供以下功能：

- 应用程序业务逻辑使用的 [构建块 API]({{<ref building-blocks-concept>}})
- 用于发现功能和设置属性的 [元数据 API]({{<ref metadata_api>}})
- 用于检查健康状态和 sidecar 准备及存活状态的 [健康 API]({{<ref sidecar-health>}})

当应用程序在其配置的端口上可访问时，Dapr sidecar 即达到准备状态。在应用程序启动或初始化期间，应用程序暂时无法访问 Dapr 组件。

<img src="/images/overview-sidecar-apis.png" width=700>

应用程序通过本地 http 或 gRPC 端点调用 sidecar API。
<img src="/images/overview-sidecar-model.png" width=700>

## 使用 `dapr run` 的自托管

在 [自托管模式]({{<ref self-hosted>}}) 下安装 Dapr 时，`daprd` 二进制文件会被下载并放置在用户主目录下（Linux/macOS 为 `$HOME/.dapr/bin`，Windows 为 `%USERPROFILE%\.dapr\bin\`）。

在自托管模式下，使用 Dapr CLI 的 [`run` 命令]({{< ref dapr-run.md >}}) 会启动 `daprd` 可执行文件，并运行您提供的应用程序可执行文件。这是在本地进行开发和测试等场景中运行 Dapr sidecar 的推荐方式。

您可以在 [Dapr run 命令参考]({{<ref dapr-run>}}) 中找到 CLI 提供的用于配置 sidecar 的各种参数。

## 在 Kubernetes 中使用 `dapr-sidecar-injector`

在 [Kubernetes]({{< ref kubernetes.md >}}) 上，Dapr 控制平面包括 [dapr-sidecar-injector 服务]({{< ref kubernetes-overview.md >}})，它监视带有 `dapr.io/enabled` 注释的新 pod，并在 pod 内注入一个包含 `daprd` 进程的容器。在这种情况下，可以通过注释传递 sidecar 参数，如 [此表]({{<ref arguments-annotations-overview>}}) 中的 **Kubernetes 注释** 列所述。

## 直接运行 sidecar

在大多数情况下，您不需要显式运行 `daprd`，因为 sidecar 要么由 [CLI]({{<ref cli-overview>}})（自托管模式）启动，要么由 dapr-sidecar-injector 服务（Kubernetes）启动。对于高级用例（如调试、脚本化部署等），可以直接启动 `daprd` 进程。

要获取所有可用参数的详细列表，请运行 `daprd --help` 或查看 [此表]({{< ref arguments-annotations-overview.md >}})，该表概述了 `daprd` 参数与 CLI 参数和 Kubernetes 注释的关系。

### 示例

1. 通过指定其唯一 ID 启动与应用程序一起的 sidecar。

   **注意：** `--app-id` 是必填字段，且不能包含点。

   ```bash
   daprd --app-id myapp
   ```

1. 指定您的应用程序正在监听的端口

   ```bash
   daprd --app-id myapp --app-port 5000
   ```

1. 如果您使用了多个自定义资源并希望指定资源定义文件的位置，请使用 `--resources-path` 参数：

   ```bash
   daprd --app-id myapp --resources-path <PATH-TO-RESOURCES-FILES>
   ```

1. 如果您已将组件和其他资源（例如，弹性策略、订阅或配置）组织到单独的文件夹或共享文件夹中，您可以指定多个资源路径：

   ```bash
   daprd --app-id myapp --resources-path <PATH-1-TO-RESOURCES-FILES> --resources-path <PATH-2-TO-RESOURCES-FILES>
   ```

1. 在运行应用程序时启用 Prometheus 指标收集

   ```bash
   daprd --app-id myapp --enable-metrics
   ```

1. 仅监听 IPv4 和 IPv6 回环

   ```bash
   daprd --app-id myapp --dapr-listen-addresses '127.0.0.1,[::1]'
   ```