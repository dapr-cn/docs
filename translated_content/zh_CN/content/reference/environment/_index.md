---
type: docs
title: "环境变量引用"
linkTitle: "环境变量"
description: "Dapr 使用的环境变量列表"
weight: 300
---

下表列出了 Dapr 运行时， CLI 或应用程序中使用的环境变量:

| 环境变量                  | 使用方      | 描述                                                                                                                                                                                                                                                    |
| --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DAPR_HTTP_PORT      | 您的应用程序   | The HTTP port that Dapr is listening on. Dapr 正在侦听的 gRPC 端口. 您的应用程序应使用此变量来连接至 Dapr, 而不是硬编码端口值. 由 `dapr-sidecar-injector` 注入pod中的所有容器. Injected by the `dapr-sidecar-injector` into all the containers in the pod.                                     |
| DAPR_GRPC_PORT      | 您的应用程序   | The gRPC port that Dapr is listening on. Your application should use this variable to connect to Dapr instead of hardcoding the port value. Injected by the `dapr-sidecar-injector` into all the containers in the pod.                               |
| DAPR_TOKEN_API      | 您的应用程序   | 用于来自应用程序的请求的 Dapr API 认证的令牌. 用于来自应用程序的请求的 Dapr API 认证的令牌. 阅读[在 Dapr中启用 API 令牌认证]({{< ref api-token >}}) 以获取更多信息. Read [enable API token authentication in Dapr]({{< ref api-token >}}) for more information.                                          |
| APP_TOKEN_API       | 您的应用程序   | The token used by the app to authenticate requests from Dapr. 应用程序用于认证来自 Dapr 的请求的令牌. 应用程序用于认证来自 Dapr 的请求的令牌. 阅读[ 使用令牌认证对来自 Dapr 的请求进行认证]({{< ref app-api-token >}}) 以获取更多信息.                                                                         |
| DAPR_PLACEMENT_HOST | 您的应用程序   | The address for the Dapr Placement service. Only needed in self-hosted mode if you run your app (which creates actors) and you want to tell the app the location of the Placement service. This is never needed outside of local machine development. |
| DAPR_NETWORK          | Dapr CLI | 可选的 Dapr CLI 用于指定 Docker 网络来部署Dapr 运行时。                                                                                                                                                                                                               |
| NAMESPACE             | Dapr 运行时 | 用于指定组件的 [自托管模式下的命名空间]({{< ref component-scopes >}})                                                                                                                                                                                                   |
