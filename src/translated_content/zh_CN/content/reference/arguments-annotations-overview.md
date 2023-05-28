---
type: docs
title: "Dapr 参数和 daprd, CLI 和 Kubernetes 的注解"
linkTitle: "参数和注解"
description: "在不同环境中配置 Dapr 时可用的参数和注解"
weight: 300
aliases:
  - "/zh-hans/operations/hosting/kubernetes/kubernetes-annotations/"
---

此表旨在帮助用户了解在不同上下文中运行 Dapr sidecar 的等效选项 - 直接通过 [CLI ]({{< ref cli-overview.md >}}) ，通过 daprd，或通过 [Kubernetes 上的 annotations ]({{< ref kubernetes-overview.md >}})。

| daprd                              | Dapr CLI                     | CLI 简略表达式 | Kubernetes annotations                            | 说明                                                                                                                                                                                                                                 |
| ---------------------------------- | ---------------------------- | --------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--allowed-origins`                | 不支持                          |           | 不支持                                               | 允许的 HTTP 源(默认为 "*")。                                                                                                                                                                                                               |
| `--app-id`                         | `--app-id`                   | `-i`      | `dapr.io/app-id`                                  | 应用程序唯一 ID。 用于服务发现、状态封装 和 发布/订阅 消费者ID                                                                                                                                                                                               |
| `--app-port`                       | `--app-port`                 | `-p`      | `dapr.io/app-port`                                | 这个参数告诉Dapr你的应用程序正在监听哪个端口。                                                                                                                                                                                                          |
| `--app-ssl`                        | `--app-ssl`                  |           | `dapr.io/app-ssl`                                 | 将应用的 URI 方案设置为 https 并尝试 SSL 连接                                                                                                                                                                                                    |
| `--components-path`                | `--components-path`          | `-d`      | 不支持                                               | Components 目录的路径. 如果为空，将不会加载组件。                                                                                                                                                                                                    |
| `--config`                         | `--config`                   | `-c`      | `dapr.io/config`                                  | 告诉 Dapr 要使用哪个配置 CRD                                                                                                                                                                                                                |
| `--control-plane-address`          | 不支持                          |           | 不支持                                               | Dapr 控制平面的地址                                                                                                                                                                                                                       |
| `--dapr-grpc-port`                 | `--dapr-grpc-port`           |           | 不支持                                               | dapr API监听的 gRPC 端口 (默认 "50001")                                                                                                                                                                                                   |
| `--dapr-http-port`                 | `--dapr-http-port`           |           | 不支持                                               | Dapr API 的 HTTP 端口                                                                                                                                                                                                                 |
| `--dapr-http-max-request-size`     | --dapr-http-max-request-size |           | `dapr.io/http-max-request-size`                   | 增加http和grpc服务器请求正文参数的最大大小，单位为MB，以处理大文件的上传。 默认值为 `4` MB                                                                                                                                                                             |
| `--dapr-http-read-buffer-size`     | --dapr-http-read-buffer-size |           | `dapr.io/http-read-buffer-size`                   | 增加发送多 KB 标头时要处理的 http 标头读取缓冲区的最大大小（以 KB 为单位）。 默认 4 KB。  当发送大于默认 4KB http 标头时，应将其设置为较大的值，例如 16（对于 16KB）                                                                                                                             |
| 不支持                                | `--image`                    |           | `dapr.io/sidecar-image`                           | Dapr sidecar 镜像。 默认值为 `daprio/daprd:latest`. 在构建自己的 Dapr 自定义映像时使用此映像，Dapr sidecar 将使用此映像而不是 Dapr 的默认映像                                                                                                                             |
| `--internal-grpc-port`             | 不支持                          |           | 不支持                                               | 用于监听 Dapr 内部 API 的 gRPC 端口                                                                                                                                                                                                         |
| `--enable-metrics`                 | 不支持                          |           | configuration spec                                | 启用 Prometheus 度量(默认true)                                                                                                                                                                                                           |
| `--enable-mtls`                    | 不支持                          |           | configuration spec                                | 为 daprd 到 daprd 通信通道启用自动 mTLS                                                                                                                                                                                                      |
| `--enable-profiling`               | `--enable-profiling`         |           | `dapr.io/enable-profiling`                        | 启用性能分析                                                                                                                                                                                                                             |
| `--unix-domain-socket`             | `--unix-domain-socket`       | `-u`      | `dapr.io/unix-domain-socket-path`                 | 在 Linux 上，与 Dapr sidecar 通信时，与 TCP 端口相比，使用 unix domain socket 以获得更低的延迟和更大的吞吐量。 在 Windows 操作系统上不可用                                                                                                                                  |
| `--log-as-json`                    | 不支持                          |           | `dapr.io/log-as-json`                             | 将此参数设置为`true`以JSON格式输出日志。 默认值为 `false`.                                                                                                                                                                                            |
| `--log-level`                      | `--log-level`                |           | `dapr.io/log-level`                               | 为 Dapr sidecar设置日志级别。 允许的值是`debug`，`info`，`warn`，`error`。 默认是 `info`                                                                                                                                                               |
| `--enable-api-logging`             | `--enable-api-logging`       |           | `dapr.io/enable-api-logging`                      | 为 Dapr sidecar 启用 API 日志记录                                                                                                                                                                                                         |
| `--app-max-concurrency`            | `--app-max-concurrency`      |           | `dapr.io/app-max-concurrency`                     | 限制应用程序的并发量。 有效的数值是大于 `0`                                                                                                                                                                                                           |
| `--metrics-port`                   | `--metrics-port`             |           | `dapr.io/metrics-port`                            | 设置 sidecar 度量服务器的端口。 默认值为 `9090`                                                                                                                                                                                                   |
| `--mode`                           | 不支持                          |           | 不支持                                               | Dapr 的运行时模式（默认"独立"）                                                                                                                                                                                                                |
| `--placement-address`              | `--placement-address`        |           | 不支持                                               | Dapr Actor 放置服务器的地址                                                                                                                                                                                                                |
| `--profiling-port`                 | `--profiling-port`           |           | 不支持                                               | 配置文件服务器端口(默认 "7777")                                                                                                                                                                                                               |
| `--app-protocol`                   | `--app-protocol`             | `-P`      | `dapr.io/app-protocol`                            | 告诉 Dapr 你的应用程序正在使用哪种协议。 有效选项是 `http` and `grpc`。 默认值 `"http"`                                                                                                                                                                      |
| `--sentry-address`                 | `--sentry-address`           |           | 不支持                                               | Sentry CA 服务地址                                                                                                                                                                                                                     |
| `版本`                               | `版本`                         | `-v`      | 不支持                                               | 输出运行时版本                                                                                                                                                                                                                            |
| `--dapr-graceful-shutdown-seconds` | 不支持                          |           | `dapr.io/graceful-shutdown-seconds`               | Dapr 的正常关机持续时间（以秒为单位），这是等待所有正在进行的请求完成时强制关机前的最长时间。 默认值为 `5`。 如果您在 Kubernetes 模式下运行，则此值不应大于 Kubernetes 终止宽限期，其默认值为 `30`。                                                                                                             |
| 不支持                                | 不支持                          |           | `dapr.io/enabled`                                 | 将此参数设置为 true 会将 Dapr sidecar 注入 pod 中                                                                                                                                                                                              |
| 不支持                                | 不支持                          |           | `dapr.io/api-token-secret`                        | 告诉Dapr使用哪个Kubernetes密钥来进行基于令牌的API认证。 默认情况下未设置                                                                                                                                                                                      |
| `--dapr-listen-address`            | 不支持                          |           | `dapr.io/sidecar-listen-addresses`                | 以逗号分隔的 sidecar 将监听的 IP 地址列表。 在独立模式下默认为 all。 Kubernetes默认为 `[:1],127.0.0.1`。 若要监听所有IPv4地址，请使用 `0.0.0.0`。 要监听所有IPv6地址，请使用 `[:]`。                                                                                                     |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-cpu-limit`                       | Dapr sidecar可以使用的最大CPU数量。 请参阅 [此处](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/) 的有效值。 默认情况下未设置                                                                                |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-memory-limit`                    | Dapr sidecar可以使用的最大内存量。 请参阅 [此处](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/) 的有效值。 默认情况下未设置                                                                                  |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-cpu-request`                     | Dapr sidecar要求的 CPU 数量。 请参阅 [此处](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/) 的有效值。 默认情况下未设置                                                                                  |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-memory-request`                  | Dapr sidecar 请求的内存数量。请参阅 [此处](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/) 的有效值。 默认情况下未设置                                                                                     |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-liveness-probe-delay-seconds`    | Sidecar容器启动后的秒数，然后才启动活度探测。 在 [此处](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes) 阅读更多 默认值为 `3`                                                            |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-liveness-probe-timeout-seconds`  | Sidecar 存活探针超时的秒数。 在 [此处](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes) 阅读更多 默认值为 `3`                                                                    |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-liveness-probe-period-seconds`   | 每隔多长时间（以秒为单位）进行一次 sidecar 存活探针。 在 [此处](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes) 阅读更多 默认值为 `6`                                                       |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-liveness-probe-threshold`        | 当 sidecar 存活探针失败时，Kubernetes会在放弃之前尝试N次。 在这种情况下，Pod 将被标记为不健康。 在 [此处](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes) 阅读更多关于 `failureThreshold` 。 默认值为 `3`   |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-readiness-probe-delay-seconds`   | Sidecar 容器启动后，启动准备就绪探针前的秒数。 在 [此处](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes) 阅读更多 默认值为 `3`                                                           |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-readiness-probe-timeout-seconds` | Sidecar 准备就绪探针超时的秒数。 在 [此处](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes) 阅读更多 默认值为 `3`                                                                  |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-readiness-probe-period-seconds`  | 每个多长时间（以秒为单位）进行一次 sidecar 准备就绪探针。 在 [此处](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes) 阅读更多 默认值为 `6`                                                     |
| 不支持                                | 不支持                          |           | `dapr.io/sidecar-readiness-probe-threshold`       | 当 sidecar 准备就绪探针失败时，Kubernetes会在放弃之前尝试N次。 在这种情况下，Pod 将被标记为未就绪。 在 [此处](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes) 阅读更多关于 `failureThreshold` 。 默认值为 `3` |
| 不支持                                | 不支持                          |           | `dapr.io/env`                                     | 要注入 sidecar 的环境变量列表。 由逗号分隔的 key=value 字符串                                                                                                                                                                                          |