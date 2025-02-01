---
type: docs
title: "Dapr 参数和注解用于 daprd、CLI 和 Kubernetes"
linkTitle: "参数和注解"
description: "在不同环境中配置 Dapr 时可用的参数和注解"
weight: 300
aliases:
  - "/zh-hans/operations/hosting/kubernetes/kubernetes-annotations/"
---

此表旨在帮助用户了解在不同环境中运行 Dapr sidecar 的对应选项：通过 [CLI]({{< ref cli-overview.md >}}) 直接运行，通过 daprd，或在 [Kubernetes]({{< ref kubernetes-overview.md >}}) 上通过注解运行。

| daprd | Dapr CLI | CLI 简写 | Kubernetes 注解 | 描述 |
|----- | ------- | -----------| ----------| ------------ |
| `--allowed-origins`  | 不支持 |  | 不支持 | 允许的 HTTP 来源（默认 "*"） |
| `--app-id` | `--app-id` | `-i` | `dapr.io/app-id`  | 应用程序的唯一 ID。用于服务发现、状态封装和 pub/sub 消费者 ID |
| `--app-port` | `--app-port` | `-p` | `dapr.io/app-port` | 指定应用程序监听的端口 |
| `--components-path`  | `--components-path` | `-d` | 不支持 | **已弃用**，建议使用 `--resources-path` |
| `--resources-path`  | `--resources-path` | `-d` | 不支持 | 组件目录的路径。如果为空，则不会加载组件 |
| `--config`  | `--config` | `-c` | `dapr.io/config` | 指定 Dapr 使用的配置资源 |
| `--control-plane-address` | 不支持 | | 不支持 | Dapr 控制平面的地址 |
| `--dapr-grpc-port` | `--dapr-grpc-port` | | `dapr.io/grpc-port` | 设置 Dapr API gRPC 端口（默认 `50001`）；所有集群服务必须使用相同的端口进行通信 |
| `--dapr-http-port` | `--dapr-http-port` | | 不支持 | Dapr API 监听的 HTTP 端口（默认 `3500`） |
| `--dapr-http-max-request-size` | `--dapr-http-max-request-size` | | `dapr.io/http-max-request-size` | **已弃用**，建议使用 `--max-body-size`。增加请求最大主体大小以处理使用 http 和 grpc 协议的大文件上传。默认是 `4` MB |
| `--max-body-size` | 不支持 | | `dapr.io/max-body-size` | 增加请求最大主体大小以处理使用 http 和 grpc 协议的大文件上传。使用大小单位设置值（例如，`16Mi` 表示 16MB）。默认是 `4Mi` |
| `--dapr-http-read-buffer-size` | `--dapr-http-read-buffer-size` | | `dapr.io/http-read-buffer-size` | **已弃用**，建议使用 `--read-buffer-size`。增加 http 头读取缓冲区的最大大小（以 KB 为单位）以支持更大的头值，例如 `16` 支持最大 16KB 的头。默认是 `16` 表示 16KB |
| `--read-buffer-size` | 不支持 | | `dapr.io/read-buffer-size` | 增加 http 头读取缓冲区的最大大小（以 KB 为单位）以支持更大的头值。使用大小单位设置值，例如 `32Ki` 将支持最大 32KB 的头。默认是 `4` 表示 4KB |
| 不支持 | `--image` | | `dapr.io/sidecar-image` | Dapr sidecar 镜像。默认是 daprio/daprd:latest。Dapr sidecar 使用此镜像而不是最新的默认镜像。当构建您自己的 Dapr 自定义镜像或[使用替代的稳定 Dapr 镜像]({{< ref "support-release-policy.md#build-variations" >}})时使用此选项 |
| `--internal-grpc-port` | 不支持 | | `dapr.io/internal-grpc-port` | 设置内部 Dapr gRPC 端口（默认 `50002`）；所有集群服务必须使用相同的端口进行通信 |
| `--enable-metrics` | 不支持 | | 配置规范 | 启用 [prometheus 指标]({{< ref prometheus >}})（默认 true） |
| `--enable-mtls` | 不支持 | | 配置规范 | 启用 daprd 到 daprd 通信通道的自动 mTLS |
| `--enable-profiling` | `--enable-profiling` | | `dapr.io/enable-profiling` | [启用分析]({{< ref profiling-debugging >}}) |
| `--unix-domain-socket` | `--unix-domain-socket` | `-u` | `dapr.io/unix-domain-socket-path`  | 套接字文件的父目录。在 Linux 上，与 Dapr sidecar 通信时，使用 unix 域套接字以获得比 TCP 端口更低的延迟和更高的吞吐量。在 Windows 操作系统上不可用。 |
| `--log-as-json` | 不支持 | | `dapr.io/log-as-json` | 将此参数设置为 `true` 输出[JSON 格式的日志]({{< ref logs >}})。默认是 `false` |
| `--log-level` | `--log-level` | | `dapr.io/log-level` | 设置 Dapr sidecar 的[日志级别]({{< ref logs-troubleshooting >}})。允许的值是 `debug`、`info`、`warn`、`error`。默认是 `info` |
| `--enable-api-logging` | `--enable-api-logging` | | `dapr.io/enable-api-logging` | 为 Dapr sidecar [启用 API 日志记录]({{< ref "api-logs-troubleshooting.md#configuring-api-logging-in-kubernetes" >}}) |
| `--app-max-concurrency` | `--app-max-concurrency` | | `dapr.io/app-max-concurrency` | 限制[应用程序的并发性]({{< ref "control-concurrency.md#setting-app-max-concurrency" >}})。有效值是大于 `0` 的任何数字。默认值：`-1`，表示无并发。 |
| `--metrics-port` | `--metrics-port` | | `dapr.io/metrics-port` | 设置 sidecar 指标服务器的端口。默认是 `9090` |
| `--mode` | 不支持 | | 不支持 | Dapr 的运行时托管选项模式，可以是 `"standalone"` 或 `"kubernetes"`（默认 `"standalone"`）。[了解更多。]({{< ref hosting >}}) |
| `--placement-host-address` | `--placement-host-address` | | `dapr.io/placement-host-address` | Dapr actor 放置服务器的地址列表，以逗号分隔。<br><br>当未设置注解时，默认值由 Sidecar Injector 设置。<br><br>当注解设置且值为单个空格（`' '`）或 "empty" 时，sidecar 不连接到放置服务器。这可以在 sidecar 中没有运行 actor 时使用。<br><br>当注解设置且值不为空时，sidecar 连接到配置的地址。例如：`127.0.0.1:50057,127.0.0.1:50058` |
| `--scheduler-host-address` | `--scheduler-host-address` | | `dapr.io/scheduler-host-address` | Dapr 调度服务器的地址列表，以逗号分隔。<br><br>当未设置注解时，默认值由 Sidecar Injector 设置。<br><br>当注解设置且值为单个空格（`' '`）或 "empty" 时，sidecar 不连接到调度服务器。<br><br>当注解设置且值不为空时，sidecar 连接到配置的地址。例如：`127.0.0.1:50055,127.0.0.1:50056` |
| `--actors-service` | 不支持 | | 不支持 | 提供 actor 放置信息的服务的配置。格式为 `<name>:<address>`。例如，将此值设置为 `placement:127.0.0.1:50057,127.0.0.1:50058` 是使用 `--placement-host-address` 标志的替代方法。 |
| `--reminders-service` | 不支持 | | 不支持 | 启用 actor 提醒的服务的配置。格式为 `<name>[:<address>]`。目前，唯一支持的值是 `"default"`（这也是默认值），它使用 Dapr sidecar 中的内置提醒子系统。 |
| `--profiling-port` | `--profiling-port` | | 不支持 | 配置文件服务器的端口（默认 `7777`） |
| `--app-protocol` | `--app-protocol` | `-P` | `dapr.io/app-protocol` | 配置 Dapr 用于与您的应用程序通信的协议。有效选项是 `http`、`grpc`、`https`（带 TLS 的 HTTP）、`grpcs`（带 TLS 的 gRPC）、`h2c`（HTTP/2 明文）。请注意，Dapr 不验证应用程序提供的 TLS 证书。默认是 `http` |
| `--enable-app-health-check` | `--enable-app-health-check` | | `dapr.io/enable-app-health-check` | 启用[健康检查]({{< ref "app-health.md#configuring-app-health-checks" >}})的布尔值。默认是 `false`。 |
| `--app-health-check-path` | `--app-health-check-path` | | `dapr.io/app-health-check-path` | 当应用程序通道为 HTTP 时，Dapr 调用的健康探测路径（如果应用程序通道使用 gRPC，则忽略此值）。需要[启用应用程序健康检查]({{< ref "app-health.md#configuring-app-health-checks" >}})。默认是 `/healthz`。 |
| `--app-health-probe-interval` | `--app-health-probe-interval` | | `dapr.io/app-health-probe-interval` | 每次健康探测之间的*秒数*。需要[启用应用程序健康检查]({{< ref "app-health.md#configuring-app-health-checks" >}})。默认是 `5` |
| `--app-health-probe-timeout` | `--app-health-probe-timeout` | | `dapr.io/app-health-probe-timeout` | 健康探测请求的超时时间（以*毫秒*为单位）。需要[启用应用程序健康检查]({{< ref "app-health.md#configuring-app-health-checks" >}})。默认是 `500` |
| `--app-health-threshold` | `--app-health-threshold` | | `dapr.io/app-health-threshold"` | 在应用程序被认为不健康之前的最大连续失败次数。需要[启用应用程序健康检查]({{< ref "app-health.md#configuring-app-health-checks" >}})。默认是 `3` |
| `--sentry-address` | `--sentry-address` | | 不支持 | [Sentry CA 服务]({{< ref sentry >}})的地址 |
| `--version` | `--version` | `-v` | 不支持 | 打印运行时版本 |
| `--dapr-graceful-shutdown-seconds` | 不支持 | | `dapr.io/graceful-shutdown-seconds` | Dapr 的优雅关闭持续时间（以秒为单位），在等待所有进行中的请求完成时的最大持续时间，然后强制关闭。默认是 `5`。如果您在 Kubernetes 模式下运行，此值不应大于 Kubernetes 终止宽限期，其默认值为 `30`。|
| `--dapr-block-shutdown-duration` | 不支持 | | `dapr.io/block-shutdown-duration` | 阻止关闭的持续时间。如果设置了此参数，优雅关闭过程（如上所述）将被延迟，直到给定的持续时间已过或应用程序变得不健康（通过应用程序健康选项配置）。这对于需要在其自身终止过程中执行 Dapr API 的应用程序很有用。一旦阻止过期，应用程序将无法再调用任何 Dapr API。接受 [Go 持续时间](https://pkg.go.dev/time#ParseDuration) 字符串。 |
| 不支持 | 不支持 | | `dapr.io/enabled` | 将此参数设置为 true 将 Dapr sidecar 注入到 pod 中 |
| 不支持 | 不支持 | | `dapr.io/api-token-secret` | 指定 Dapr 使用哪个 Kubernetes secret 进行[基于令牌的 API 认证]({{< ref api-token >}})。默认情况下未设置 |
| 不支持 | 不支持 | | `dapr.io/app-token-secret` | 指定 Dapr 使用哪个 Kubernetes secret 进行[基于令牌的应用程序认证]({{< ref app-api-token >}})。默认情况下未设置 |
| `--dapr-listen-addresses` | 不支持  | | `dapr.io/sidecar-listen-addresses`                       | sidecar 将监听的 IP 地址列表，以逗号分隔。在 standalone 模式下默认为所有。在 Kubernetes 中默认为 `[::1],127.0.0.1`。要监听所有 IPv4 地址，请使用 `0.0.0.0`。要监听所有 IPv6 地址，请使用 `[::]`。|
| 不支持 | 不支持  | | `dapr.io/sidecar-cpu-limit`                       | Dapr sidecar 可以使用的最大 CPU 量。查看有效值[这里](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)。默认情况下未设置|
| 不支持 | 不支持 | | `dapr.io/sidecar-memory-limit`                    | Dapr sidecar 可以使用的最大内存量。查看有效值[这里](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)。默认情况下未设置|
| 不支持 | 不支持 | | `dapr.io/sidecar-cpu-request`                     | Dapr sidecar 请求的 CPU 量。查看有效值[这里](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)。默认情况下未设置|
| 不支持 | 不支持 | | `dapr.io/sidecar-memory-request`                  | Dapr sidecar 请求的内存量。查看有效值[这里](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)。默认情况下未设置|
| 不支持 | 不支持 | | `dapr.io/sidecar-liveness-probe-delay-seconds`    | sidecar 容器启动后启动活跃性探测之前的秒数。阅读更多[这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。默认是 `3`|
| 不支持 | 不支持 | | `dapr.io/sidecar-liveness-probe-timeout-seconds`  | sidecar 活跃性探测超时后的秒数。阅读更多[这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。默认是 `3`|
| 不支持 | 不支持 | | `dapr.io/sidecar-liveness-probe-period-seconds`   | 执行 sidecar 活跃性探测的频率（以秒为单位）。阅读更多[这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。默认是 `6`|
| 不支持 | 不支持 | | `dapr.io/sidecar-liveness-probe-threshold`        | 当 sidecar 活跃性探测失败时，Kubernetes 将尝试 N 次后放弃。在这种情况下，Pod 将被标记为不健康。阅读更多关于 `failureThreshold` 的信息[这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。默认是 `3`|
| 不支持 | 不支持 | | `dapr.io/sidecar-readiness-probe-delay-seconds`   | sidecar 容器启动后启动就绪探测之前的秒数。阅读更多[这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。默认是 `3`|
| 不支持 | 不支持 | | `dapr.io/sidecar-readiness-probe-timeout-seconds` | sidecar 就绪探测超时后的秒数。阅读更多[这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。默认是 `3`|
| 不支持 | 不支持 | | `dapr.io/sidecar-readiness-probe-period-seconds`  | 执行 sidecar 就绪探测的频率（以秒为单位）。阅读更多[这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。默认是 `6`|
| 不支持 | 不支持 | | `dapr.io/sidecar-readiness-probe-threshold`       | 当 sidecar 就绪探测失败时，Kubernetes 将尝试 N 次后放弃。在这种情况下，Pod 将被标记为未就绪。阅读更多关于 `failureThreshold` 的信息[这里](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes)。默认是 `3`|
| 不支持 | 不支持 | | `dapr.io/env`                                     | 要注入到 sidecar 中的环境变量列表。由以逗号分隔的键=值对组成的字符串。|
| 不支持 | 不支持 | | `dapr.io/env-from-secret`                         | 从 secret 注入到 sidecar 中的环境变量列表。由 `"key=secret-name:secret-key"` 对组成的字符串以逗号分隔。 |
| 不支持 | 不支持 | | `dapr.io/volume-mounts` | 以只读模式挂载到 sidecar 容器的 [pod 卷列表]({{< ref "kubernetes-volume-mounts" >}})。由 `volume:path` 对组成的字符串以逗号分隔。例如，`"volume-1:/tmp/mount1,volume-2:/home/root/mount2"`。 |
| 不支持 | 不支持 | | `dapr.io/volume-mounts-rw` | 以读写模式挂载到 sidecar 容器的 [pod 卷列表]({{< ref "kubernetes-volume-mounts" >}})。由 `volume:path` 对组成的字符串以逗号分隔。例如，`"volume-1:/tmp/mount1,volume-2:/home/root/mount2"`。 |
| `--disable-builtin-k8s-secret-store` | 不支持 | | `dapr.io/disable-builtin-k8s-secret-store` | 禁用内置 Kubernetes secret 存储。默认值为 false。有关详细信息，请参阅 [Kubernetes secret 存储组件]({{< ref "kubernetes-secret-store.md" >}})。 |
| 不支持 | 不支持 | | `dapr.io/sidecar-seccomp-profile-type` | 将 sidecar 容器的 `securityContext.seccompProfile.type` 设置为 `Unconfined`、`RuntimeDefault` 或 `Localhost`。默认情况下，此注解未在 Dapr sidecar 上设置，因此该字段从 sidecar 容器中省略。 |
