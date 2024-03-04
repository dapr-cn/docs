---
type: docs
title: "应用程序健康检查"
linkTitle: "应用程序健康检查"
weight: 100
description: 对应用程序的健康状态变化做出反应
---

The app health checks feature allows probing for the health of your application and reacting to status changes.

应用程序无法响应的原因有很多。 For example, your application:
- Could be too busy to accept new work;
- Could have crashed; or
- Could be in a deadlock state.

Sometimes the condition can be transitory, for example:
- If the app is just busy and will resume accepting new work eventually
- If the application is being restarted for whatever reason and is in its initialization phase

应用程序健康检查默认为禁用。 Once you enable app health checks, the Dapr runtime (sidecar) periodically polls your application via HTTP or gRPC calls. 当检测到应用程序健康出现故障时，Dapr 就会停止代表应用程序接受新工作：

- 取消订阅所有Pub/sub（发布/订阅）服务
- 停止所有输入绑定
- 短路所有服务调用请求，这些请求在 Dapr 运行时终止，不会转发给应用程序

这些更改只是暂时的，一旦 Dapr 检测到应用程序再次响应，它就会恢复正常运行。

<img src="/images/observability-app-health.webp" width="800" alt="显示应用程序健康功能的示意图 在启用应用程序健康状况的情况下运行 Dapr，会导致 Dapr 定期探测应用程序的健康状况." />

## 应用程序健康检查与平台级健康检查

Dapr 中的应用程序健康检查旨在补充而非取代任何平台级健康检查，例如在 Kubernetes 上运行时， [liveness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)。

Platform-level health checks (or liveness probes) generally ensure that the application is running, and cause the platform to restart the application in case of failures.

Unlike platform-level health checks, Dapr's app health checks focus on pausing work to an application that is currently unable to accept it, but is expected to be able to resume accepting work *eventually*. 目标包括

- 不给已经超负荷的应用程序带来更多负载。
- 在 Dapr 知道应用程序无法处理消息时，不要从队列、绑定或 Pub/sub（发布/订阅）处接收消息，从而做到 "礼貌"。

在这方面，Dapr 的应用程序健康检查比较 "柔和"，它会等待应用程序能够处理工作，而不是以 "强硬 "的方式终止正在运行的进程。

{{% alert title="Note" color="primary" %}}
For Kubernetes, a failing app health check won't remove a pod from service discovery: this remains the responsibility of the Kubernetes liveness probe, _not_ Dapr.
{{% /alert %}}

## 配置应用程序健康检查

应用程序健康检查在默认情况下是禁用的，但可以通过以下任一选项启用：

- `--enable-app-health-check` CLI 标志；或
- 在 Kubernetes 上运行时， `dapr.io/enable-app-health-check: true` 注释。

要使用默认选项启用应用程序健康检查，添加此标记既必要又充分。

本表列出了所有选项：

| CLI 标志                                                                                         | Kubernetes 部署注解                     | 说明                                            | 默认值        |
| ---------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------- | ---------- |
| `--enable-app-health-check`                                                                    | `dapr.io/enable-app-health-check`   | 启用健康检查的布尔值                                    | Disabled   |
| [`--app-health-check-path`]({{< ref "app-health.md#health-check-paths" >}})                    | `dapr.io/app-health-check-path`     | 当应用通道为HTTP时，Dapr用于健康探测的路径（如果应用通道使用gRPC，则忽略此值） | `/healthz` |
| [`--app-health-probe-interval`]({{< ref "app-health.md#intervals-timeouts-and-thresholds" >}}) | `dapr.io/app-health-probe-interval` | 每个健康探测之间的时间间隔为 *秒*                            | `5`        |
| [`--app-health-probe-timeout`]({{< ref "app-health.md#intervals-timeouts-and-thresholds" >}})  | `dapr.io/app-health-probe-timeout`  | 健康探测请求的超时时间为 *毫秒*                             | `500`      |
| [`--app-health-threshold`]({{< ref "app-health.md#intervals-timeouts-and-thresholds" >}})      | `dapr.io/app-health-threshold`      | 应用被视为不健康之前的最大连续失败次数                           | `3`        |

