---
type: docs
title: "Sidecar 运行状况"
linkTitle: "Sidecar 运行状况"
weight: 5000
description: Dapr sidecar 运行状况检查。
---

Dapr 提供了一种使用 HTTP /healthz 端点来确定其健康状况的方法。 通过此端点，对Dapr 进程或 sidecar进行探测，可以确定其运行状况，从而确定其就绪程度和活跃度。 请参阅 [health API ]({{< ref health_api.md >}})

The Dapr `/healthz` endpoint can be used by health probes from the application hosting platform. 本主题描述 Dapr 如何与来自不同托管平台的探测器集成。 本主题描述 Dapr 如何与来自不同托管平台的探测器集成。

作为用户，在将Dapr部署到主机平台时(例如Kubernetes)，Dapr健康端点会自动为您配置。 您无需配置任何内容。

注意：Dapr actors还有一个健康 API 终点，Dapr 会探测对 Dapr 信号的响应申请，该信号表示actor应用程序是健康且运行的。 请参阅 [health API ]({{< ref "actors_api.md#health-check" >}})

## 运行状况终结点：与Kubernetes集成

Kubernetes使用 * 准备就绪 * 和 * 活跃程度 * 探测器来确定容器的运行状况。

The kubelet uses liveness probes to know when to restart a container. 例如，活跃探针可捕获应用程序正在运行但无法进行处理的死锁。 例如，活跃探针可捕获应用程序正在运行但无法进行处理的死锁。 在这种状态下重新启动容器有助于使应用程序在具有错误的情况下更可用。

The kubelet uses readiness probes to know when a container is ready to start accepting traffic. 当一个 pod 的所有容器都已准备就绪时，会认为其准备就绪。 当一个 pod 的所有容器都已准备就绪时，会认为其准备就绪。 此就绪信号的一个用途是控制哪些 Pod 用作 Kubernetes 服务的后端。 当 Pod 未就绪时，将从 Kubernetes 服务负载均衡器中除去。

当与 Kubernetes 集成时，Dapr sidecar 会被注入一个Kubernetes 探针配置，告诉它要使用 Dapr healthz 端点。 这是由 `Sidecar Injector` 系统服务完成的。 下面的图中显示了与 kubelet 的集成。

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

在上述 *示例*, `perionds` 字段指定的 kubelet 应该每3秒执行一个主动性探测。 `initialDelaySeconds` 字段告诉 kubelet 在执行第一个探针前应等待 3 秒钟。 在此示例中，要执行探测器， kubelet 将 HTTP GET 请求发送到正在容器中运行并侦听端口 8080的服务器。 如果服务器的 /healthz 路径的处理程序返回成功代码，那么 kubelet 将认为容器是活动的并且是健康的。 如果处理程序返回失败代码，kubelet 将杀死容器并重新启动它。

任何大于或等于200和小于400的代码都是成功的。 任何其他代码表示失败。

### 如何在Kubernetes配置准备就绪探测器

准备就绪探测器与活跃度探测器配置相类似。 唯一的不同是您使用 `readinessProbe` 字段而不是 `livenessProbe` 字段。

```
readinessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

### 如何使用 Kubernetes 配置 Dapr sidecar 运行状况终结点
如上所述，此配置由 Sidecar 注入服务自动完成。 本部分描述了在活跃度和就绪探测器上设置的特定值。

Dapr 在3500端口上有它的 HTTP 健康端点 `/v1.0/healthz` 。这可以和 Kubernetes 一起用于准备就绪和活跃度探针。 当注入Dapr sidecar后，准备就绪和活跃度探测器在pod配置文件中配置的，配置的值如下。

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

- [ 终结点运行状况 API]({{< ref health_api.md >}})
- [参与者运行状况 API]({{< ref "actors_api.md#health-check" >}})
- [Kubernetes 探测器配置参数](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
