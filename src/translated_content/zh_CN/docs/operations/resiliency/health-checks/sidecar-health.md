---
type: docs
title: "Sidecar 健康检查"
linkTitle: "Sidecar 健康检查"
weight: 200
description: Dapr sidecar 健康检查
---

Dapr 提供了一种方法，通过 [HTTP `/healthz` 端点]({{< ref health_api.md >}}) 来确定其健康状态。通过这个端点，*daprd* 进程或 sidecar 可以：

- 检查整体健康状况
- 在初始化期间确认 Dapr sidecar 的就绪状态
- 在 Kubernetes 中确定就绪和存活状态

在本指南中，您将了解 Dapr `/healthz` 端点如何与应用托管平台（如 Kubernetes）以及 Dapr SDK 的健康检查功能集成。

{{% alert title="注意" color="primary" %}}
Dapr actor 也有一个健康 API 端点，Dapr 会探测应用程序以响应 Dapr 发出的信号，确认 actor 应用程序是健康且正在运行的。请参阅 [actor 健康 API]({{< ref "actors_api.md#health-check" >}})。
{{% /alert %}}

下图展示了 Dapr sidecar 启动时，healthz 端点和应用通道初始化的步骤。

<img src="/images/healthz-outbound.png" width="800" alt="Dapr 检查出站健康连接的图示。" />

## 出站健康端点

如上图中的红色边界线所示，`v1.0/healthz/` 端点用于等待以下情况：
- 所有组件已初始化；
- Dapr HTTP 端口可用；_并且，_
- 应用通道已初始化。

这用于确认 Dapr sidecar 的完整初始化及其健康状况。

您可以通过设置 `DAPR_HEALTH_TIMEOUT` 环境变量来控制健康检查的超时时间，这在高延迟环境中可能很重要。

另一方面，如上图中的绿色边界线所示，当 `v1.0/healthz/outbound` 端点返回成功时：
- 所有组件已初始化；
- Dapr HTTP 端口可用；_但，_
- 应用通道尚未建立。

在 Dapr SDK 中，`waitForSidecar`/`wait_until_ready` 方法（取决于[您使用的 SDK]({{< ref "#sdks-supporting-outbound-health-endpoint" >}})）用于通过 `v1.0/healthz/outbound` 端点进行此特定检查。使用这种方法，您的应用程序可以在应用通道初始化之前调用 Dapr sidecar API，例如，通过 secret API 读取 secret。

如果您在 SDK 上使用 `waitForSidecar`/`wait_until_ready` 方法，则会执行正确的初始化。否则，您可以在初始化期间调用 `v1.0/healthz/outbound` 端点，如果成功，您可以调用 Dapr sidecar API。

### 支持出站健康端点的 SDK
目前，`v1.0/healthz/outbound` 端点在以下 SDK 中得到支持：
- [.NET SDK]({{< ref "dotnet-client.md#wait-for-sidecar" >}})
- [Java SDK]({{< ref "java-client.md#wait-for-sidecar" >}})
- [Python SDK]({{< ref "python-client.md#health-timeout" >}})
- [JavaScript SDK](https://github.com/dapr/js-sdk/blob/4189a3d2ad6897406abd766f4ccbf2300c8f8852/src/interfaces/Client/IClientHealth.ts#L14)

## 健康端点：与 Kubernetes 的集成
当将 Dapr 部署到像 Kubernetes 这样的托管平台时，Dapr 健康端点会自动为您配置。

Kubernetes 使用 *就绪* 和 *存活* 探针来确定容器的健康状况。

### 存活性
kubelet 使用存活探针来判断何时需要重启容器。例如，存活探针可以捕获死锁（一个无法进展的运行应用程序）。在这种状态下重启容器可以帮助提高应用程序的可用性，即使存在错误。

#### 如何在 Kubernetes 中配置存活探针

在 pod 配置文件中，存活探针被添加到容器规范部分，如下所示：

```yaml
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

在上述示例中，`periodSeconds` 字段指定 kubelet 应每 3 秒执行一次存活探针。`initialDelaySeconds` 字段告诉 kubelet 应在执行第一次探针前等待 3 秒。为了执行探针，kubelet 向在容器中运行并监听端口 8080 的服务器发送 HTTP GET 请求。如果服务器的 `/healthz` 路径的处理程序返回成功代码，kubelet 认为容器是存活且健康的。如果处理程序返回失败代码，kubelet 会杀死容器并重启它。

任何介于 200 和 399 之间的 HTTP 状态代码表示成功；任何其他状态代码表示失败。

### 就绪性
kubelet 使用就绪探针来判断容器何时准备好开始接受流量。当所有容器都准备好时，pod 被认为是就绪的。就绪信号的一个用途是控制哪些 pod 被用作 Kubernetes 服务的后端。当 pod 未就绪时，它会从 Kubernetes 服务负载均衡器中移除。

{{% alert title="注意" color="primary" %}}
一旦应用程序在其配置的端口上可访问，Dapr sidecar 将处于就绪状态。在应用程序启动/初始化期间，应用程序无法访问 Dapr 组件。
{{% /alert %}}

#### 如何在 Kubernetes 中配置就绪探针

就绪探针的配置与存活探针类似。唯一的区别是使用 `readinessProbe` 字段而不是 `livenessProbe` 字段：

```yaml
    readinessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

### Sidecar 注入器

在与 Kubernetes 集成时，Dapr sidecar 被注入了一个 Kubernetes 探针配置，告诉它使用 Dapr `healthz` 端点。这是由 "Sidecar 注入器" 系统服务完成的。与 kubelet 的集成如下面的图示所示。

<img src="/images/security-mTLS-dapr-system-services.png" width="800" alt="Dapr 服务交互的图示" />

#### Dapr sidecar 健康端点如何与 Kubernetes 配置

如上所述，此配置由 Sidecar 注入器服务自动完成。本节描述了在存活和就绪探针上设置的具体值。

Dapr 在端口 3500 上有其 HTTP 健康端点 `/v1.0/healthz`。这可以与 Kubernetes 一起用于就绪和存活探针。当 Dapr sidecar 被注入时，存活和就绪探针在 pod 配置文件中配置为以下值：

```yaml
    livenessProbe:
      httpGet:
        path: v1.0/healthz
        port: 3500
      initialDelaySeconds: 5
      periodSeconds: 10
      timeoutSeconds : 5
      failureThreshold : 3
    readinessProbe:
      httpGet:
        path: v1.0/healthz
        port: 3500
      initialDelaySeconds: 5
      periodSeconds: 10
      timeoutSeconds : 5
      failureThreshold: 3
```

## 延迟优雅关闭

Dapr 提供了一个 [`dapr.io/block-shutdown-duration` 注释或 `--dapr-block-shutdown-duration` CLI 标志]({{< ref arguments-annotations-overview.md >}})，它会延迟完整的关闭过程，直到指定的持续时间，或直到应用报告为不健康，以较早者为准。

在此期间，所有订阅和输入绑定都会关闭。这对于需要在其自身关闭过程中使用 Dapr API 的应用程序非常有用。

适用的注释或 CLI 标志包括：

- `--dapr-graceful-shutdown-seconds`/`dapr.io/graceful-shutdown-seconds`
- `--dapr-block-shutdown-duration`/`dapr.io/block-shutdown-duration`

在 [注释和参数指南]({{< ref arguments-annotations-overview.md >}}) 中了解更多关于这些及其使用方法。

## 相关链接

- [端点健康 API]({{< ref health_api.md >}})
- [actor 健康 API]({{< ref "actors_api.md#health-check" >}})
- [Kubernetes 探针配置参数](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
