---
type: docs
title: "Sidecar 运行状况"
linkTitle: "Sidecar health"
weight: 5000
description: Dapr sidecar 运行状况检查。
---

Dapr provides a way to determine it's health using an HTTP /healthz endpoint. 通过此端点，对Dapr 进程或 sidecar进行探测，可以确定其运行状况，从而确定其就绪程度和活跃度。 请参阅 [health API ]({{< ref health_api.md >}})

The Dapr `/healthz` endpoint can be used by health probes from the application hosting platform. 本主题描述 Dapr 如何与来自不同托管平台的探测器集成。 本主题描述 Dapr 如何与来自不同托管平台的探测器集成。

As a user, when deploying Dapr to a hosting platform (for example Kubernetes), the Dapr health endpoint is automatically configured for you. 您无需配置任何内容。 您无需配置任何内容。

Dapr provides a way to determine it's health using an HTTP /healthz endpoint. 通过此端点，对Dapr 进程或 sidecar进行探测，可以确定其运行状况，从而确定其就绪程度和活跃度。 请参阅 [health API ]({{< ref health_api.md >}})

## 运行状况终结点：与Kubernetes集成

Kubernetes使用 * 准备就绪 * 和 * 活跃程度 * 探测器来确定容器的运行状况。

The kubelet uses liveness probes to know when to restart a container. 例如，活跃探针可捕获应用程序正在运行但无法进行处理的死锁。 例如，活跃探针可捕获应用程序正在运行但无法进行处理的死锁。 在这种状态下重新启动容器有助于使应用程序在具有错误的情况下更可用。

The kubelet uses readiness probes to know when a container is ready to start accepting traffic. 当一个 pod 的所有容器都已准备就绪时，会认为其准备就绪。 当一个 pod 的所有容器都已准备就绪时，会认为其准备就绪。 此就绪信号的一个用途是控制哪些 Pod 用作 Kubernetes 服务的后端。 当 Pod 未就绪时，将从 Kubernetes 服务负载均衡器中除去。

When integrating with Kubernetes, the Dapr sidecar is injected with a Kubernetes probe configuration telling it to use the Dapr healthz endpoint. 这是由 `Sidecar Injector` 系统服务完成的。 这是由 `Sidecar Injector` 系统服务完成的。 下面的图中显示了与 kubelet 的集成。

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

In the above *example*, the `periodSeconds` field specifies that the kubelet should perform a liveness probe every 3 seconds. `initialDelaySeconds` 字段告诉 kubelet 在执行第一个探针前应等待 3 秒钟。 `initialDelaySeconds` 字段告诉 kubelet 在执行第一个探针前应等待 3 秒钟。 在此示例中，要执行探测器， kubelet 将 HTTP GET 请求发送到正在容器中运行并侦听端口 8080的服务器。 如果服务器的 /healthz 路径的处理程序返回成功代码，那么 kubelet 将认为容器是活动的并且是健康的。 如果处理程序返回失败代码，kubelet 将杀死容器并重新启动它。

Any code greater than or equal to 200 and less than 400 indicates success. 任何其他代码表示失败。 任何其他代码表示失败。

### 如何在Kubernetes配置准备就绪探测器

准备就绪探测器与活跃度探测器配置相类似。 The only difference is that you use the `readinessProbe` field instead of the `livenessProbe` field.

```
readinessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

### 如何使用 Kubernetes 配置 Dapr sidecar 运行状况终结点
As mentioned above, this configuration is done automatically by the Sidecar Injector service. 本部分描述了在活跃度和就绪探测器上设置的特定值。 本部分描述了在活跃度和就绪探测器上设置的特定值。

Dapr has its HTTP health endpoint `/v1.0/healthz` on port 3500, This can be used with Kubernetes for readiness and liveness probe. 当注入Dapr sidecar后，准备就绪和活跃度探测器在pod配置文件中配置的，配置的值如下。 当注入Dapr sidecar后，准备就绪和活跃度探测器在pod配置文件中配置的，配置的值如下。

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
