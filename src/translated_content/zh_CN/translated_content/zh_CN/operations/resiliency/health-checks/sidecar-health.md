---
type: docs
title: "Sidecar 健康检查"
linkTitle: "Sidecar 健康检查"
weight: 200
description: Dapr sidecar 健康检查。
---

Dapr 提供了一种使用 [HTTP `/healthz` 端点确定其健康状况的方法]({{< ref health_api.md >}})。 有了这个端点， *daprd* 进程或 sidecar 就可以：

- 检测其健康状况
- 确定是否准备就绪和有效

In this guide, you learn how the Dapr `/healthz` endpoint integrate with health probes from the application hosting platform (for example, Kubernetes).

当将 Dapr 部署到像 Kubernetes 这样的主机平台时，Dapr 健康端点会自动为您配置。

{{% alert title="Note" color="primary" %}}
注意：Dapr actor 还有一个健康 API 端点，Dapr 会探测对 Dapr 信号的响应申请，该信号表示 actor 应用程序是健康且运行的。 请参阅 [actor health API]({{< ref "actors_api.md#health-check" >}}).
{{% /alert %}}

## 运行状况端点：与 Kubernetes 集成

Kubernetes 使用 * readiness * 和 * liveness * 探针来确定容器的健康。

### Liveness
The kubelet uses liveness probes to know when to restart a container. For example, liveness probes could catch a deadlock (a running application that is unable to make progress). 在这种状态下重新启动容器有助于使应用程序在具有错误的情况下更可用。

#### 如何在 Kubernetes 中配置活跃度探测器

在 pod 配置文件中，活跃度探测器将添加到容器规范部分中，如下所示:

```yaml
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

在上面的例子中， `periodSeconds` 字段指定 kubelet 应每 3 秒执行一次存活探测。 `initialDelaySeconds` 字段告诉 kubelet 在执行第一个探针前应等待 3 秒钟。 在此示例中，要执行探测器，kubelet将HTTP GET请求发送到正在容器中运行并侦听端口8080的服务器。 如果服务器的 `/healthz` path 返回一个成功代码，kubelet 认为容器是活的和健康的。 如果处理程序返回失败代码，kubelet 将杀死容器并重新启动它。

任何在200至399之间的HTTP状态码表示成功；任何其他状态码表示失败。

### Readiness
Kubelet 使用 readiness 探针来了解容器何时准备好开始接受流量。 当一个 pod 的所有容器都已准备就绪时，会认为其准备就绪。 此就绪信号的一个用途是控制哪些 Pod 用作 Kubernetes 服务的后端。 当 Pod 未就绪时，将从 Kubernetes 服务负载均衡器中除去。

{{% alert title="Note" color="primary" %}}
一旦应用程序可以通过其配置的端口访问，Dapr sidecar 就会进入就绪状态。 在应用程序启动/初始化期间，应用程序无法访问 Dapr 组件。
{{% /alert %}}

#### 如何在 Kubernetes 配置准备就绪探测器

Readiness 探测器与 liveness 探测器配置相类似。 唯一的区别是您使用 `readinessProbe` 字段，而不是 `livenessProbe` 字段：

```yaml
    readinessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

### Sidecar Injector

When integrating with Kubernetes, the Dapr sidecar is injected with a Kubernetes probe configuration telling it to use the Dapr `healthz` endpoint. 这是由"Sidecar Injector"系统服务完成的。 下面的图中显示了与 kubelet 的集成。

<img src="/images/security-mTLS-dapr-system-services.png" width="800" alt="Dapr 服务相互交互的图示" />

#### 如何使用 Kubernetes 配置 Dapr sidecar 健康检查端点

如上所述，此配置由 Sidecar 注入服务自动完成。 本部分描述了在 readiness 和 liveness 探测器上设置的特定值。

Dapr在端口3500上有其HTTP健康端点 `/v1.0/healthz` 。 这可以与Kubernetes一起用于 readiness 和 liveness 探针。 当注入Dapr sidecar后，readiness 和 liveness 探测器在pod配置文件中配置的，配置的值如下。

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

## 相关链接

- [端点健康检查 API]({{< ref health_api.md >}})
- [Actor 健康 API]({{< ref "actors_api.md#health-check" >}})
- [Kubernetes探针配置参数](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
