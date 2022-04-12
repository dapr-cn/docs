---
type: docs
title: "Dapr sidecar (daprd) 概述"
linkTitle: "Sidecar"
weight: 100
description: "Dapr Sidecar 进程概述"
---

Dapr 使用 [sidecar 模式]({{< ref "overview.md#sidecar-architecture" >}})，这意味着 Dapr API 在与应用程序一起运行的单独进程（即 Dapr sidecar）上运行和公开。 Dapr sidecar 进程名为`daprd` ，并且根据不同的宿主环境有不同的启动方式。

<img src="/images/overview-sidecar-model.png" width=700>

## 使用 `dapr run` 进行自托管

当以 [自托管模式]({{<ref self-hosted>}}) 安装 Dapr 时, `daprd` 二进制文件被下载到用户主目录下 (Linux/MacOS 下是 `$HOME/.dapr/bin`， Windows 下是 `%USERPROFILE%\.dapr\bin`)。 在自托管模式下，运行 Dapr CLI [</code>run`命令]({{&lt; ref dapr-run.md &gt;}})将启动 <code>daprd`可执行文件以及提供的应用程序可执行文件。 这是在开发和测试等场景中本地运行 Dapr sidecar 的推荐方法。 CLI 公开的用于配置 sidecar 的各种参数可以在 [Dapr run 命令参考]({{<ref dapr-run>}}) 中找到。

## 带 `dapr-sidecar-injector` 的Kubernetes

在 [Kubernetes]({{< ref kubernetes.md >}})上，Dapr 控制平面包括 [dapr-sidecar-injector 服务]({{< ref kubernetes-overview.md >}})，它监视带有 `dapr.io/enabled` annotations 的新 pod，并在 pod 中注入一个包含 `daprd` 进程的容器。 在这种情况下，sidecar 参数可以通过在 [此表]({{<ref arguments-annotations-overview>}}) 所述的 **Kubernetes annotations ** 列中的 annotations 传递。

## 直接运行 sidecar

在大多数情况下，您不需要显式运行 `daprd` ，因为 sidecar 要么由 CLI（自托管模式）启动，要么由 dapr-sidecar-injector 服务 （Kubernetes） 启动。 对于高级的使用场景（如，调试、脚本化部署等），可以直接启动 `daprd` 进程。

有关所有可用参数的详细列表，请运行 `daprd --help` 或参阅此 [表]({{< ref arguments-annotations-overview.md >}}) 其中概述的 `daprd` 参数与CLI参数和Kubernetes annotations的关系。

### 示例

1. 通过指定应用程序的唯一 ID 来启动 sidecar。 注意 `--app-id` 是必填字段：

   ```bash
   daprd --app-id myapp
   ```

2. 指定应用程序要监听的端口

   ```bash
   daprd --app-id --app-port 5000
   ```

3. 如果您正在使用多个自定义组件，并且想要指定组件定义文件的位置，请使用 `--components-path` 参数：

   ```bash
   daprd --app-id myapp --components-path <PATH-TO-COMPONENTS-FILES>
   ```

4. 在运行应用时启用 Prometheus 指标的收集

   ```bash
   daprd --app-id myapp --enable-metrics
   ```

5. 只监听IPv4和IPv6 循环

   ```bash
   daprd --app-id myapp --dapr-listen-addresses '127.0.0.1,[::1]'
   ```
