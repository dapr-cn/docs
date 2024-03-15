---
type: docs
title: Dapr sidecar (daprd) 概述
linkTitle: Sidecar(边车)
weight: 100
description: Dapr Sidecar 进程概述
---

Dapr使用[sidecar模式]({{< ref "concepts/overview.md#sidecar-architecture" >}})，这意味着Dapr API在与应用程序一起运行的单独进程，即Dapr sidecar，上运行和公开。 Dapr sidecar 进程名为 `daprd` ，并且根据不同的宿主环境有不同的启动方式。

Dapr sidecar 提供了：

- [应用程序业务逻辑使用的[构建块 API]({{<ref building-blocks-concept>}})]
- 用于发现能力和设置属性的[元数据 API]({{<ref metadata_api>}})
- 一个 [健康检查 API]({{<ref sidecar-health>}}) 以确定运行状况和 sidecar 准备情况和活动状态

一旦应用程序可以通过其配置的端口访问，Dapr sidecar 就会进入就绪状态。 在应用程序启动/初始化期间，应用程序无法访问 Dapr 组件。

<img src="/images/overview-sidecar-apis.png" width=700>

Sidecar API 是通过本地 http 或 gRPC 端点从应用程序调用的。 <img src="/images/overview-sidecar-model.png" width=700>

## 使用 `dapr run` 进行自托管

当以[自托管模式]({{<ref self-hosted>}})安装Dapr时，`daprd`二进制文件会被下载并放置在用户主目录下（Linux/macOS为`$HOME/.dapr/bin`，Windows为`%USERPROFILE%\.dapr\bin\`）。

在自托管模式下，运行Dapr CLI [`run`命令]({{< ref dapr-run.md >}})会使用提供的应用程序可执行文件启动`daprd`可执行文件。 这是在开发和测试等场景中本地运行 Dapr sidecar 的推荐方法。

你可以在[Dapr run命令参考]({{<ref dapr-run>}}) 中找到CLI公开的用于配置sidecar的各种参数。

## 使用 `dapr-sidecar-injector` 的 Kubernetes

在[Kubernetes]({{< ref kubernetes.md >}})上，Dapr控制面板包括[dapr-sidecar-injector服务]({{< ref kubernetes-overview.md >}})，它监视带有`dapr.io/enabled`注解的新pod，并在pod中注入一个包含`daprd`进程的容器。 在这种情况下，sidecar参数可以通过在**Kubernetes annotations**列中的[此表]({{<ref arguments-annotations-overview>}}) 中所述的注解传递。

## 直接运行 sidecar

在大多数情况下，您不需要显式运行 `daprd` ，因为 sidecar 由 [CLI]({{<ref cli-overview>}}) （自托管模式）或 dapr-sidecar-injector 服务（Kubernetes）启动。 对于高级用例（调试、脚本部署等） `daprd` 进程可以直接启动。

要获取所有可用参数的详细列表，请运行 `daprd --help` 或查看这个[表]({{< ref arguments-annotations-overview.md >}})，该表概述了`daprd`参数与CLI参数和Kubernetes注解的关系。

### 示例

1. 通过指定应用程序的唯一 ID 来启动 sidecar。

   **注意：** `--app-id` 是一个必填字段，且不能包含点。

   ```bash
   daprd --app-id myapp
   ```

2. 指定应用程序要监听的端口

   ```bash
   daprd --app-id --app-port 5000
   ```

3. 如果您正在使用多个自定义资源，并且想要指定资源定义文件的位置，请使用 `--resources-path` 参数：

   ```bash
   daprd --app-id myapp --resources-path <PATH-TO-RESOURCES-FILES>
   ```

4. 如果已将组件和其他资源（例如弹性策略、订阅或配置）整理到单独的文件夹或共享文件夹中，则可以指定多个资源路径：

   ```bash
   daprd --app-id myapp --resources-path <PATH-1-TO-RESOURCES-FILES> --resources-path <PATH-2-TO-RESOURCES-FILES>
   ```

5. 在运行应用时启用 Prometheus 指标的收集

   ```bash
   daprd --app-id myapp --enable-metrics
   ```

6. 只监听 IPv4 和 IPv6 循环

   ```bash
   daprd --app-id myapp --dapr-listen-addresses '127.0.0.1,[::1]'
   ```
