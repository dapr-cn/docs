---
type: docs
title: "Sidecar 运行状况"
linkTitle: "Sidecar health"
weight: 5000
description: Dapr sidecar 运行状况检查。
---

Dapr 使用 HTTP /healthz 终结点提供了一个来确定其运行状况的方法。 通过此端点，对Dapr 进程或 sidecar进行探测，可以确定其运行状况，从而确定其就绪程度和活跃度。 请参阅 [health API ]({{< ref health_api.md >}})

Dapr `/healthz` 终结点可以被应用程序托管平台上的运行状况探测器使用。 本主题描述 Dapr 如何与来自不同托管平台的探测器集成。

作为用户，当将 Dapr 部署到托管平台 ( 例如 Kubernetes) 时，将自动为您配置 Dapr 运行状况终结点。 您无需配置任何内容。

注意：Dapr 参与者还具有一个运行状况 API 终结点，其中 Dapr 探测应用程序，以响应来自 Dapr 的信号，即执行组件应用程序是正常运行并运行的。 请参阅 [actor health API]({{< ref "actors_api.md#health-check" >}})

## 运行状况终结点：与Kubernetes集成

Kubernetes使用 * 准备就绪 * 和 * 活跃程度 * 探测器来确定容器的运行状况。

kubelet 使用活跃度探测器来了解何时重新启动容器。 例如，活跃探针可捕获应用程序正在运行但无法进行处理的死锁。 在这种状态下重新启动容器有助于使应用程序在具有错误的情况下更可用。

Kubelet 使用就绪探测器来了解容器何时准备开始接受流量。 当一个 pod 的所有容器都已准备就绪时，会认为其准备就绪。 此就绪信号的一个用途是控制哪些 Pod 用作 Kubernetes 服务的后端。 当 Pod 未就绪时，将从 Kubernetes 服务负载均衡器中除去。

与 Kubernetes 集成时， Dapr sidecar 会注入 Kubernetes 探测器配置，告知它使用 Dapr healthz 终结点。 这是由 `Sidecar Injector` 系统服务完成的。 下面的图中显示了与 kubelet 的集成。

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

在上述 *示例*中， `periodSeconds` 字段指定 kubelet 应每隔 3 秒钟执行一次活跃度探测。 `initialDelaySeconds` 字段告诉 kubelet 在执行第一个探针前应等待 3 秒钟。 在此示例中，要执行探测器， kubelet 将 HTTP GET 请求发送到正在容器中运行并侦听端口 8080的服务器。 如果服务器的 /healthz 路径的处理程序返回成功代码，那么 kubelet 将认为容器是活动的并且是健康的。 如果处理程序返回失败代码，kubelet 将杀死容器并重新启动它。

任何大于或等于 200 且小于 400 的代码表示成功。 任何其他代码表示失败。

### 如何在Kubernetes配置准备就绪探测器

准备就绪探测器与活跃度探测器配置相类似。 唯一的区别在于您使用 `的 readinessProbe` 字段而不是 `livenessProbe` 字段。

```
readinessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

### 如何使用 Kubernetes 配置 Dapr sidecar 运行状况终结点
如上所述，此配置由 Sidecar Injector 服务自动完成。 本部分描述了在活跃度和就绪探测器上设置的特定值。

Dapr 在端口 3500 上有其 HTTP 运行状况终结点 `/v1.0/healthz` ，这可以与 Kubernetes 一起用于准备就绪和活跃度探测。 当注入Dapr sidecar后，准备就绪和活跃度探测器在pod配置文件中配置的，配置的值如下。

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