> See the [full Dapr arguments and annotations reference]({{< ref arguments-annotations-overview >}}) for all options and how to enable them.

Additionally, app health checks are impacted by the protocol used for the app channel, which is configured with the following flag or annotation:

| CLI flag                                                           | Kubernetes 部署注解        | 说明                                                                                                                      | 默认值    |
| ------------------------------------------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| [`--app-protocol`]({{< ref "app-health.md#health-check-paths" >}}) | `dapr.io/app-protocol` | Protocol used for the app channel. supported values are `http`, `grpc`, `https`, `grpcs`, and `h2c` (HTTP/2 Cleartext). | `http` |

{{% alert title="Note" color="primary" %}}
A low app health probe timeout value can classify an application as unhealthy if it experiences a sudden high load, causing the response time to degrade. If this happens, increase the `dapr.io/app-health-probe-timeout` value.
{{% /alert %}}

### 健康检查路径

#### HTTP
When using HTTP (including `http`, `https`, and `h2c`) for `app-protocol`, Dapr performs health probes by making an HTTP call to the path specified in `app-health-check-path`, which is `/health` by default.

For your app to be considered healthy, the response must have an HTTP status code in the 200-299 range. 任何其他状态码都被视为失败。 Dapr 只关心响应的状态码，忽略任何响应头或主体。

#### gRPC
When using gRPC for the app channel (`app-protocol` set to `grpc` or `grpcs`), Dapr invokes the method `/dapr.proto.runtime.v1.AppCallbackHealthCheck/HealthCheck` in your application. 很可能，您将使用 Dapr SDK 来实现此方法的处理程序。

在响应健康探测请求时，您的应用程序 *可能* 决定执行额外的内部健康检查，以确定它是否准备好从 Dapr 运行时处理工作。 然而，这并非必需；它是根据您的应用程序需求而做出的选择。

### 间隔、超时和阈值

#### Intervals
By default, when app health checks are enabled, Dapr probes your application every 5 seconds. 您可以使用 `app-health-probe-interval`配置间隔，以秒为单位。 这些探测会定期发生，无论应用程序是否正常运行。

#### 超时
当 Dapr 运行时（sidecar）初始启动时，Dapr 会等待成功的健康探测，然后才会将应用程序视为健康状态。 这意味着在第一次健康检查完成且成功之前，您的应用程序将无法启用 pub/sub 订阅、输入绑定和服务调用请求。

如果应用程序在配置的超时时间内（如上所述）发送了成功响应，则健康检查请求被视为成功。超时时间配置在 `app-health-probe-timeout`中。 The default value is 500, corresponding to 500 milliseconds (half a second).

#### Thresholds
在 Dapr 认为应用程序进入不健康状态之前，它将等待 `app-health-threshold` 个连续失败，其默认值为3。 This default value means that your application must fail health probes 3 times *in a row* to be considered unhealthy.

If you set the threshold to 1, any failure causes Dapr to assume your app is unhealthy and will stop delivering work to it.

A threshold greater than 1 can help exclude transient failures due to external circumstances. 您的应用程序所需的正确值取决于您的要求。

阈值仅适用于失败。 单个成功的响应足以让 Dapr 认为您的应用程序是健康的，并恢复正常运行。

## 示例

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}

将 CLI 标志与 `Dapr run` 启用应用程序运行状况检查的命令：

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

要在Kubernetes中启用应用程序健康检查，请将相关的注解添加到您的部署中：

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

## 例子

观看此视频 [使用应用运行状况检查概述](https://youtu.be/srczBuOsAkI?t=533):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/srczBuOsAkI?start=533" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
