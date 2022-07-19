---
type: docs
title: "Sidecar 健康检查"
linkTitle: "Sidecar 健康检查"
weight: 5000
description: Dapr sidecar 健康检查。
---

Dapr 提供了一种使用 HTTP /healthz 端点来确定其健康状况的方法。 通过此端点，对 Dapr 进程或 sidecar 进行探测，可以确定其运行状况，从而确定其就绪程度和活跃度。 请参阅 [health API ]({{< ref health_api.md >}})

Dapr `/healthz` 端点可由来自应用程序托管平台的健康检查探测使用。 本主题描述 Dapr 如何与来自不同托管平台的探针集成。

作为用户，在将 Dapr 部署到主机平台时(例如 Kubernetes)，Dapr 健康端点会自动为您配置。 您无需配置任何内容。

注意：Dapr actor 还有一个健康 API 端点，Dapr 会探测对 Dapr 信号的响应申请，该信号表示 actor 应用程序是健康且运行的。 请参阅 [health API ]({{< ref "actors_api.md#health-check" >}})

## 运行状况端点：与 Kubernetes 集成

Kubernetes 使用 * readiness * 和 * liveness * 探针来确定容器的健康。

The kubelet uses liveness probes to know when to restart a container. 例如，liveness 探针可捕获应用程序正在运行但无法进行处理的死锁。 例如，liveness 探针可捕获应用程序正在运行但无法进行处理的死锁。 在这种状态下重新启动容器有助于使应用程序在具有错误的情况下更可用。

Kubelet 使用 readiness 探针来了解容器何时准备好开始接受流量。 当一个 pod 的所有容器都已准备就绪时，会认为其准备就绪。 此就绪信号的一个用途是控制哪些 Pod 用作 Kubernetes 服务的后端。 当 Pod 未就绪时，将从 Kubernetes 服务负载均衡器中除去。

当与 Kubernetes 集成时，Dapr sidecar 会被注入一个 Kubernetes 探针配置，告诉它要使用 Dapr healthz 端点。 这是由 `Sidecar Injector` 系统服务完成的。 下面的图中显示了与 kubelet 的集成。

<img src="/images/security-mTLS-dapr-system-services.png" width=600>

### 如何在 Kubernetes 中配置活跃度探测器

在 pod 配置文件中，活跃度探测器将添加到容器规范部分中，如下所示 :

```
 livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

在上述 *示例*, `perionds` 字段指定的 kubelet 应该每3秒执行一个主动性探测。 `initialDelaySeconds` 字段告诉 kubelet 在执行第一个探针前应等待 3 秒钟。 在此示例中，要执行探测器， kubelet 将 HTTP GET 请求发送到正在容器中运行并侦听端口 8080 的服务器。 如果服务器的 /healthz 路径的处理程序返回成功代码，那么 kubelet 将认为容器是活动的并且是健康的。 如果处理程序返回失败代码，kubelet 将杀死容器并重新启动它。

任何大于或等于200和小于400的代码都是成功的。 任何其他代码表示失败。

### 如何在 Kubernetes 配置准备就绪探测器

准备就绪探测器与活跃度探测器配置相类似。 唯一的不同是您使用 `readinessProbe` 字段而不是 `livenessProbe` 字段。

```
readinessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

### 如何使用 Kubernetes 配置 Dapr sidecar 健康检查端点
如上所述，此配置由 Sidecar 注入服务自动完成。 本部分描述了在活跃度和就绪探测器上设置的特定值。

Dapr 在3500端口上有它的 HTTP 健康端点 `/v1.0/healthz` 。这可以和 Kubernetes 一起用于准备就绪和活跃度探针。 当注入 Dapr sidecar 后，准备就绪和活跃度探测器在 pod 配置文件中配置的，配置的值如下。

```
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

有关更多信息;

- [ 端点健康检查 API]({{< ref health_api.md >}})
- [Actor 健康 API]({{< ref "actors_api.md#health-check" >}})
- [Kubernetes 探针配置参数](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
