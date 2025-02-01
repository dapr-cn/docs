---
type: docs
title: "annotate CLI 命令参考"
linkTitle: "annotate"
description: "在 Kubernetes 配置中添加 Dapr 注解"
---

### 描述

在 Kubernetes 配置中添加 Dapr 注解。这允许您在部署文件中添加或更改 Dapr 注解。有关每个可用注解的详细说明，请参见 [Kubernetes 注解]({{< ref arguments-annotations-overview >}})。

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr annotate [flags] CONFIG-FILE
```

### 标志

| 名称 | 环境变量 | 默认值 | 描述
| --- | --- | --- | --- |
| `--kubernetes, -k` | | | 将注解应用于 Kubernetes 资源。必需 |
| `--api-token-secret` | | | 用于 API token 的 secret |
| `--app-id, -a` | | | 要注解的应用 ID |
| `--app-max-concurrency` | | `-1` | 允许的最大并发请求数 |
| `--app-port, -p` | | `-1` | 用于暴露应用的端口 |
| `--app-protocol` | | | 应用使用的协议：`http`（默认），`grpc`，`https`，`grpcs`，`h2c` |
| `--app-token-secret` | | | 用于应用 token 的 secret |
| `--config, -c` | | | 要注解的配置文件 |
| `--cpu-limit` | | | 为 sidecar 设置的 CPU 限制。查看有效值 [这里](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)。 |
| `--cpu-request` | | | 为 sidecar 设置的 CPU 请求。查看有效值 [这里](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)。 |
| `--dapr-image` | | | 用于 dapr sidecar 容器的镜像 |
| `--enable-debug` | | `false` | 启用调试 |
| `--enable-metrics` | | `false` | 启用指标 |
| `--enable-profile` | | `false` | 启用分析 |
| `--env` | | | 要设置的环境变量（键值对，逗号分隔） |
| `--graceful-shutdown-seconds` | | `-1` | 等待应用关闭的秒数 |
| `--help, -h` | | | annotate 的帮助信息 |
| `--listen-addresses` | | | sidecar 监听的地址。要监听所有 IPv4 地址，请使用 `0.0.0.0`。要监听所有 IPv6 地址，请使用 `[::]`。 |
| `--liveness-probe-delay` | | `-1` | sidecar 用于存活探测的延迟。阅读更多 [这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。 |
| `--liveness-probe-period` | | `-1` | sidecar 用于存活探测的周期。阅读更多 [这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。 |
| `--liveness-probe-threshold` | | `-1` | sidecar 用于存活探测的阈值。阅读更多 [这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。 |
| `--liveness-probe-timeout` | | `-1` | sidecar 用于存活探测的超时。阅读更多 [这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。 |
| `--log-level` | | | 使用的日志级别 |
| `--max-request-body-size` | | `-1` | 使用的最大请求体大小 |
| `--http-read-buffer-size` | | `-1` | HTTP 头读取缓冲区的最大大小（以千字节为单位） | 
| `--memory-limit` | | | 为 sidecar 设置的内存限制。查看有效值 [这里](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/) |
| `--memory-request`| | | 为 sidecar 设置的内存请求 |
| `--metrics-port` | | `-1` | 用于暴露指标的端口 |
| `--namespace, -n` | | | 资源目标所在的命名空间（仅在设置 `--resource` 时可用） |
| `--readiness-probe-delay` | | `-1` | sidecar 用于就绪探测的延迟。阅读更多 [这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。|
| `--readiness-probe-period` | | `-1` | sidecar 用于就绪探测的周期。阅读更多 [这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。 |
| `--readiness-probe-threshold` | | `-1` | sidecar 用于就绪探测的阈值。阅读更多 [这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。 |
| `--readiness-probe-timeout` | | `-1` | sidecar 用于就绪探测的超时。阅读更多 [这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。 |
| `--resource, -r` | | | 要注解的 Kubernetes 资源目标 |
| `--enable-api-logging` | | | 为 Dapr sidecar 启用 API 日志记录 |
| `--unix-domain-socket-path` | | | 用于与 Dapr sidecar 通信的 Linux 域套接字路径 | 
| `--volume-mounts` | | | 要以只读模式挂载到 sidecar 容器的 pod 卷列表 | 
| `--volume-mounts-rw` | | | 要以读写模式挂载到 sidecar 容器的 pod 卷列表 | 
| `--disable-builtin-k8s-secret-store` | | | 禁用内置的 Kubernetes secret 存储 |
| `--placement-host-address` | | | Dapr actor 放置服务器的地址列表（逗号分隔） |

{{% alert title="警告" color="warning" %}}
如果未使用 `--app-id, -a` 提供应用 ID，将自动生成一个格式为 `<namespace>-<kind>-<name>` 的 ID。
{{% /alert %}}

### 示例

```bash 
# 注解输入中找到的第一个部署
kubectl get deploy -l app=node -o yaml | dapr annotate -k - | kubectl apply -f -

# 按名称在链中注解多个部署
kubectl get deploy -o yaml | dapr annotate -k -r nodeapp - | dapr annotate -k -r pythonapp - | kubectl apply -f -

# 从文件或目录中按名称注解特定命名空间中的部署
dapr annotate -k -r nodeapp -n namespace mydeploy.yaml | kubectl apply -f -

# 从 URL 按名称注解部署
dapr annotate -k -r nodeapp --log-level debug https://raw.githubusercontent.com/dapr/quickstarts/master/tutorials/hello-kubernetes/deploy/node.yaml | kubectl apply -f -
