---
type: docs
title: "环境变量引用"
linkTitle: "环境变量"
description: "Dapr 使用的环境变量列表"
weight: 300
---

下表列出了 Dapr 运行时， CLI 或应用程序中使用的环境变量:

| 环境变量                | 使用方          | 说明                                                                                                                                                                                                                                                                                                                            |
| ------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP_ID              | 您的应用程序       | 用于服务发现的应用程序 Id                                                                                                                                                                                                                                                                                                                |
| APP_PORT            | 您的应用程序       | 应用程序正在侦听的端口                                                                                                                                                                                                                                                                                                                   |
| APP_API_TOKEN     | 您的应用程序       | The token used by the application to authenticate requests from Dapr API. Read [authenticate requests from Dapr using token authentication]({{< ref app-api-token >}}) for more information.                                                                                                                                  |
| DAPR_HTTP_PORT    | 您的应用程序       | The HTTP port that the Dapr sidecar is listening on. Your application should use this variable to connect to Dapr sidecar instead of hardcoding the port value. Set by the Dapr CLI run command for self hosted or injected by the dapr-sidecar-injector into all the containers in the pod.                                  |
| DAPR_GRPC_PORT    | 您的应用程序       | The gRPC port that the Dapr sidecar is listening on. Your application should use this variable to connect to Dapr sidecar instead of hardcoding the port value. Set by the Dapr CLI run command for self hosted or injected by the dapr-sidecar-injector into all the containers in the pod.                                  |
| DAPR_METRICS_PORT | 您的应用程序       | The HTTP [Prometheus]({{< ref prometheus >}}) port that Dapr sends its metrics information to. Your application can use this variable to send its application specific metrics to have both Dapr metrics and application metrics together. See [metrics-port]({{< ref arguments-annotations-overview>}}) for more information |
| DAPR_API_TOKEN    | Dapr sidecar | 用于来自应用程序的请求的 Dapr API 认证的令牌. 用于来自应用程序的请求的 Dapr API 认证的令牌. 阅读[在 Dapr中启用 API 令牌认证]({{< ref api-token >}}) 以获取更多信息. Read [enable API token authentication in Dapr]({{< ref api-token >}}) for more information.                                                                                                                  |
| NAMESPACE           | Dapr sidecar | Used to specify a component's [namespace in self-hosted mode]({{< ref component-scopes >}})                                                                                                                                                                                                                                   |
