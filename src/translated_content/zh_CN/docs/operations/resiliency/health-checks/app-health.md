---
type: docs
title: "应用健康检查"
linkTitle: "应用健康检查"
weight: 100
description: 响应应用健康状态的变化
---

应用健康检查功能可以检测应用程序的健康状况，并对状态变化做出反应。

应用程序可能由于多种原因变得无响应。例如，您的应用程序：
- 可能太忙而无法接受新工作；
- 可能已崩溃；或
- 可能处于死锁状态。

有时这种情况可能是暂时的，例如：
- 如果应用程序只是忙碌，最终会恢复接受新工作
- 如果应用程序因某种原因正在重启并处于初始化阶段

应用健康检查默认情况下是禁用的。一旦启用，Dapr 运行时（sidecar）会通过 HTTP 或 gRPC 调用定期轮询您的应用程序。当检测到应用程序的健康状况出现问题时，Dapr 会通过以下方式暂停接受新工作：

- 取消所有 pub/sub 订阅
- 停止所有输入绑定
- 短路所有服务调用请求，这些请求在 Dapr 运行时终止，不会转发到应用程序

这些变化是暂时的，一旦 Dapr 检测到应用程序恢复响应，它将恢复正常操作。

<img src="/images/observability-app-health.webp" width="800" alt="显示应用健康功能的图示。启用应用健康的 Dapr 运行时会定期探测应用程序的健康状况。">

## 应用健康检查与平台级健康检查

