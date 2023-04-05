---
type: docs
title: "环境变量引用"
linkTitle: "环境变量"
description: "Dapr 使用的环境变量列表"
weight: 300
---

下表列出了 Dapr 运行时， CLI 或应用程序中使用的环境变量:

| 环境变量                          | 使用方          | 说明                                                                                                                                                                                 |
| ----------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP_ID                        | 您的应用程序       | 用于服务发现的应用程序 Id                                                                                                                                                                     |
| APP_PORT                      | 您的应用程序       | 应用程序正在侦听的端口                                                                                                                                                                        |
| APP_API_TOKEN               | 您的应用程序       | 应用程序用于对来自 Dapr API 的请求进行身份验证的令牌。 阅读[ 使用令牌认证对来自 Dapr 的请求进行认证]({{< ref app-api-token >}})以获取更多信息。                                                                                    |
| DAPR_HTTP_PORT              | 您的应用程序       | Dapr sidecar 正在监听的 HTTP 端口. 应用程序应使用此变量连接到 Dapr sidecar，而不是对端口值进行硬编码。 在自托管模式下由 Dapr CLI run 命令设置，或由 dapr-sidecar-injector 注入到 pod 中的所有容器中。                                          |
| DAPR_GRPC_PORT              | 您的应用程序       | Dapr sidecar 正在监听的 gRPC 端口. 应用程序应使用此变量连接到 Dapr sidecar，而不是对端口值进行硬编码。 在自托管模式下由 Dapr CLI run 命令设置，或由 dapr-sidecar-injector 注入到 pod 中的所有容器中。                                          |
| DAPR_METRICS_PORT           | 您的应用程序       | Dapr 发送指标信息的 HTTP [Prometheus]({{< ref prometheus >}}) 端口。 使用此变量，应用程序将发送其特定于应用程序的指标，以同时具有 Dapr 指标和应用程序指标。 有关详细信息，请参阅 [metrics-port]({{< ref arguments-annotations-overview>}})     |
| DAPR_PROFILE_PORT           | 您的应用程序       | [分析端口]({{< ref profiling-debugging >}}) Dapr 允许您通过该端口启用分析并跟踪应用程序行为中可能的 CPU/内存/资源峰值。 由 dapr CLI 中的 `--enable-profiling` 命令启用，用于 Dapr 注释容器中的自托管或 `dapr.io/enable-profiling` 注释。      |
| DAPR_API_TOKEN              | Dapr sidecar | 用于来自应用程序的请求的 Dapr API 认证的令牌. 用于来自应用程序的请求的 Dapr API 认证的令牌. 阅读[在 Dapr中启用 API 令牌认证]({{< ref api-token >}}) 以获取更多信息. [Enable API token authentication in Dapr]({{< ref api-token >}}). |
| NAMESPACE                     | Dapr sidecar | 自托管模式下用于指定组件的[命名空间]({{< ref component-scopes >}}).                                                                                                                                 |
| DAPR_DEFAULT_IMAGE_REGISTRY | Dapr CLI     | 在自托管模式下，它用于指定要从中提取映像的默认容器注册表。 当它的值设置为 `GHCR` 或 `ghcr`时，它会从 Github 容器注册表中提取所需的映像。 若要默认为 Docker 中心，请取消设置此环境变量。                                                                       |
