---
type: docs
title: "环境变量引用"
linkTitle: "环境变量"
description: "Dapr 使用的环境变量列表"
weight: 300
---

下表列出了 Dapr 运行时， CLI 或应用程序中使用的环境变量:

| 环境变量                | 使用方          | 说明                                                                                                                                                                                                             |
| ------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP_ID              | 您的应用程序       | 用于服务发现的应用程序 Id                                                                                                                                                                                                 |
| APP_PORT            | 您的应用程序       | 应用程序正在侦听的端口                                                                                                                                                                                                    |
| APP_API_TOKEN     | 您的应用程序       | 应用程序用于认证来自 Dapr 的请求的令牌. 阅读 [ 使用令牌认证对来自 Dapr 的请求进行认证]({{< ref app-api-token >}}) 以获取更多信息.                                                                                                                       |
| DAPR_HTTP_PORT    | 您的应用程序       | Dapr sidecar 正在侦听的 HTTP 端口. 应用程序应使用此变量连接到 Dapr sidecar，而不是对端口值进行硬编码。 由 Dapr CLI run 命令设置为自承载或由 dapr-sidecar-injector 注入到 pod 中的所有容器中。                                                                          |
| DAPR_GRPC_PORT    | 您的应用程序       | Dapr sidecar 正在侦听的 gRPC 端口. 应用程序应使用此变量连接到 Dapr sidecar，而不是对端口值进行硬编码。 由 Dapr CLI run 命令设置为自承载或由 dapr-sidecar-injector 注入到 pod 中的所有容器中。                                                                          |
| DAPR_METRICS_PORT | 您的应用程序       | HTTP [Prometheus]({{< ref prometheus >}}) Dapr 将其 metrics 信息发送到的端口。 您的应用程序可以使用此变量发送其特定于应用程序的 metrics，以便将 Dapr metrics 和应用程序 metrics 放在一起。 有关详细信息，请参阅 [metrics-port]({{< ref arguments-annotations-overview>}}) |
| DAPR_API_TOKEN    | Dapr sidecar | 用于来自应用程序的请求的 Dapr API 认证的令牌. 用于来自应用程序的请求的 Dapr API 认证的令牌. 阅读[在 Dapr中启用 API 令牌认证]({{< ref api-token >}}) 以获取更多信息. 阅读[在 Dapr中启用 API 令牌认证]({{< ref api-token >}}) 以获取更多信息.                                        |
| NAMESPACE           | Dapr sidecar | 用于指定组件的 [自托管模式下的命名空间]({{< ref component-scopes >}})                                                                                                                                                            |