Dapr 的应用健康检查旨在补充而不是替代任何平台级健康检查，例如在 Kubernetes 上运行时的[存活探针](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。

平台级健康检查（或存活探针）通常确保应用程序正在运行，并在出现故障时导致平台重启应用程序。

与平台级健康检查不同，Dapr 的应用健康检查专注于暂停当前无法接受工作的应用程序，但预计最终能够恢复接受工作。目标包括：

- 不给已经超载的应用程序带来更多负担。
- 当 Dapr 知道应用程序无法处理消息时，不从队列、绑定或 pub/sub 代理中获取消息。

在这方面，Dapr 的应用健康检查是“较软”的，等待应用程序能够处理工作，而不是以“硬”方式终止正在运行的进程。

{{% alert title="注意" color="primary" %}}
对于 Kubernetes，失败的应用健康检查不会将 pod 从服务发现中移除：这仍然是 Kubernetes 存活探针的责任，而不是 Dapr。
{{% /alert %}}

## 配置应用健康检查

应用健康检查默认情况下是禁用的，但可以通过以下方式启用：

- `--enable-app-health-check` CLI 标志；或
- 在 Kubernetes 上运行时使用 `dapr.io/enable-app-health-check: true` 注释。

添加此标志是启用应用健康检查的必要且充分条件，使用默认选项。

完整的选项列表如下表所示：

| CLI 标志                     | Kubernetes 部署注释    | 描述 | 默认值 |
| ----------------------------- | ----------------------------------- | ----------- | ------------- |
| `--enable-app-health-check`   | `dapr.io/enable-app-health-check`   | 启用健康检查的布尔值 | 禁用  |
| [`--app-health-check-path`]({{< ref "app-health.md#health-check-paths" >}})     | `dapr.io/app-health-check-path`     | 当应用通道为 HTTP 时，Dapr 用于健康探测的路径（如果应用通道使用 gRPC，则忽略此值） | `/healthz` |
| [`--app-health-probe-interval`]({{< ref "app-health.md#intervals-timeouts-and-thresholds" >}}) | `dapr.io/app-health-probe-interval` | 每次健康探测之间的*秒数* | `5` |
| [`--app-health-probe-timeout`]({{< ref "app-health.md#intervals-timeouts-and-thresholds" >}})  | `dapr.io/app-health-probe-timeout`  | 健康探测请求的超时时间（以*毫秒*为单位） | `500` |
| [`--app-health-threshold`]({{< ref "app-health.md#intervals-timeouts-and-thresholds" >}})      | `dapr.io/app-health-threshold`     | 在应用被视为不健康之前的最大连续失败次数 | `3` |

> 请参阅[完整的 Dapr 参数和注释参考]({{< ref arguments-annotations-overview >}})以获取所有选项及其启用方法。

此外，应用健康检查受应用通道使用的协议影响，该协议通过以下标志或注释进行配置：

| CLI 标志                     | Kubernetes 部署注释    | 描述 | 默认值 |
| ----------------------------- | ----------------------------------- | ----------- | ------------- |
| [`--app-protocol`]({{< ref "app-health.md#health-check-paths" >}})   | `dapr.io/app-protocol`   | 应用通道使用的协议。支持的值有 `http`、`grpc`、`https`、`grpcs` 和 `h2c`（HTTP/2 明文）。 | `http`  |

{{% alert title="注意" color="primary" %}}
如果应用健康探测超时值过低，可能会在应用程序遇到突然高负载时将其分类为不健康，导致响应时间下降。如果发生这种情况，请增加 `dapr.io/app-health-probe-timeout` 值。
{{% /alert %}}

### 健康检查路径

#### HTTP
当使用 HTTP（包括 `http`、`https` 和 `h2c`）作为 `app-protocol` 时，Dapr 通过对 `app-health-check-path` 指定的路径进行 HTTP 调用来执行健康探测，默认路径为 `/health`。

为了使您的应用被视为健康，响应必须具有 200-299 范围内的 HTTP 状态码。任何其他状态码都被视为失败。Dapr 只关心响应的状态码，忽略任何响应头或正文。

#### gRPC
当使用 gRPC 作为应用通道（`app-protocol` 设置为 `grpc` 或 `grpcs`）时，Dapr 在您的应用程序中调用方法 `/dapr.proto.runtime.v1.AppCallbackHealthCheck/HealthCheck`。您很可能会使用 Dapr SDK 来实现此方法的处理程序。

在响应健康探测请求时，您的应用*可以*决定执行额外的内部健康检查，以确定它是否准备好处理来自 Dapr 运行时的工作。然而，这不是必需的；这取决于您的应用程序的需求。

### 间隔、超时和阈值

#### 间隔
默认情况下，当启用应用健康检查时，Dapr 每 5 秒探测一次您的应用程序。您可以使用 `app-health-probe-interval` 配置间隔（以秒为单位）。这些探测会定期发生，无论您的应用程序是否健康。

#### 超时
当 Dapr 运行时（sidecar）最初启动时，Dapr 会等待成功的健康探测，然后才认为应用程序是健康的。这意味着在第一次健康检查完成并成功之前，pub/sub 订阅、输入绑定和服务调用请求不会为您的应用程序启用。

如果应用程序在 `app-health-probe-timeout` 中配置的超时内发送成功响应（如上所述），则健康探测请求被视为成功。默认值为 500，对应于 500 毫秒（半秒）。

#### 阈值
在 Dapr 认为应用程序进入不健康状态之前，它将等待 `app-health-threshold` 次连续失败，默认值为 3。此默认值意味着您的应用程序必须连续失败健康探测 3 次*才能*被视为不健康。

如果您将阈值设置为 1，任何失败都会导致 Dapr 假设您的应用程序不健康，并停止向其传递工作。

大于 1 的阈值可以帮助排除由于外部情况导致的瞬态故障。适合您的应用程序的正确值取决于您的要求。

阈值仅适用于失败。单个成功响应足以让 Dapr 认为您的应用程序是健康的，并恢复正常操作。

## 示例

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}

使用 `dapr run` 命令的 CLI 标志启用应用健康检查：

```sh
dapr run \
  --app-id my-app \
  --app-port 7001 \
  --app-protocol http \
  --enable-app-health-check \
  --app-health-check-path=/healthz \
  --app-health-probe-interval 3 \
  --app-health-probe-timeout 200 \
  --app-health-threshold 2 \
  -- \
    <command to execute>
```

{{% /codetab %}}

{{% codetab %}}

要在 Kubernetes 中启用应用健康检查，请将相关注释添加到您的 Deployment：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  template:
    metadata:
      labels:
        app: my-app
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "my-app"
        dapr.io/app-port: "7001"
        dapr.io/app-protocol: "http"
        dapr.io/enable-app-health-check: "true"
        dapr.io/app-health-check-path: "/healthz"
        dapr.io/app-health-probe-interval: "3"
        dapr.io/app-health-probe-timeout: "200"
        dapr.io/app-health-threshold: "2"
```

{{% /codetab %}}

{{< /tabs >}}

## 演示

观看此视频以获取[使用应用健康检查的概述](https://youtu.be/srczBuOsAkI?t=533)：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/srczBuOsAkI?start=533" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>