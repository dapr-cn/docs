---
type: docs
title: "环境变量参考"
linkTitle: "环境变量"
description: "Dapr 使用的环境变量列表"
weight: 300
---

下表列出了 Dapr 运行时， CLI 或应用程序中使用的环境变量:

| Environment Variable          | 使用方                                 | 说明                                                                                                                                                                                              |
| ----------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP_ID                        | Your application                    | The id for your application, used for service discovery                                                                                                                                         |
| APP_PORT                      | 应用                                  | 应用程序正在监听的端口                                                                                                                                                                                     |
| APP_API_TOKEN               | 应用                                  | 应用程序用于对来自 Dapr API 的请求进行身份验证的令牌。 阅读[ 使用令牌认证对来自 Dapr 的请求进行认证]({{< ref app-api-token >}})以获取更多信息。                                                                                                 |
| DAPR_HTTP_PORT              | 应用                                  | Dapr sidecar 正在监听的 HTTP 端口. 应用程序应使用此变量连接到 Dapr sidecar，而不是对端口值进行硬编码。 在自托管模式下由 Dapr CLI run 命令设置，或由 dapr-sidecar-injector 注入到 pod 中的所有容器中。                                                       |
| DAPR_GRPC_PORT              | 应用                                  | Dapr sidecar 正在监听的 gRPC 端口. 应用程序应使用此变量连接到 Dapr sidecar，而不是对端口值进行硬编码。 在自托管模式下由 Dapr CLI run 命令设置，或由 dapr-sidecar-injector 注入到 pod 中的所有容器中。                                                       |
| DAPR_METRICS_PORT           | 应用                                  | Dapr 发送指标信息的 HTTP [Prometheus]({{< ref prometheus >}}) 端口。 使用此变量，应用程序将发送其特定于应用程序的指标，以同时具有 Dapr 指标和应用程序指标。 有关详细信息，请参阅 [metrics-port]({{< ref arguments-annotations-overview>}})                  |
| DAPR_PROFILE_PORT           | Your application                    | [分析端口]({{< ref profiling-debugging >}}) Dapr 允许您通过该端口启用分析并跟踪应用程序行为中可能的 CPU/内存/资源峰值。 由 dapr CLI 中的 `--enable-profiling` 命令启用，用于 Dapr 注释容器中的自托管或 `dapr.io/enable-profiling` 注释。                   |
| DAPR_API_TOKEN              | Dapr sidecar                        | The token used for Dapr API authentication for requests from the application. [Enable API token authentication in Dapr]({{< ref api-token >}}).                                                 |
| NAMESPACE                     | Dapr sidecar                        | Used to specify a component's [namespace in self-hosted mode]({{< ref component-scopes >}}).                                                                                                    |
| DAPR_DEFAULT_IMAGE_REGISTRY | Dapr CLI                            | 在自托管模式下，它用于指定要从中提取映像的默认容器注册表。 当它的值设置为 `GHCR` 或 `ghcr`时，它会从 Github 容器注册表中提取所需的映像。 若要默认为 Docker 中心，请取消设置此环境变量。                                                                                    |
| SSL_CERT_DIR                | Dapr sidecar                        | Specifies the location where the public certificates for all the trusted certificate authorities (CA) are located. Not applicable when the sidecar is running as a process in self-hosted mode. |
| DAPR_HELM_REPO_URL          | Your private Dapr Helm chart url    | Specifies a private Dapr Helm chart url, which defaults to the official Helm chart URL: `https://dapr.github.io/helm-charts`                                                                    |
| DAPR_HELM_REPO_USERNAME     | A username for a private Helm chart | The username required to access the private Dapr Helm chart. If it can be accessed publicly, this env variable does not need to be set                                                          |
| DAPR_HELM_REPO_PASSWORD     | A password for a private Helm chart | The password required to access the private Dapr helm chart. If it can be accessed publicly, this env variable does not need to be set                                                          | 
