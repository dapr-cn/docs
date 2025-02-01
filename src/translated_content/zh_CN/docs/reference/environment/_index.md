---
type: docs
title: "环境变量参考"
linkTitle: "环境变量"
description: "Dapr 所使用的环境变量列表"
weight: 300
---

下表列出了 Dapr 运行时、CLI 或您的应用程序中使用的环境变量：

| 环境变量 | 使用者          | 描述                                                                                                                                                                                                                                                                                                                    |
| -------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| APP_ID               | 您的应用程序 | 您的应用程序的 ID，用于服务发现  |
| APP_PORT             | Dapr sidecar | 您的应用程序监听的端口  |
| APP_API_TOKEN        | 您的应用程序 | 应用程序用于验证来自 Dapr API 请求的令牌。阅读 [使用令牌认证从 Dapr 验证请求]({{< ref app-api-token >}}) 以获取更多信息。 |
| DAPR_HTTP_PORT       | 您的应用程序 | Dapr sidecar 监听的 HTTP 端口。您的应用程序应使用此变量连接到 Dapr sidecar，而不是硬编码端口值。此变量由 Dapr CLI 在 selfhost 模式下运行命令时设置，或由 `dapr-sidecar-injector` 注入到 pod 中的所有容器中。                                   |
| DAPR_GRPC_PORT       | 您的应用程序 | Dapr sidecar 监听的 gRPC 端口。您的应用程序应使用此变量连接到 Dapr sidecar，而不是硬编码端口值。此变量由 Dapr CLI 在 selfhost 模式下运行命令时设置，或由 `dapr-sidecar-injector` 注入到 pod 中的所有容器中。                                   |
| DAPR_API_TOKEN  | Dapr sidecar     | 用于 Dapr API 认证应用程序请求的令牌。[在 Dapr 中启用 API 令牌认证]({{< ref api-token >}})。 |
| NAMESPACE | Dapr sidecar | 用于指定组件的 [selfhost 模式下的命名空间]({{< ref component-scopes >}})。 |
| DAPR_DEFAULT_IMAGE_REGISTRY | Dapr CLI | 在 selfhost 模式下，用于指定默认的容器注册表以拉取镜像。当其值设置为 `GHCR` 或 `ghcr` 时，将从 Github 容器注册表中拉取所需镜像。要默认使用 Docker hub，请取消设置此环境变量。 |
| SSL_CERT_DIR | Dapr sidecar | 指定所有受信任证书颁发机构 (CA) 的公共证书所在的位置。当 sidecar 作为进程在 selfhost 模式下运行时不适用。|
| DAPR_HELM_REPO_URL | 您的私有 Dapr Helm chart URL  | 指定一个私有 Dapr Helm chart URL，默认为官方 Helm chart URL: `https://dapr.github.io/helm-charts`|
| DAPR_HELM_REPO_USERNAME | 私有 Helm chart 的用户名 | 访问私有 Dapr Helm chart 所需的用户名。如果可以公开访问，则无需设置此环境变量|
| DAPR_HELM_REPO_PASSWORD | 私有 Helm chart 的密码  |访问私有 Dapr helm chart 所需的密码。如果可以公开访问，则无需设置此环境变量| 
| OTEL_EXPORTER_OTLP_ENDPOINT | OpenTelemetry Tracing | 设置 Open Telemetry (OTEL) 服务器地址，开启追踪。（示例：`http://localhost:4318`） |
| OTEL_EXPORTER_OTLP_INSECURE | OpenTelemetry Tracing | 设置连接到端点为不加密。（`true`，`false`） |
| OTEL_EXPORTER_OTLP_PROTOCOL | OpenTelemetry Tracing | 使用的 OTLP 协议传输协议。（`grpc`，`http/protobuf`，`http/json`） |
| DAPR_COMPONENTS_SOCKETS_FOLDER | Dapr 运行时和 .NET、Go、Java 可插拔组件 SDK | Dapr 查找可插拔组件 Unix 域套接字文件的位置或路径。如果未设置，此位置默认为 `/tmp/dapr-components-sockets` |
| DAPR_COMPONENTS_SOCKETS_EXTENSION | .NET 和 Java 可插拔组件 SDK | 每个 SDK 的配置，指示 SDK 创建的套接字文件使用的默认文件扩展名。此行为不是由 Dapr 强制执行的。 |
| DAPR_PLACEMENT_METADATA_ENABLED | Dapr placement | 启用一个端点，用于 placement 服务，公开 actor 使用的 placement 表信息。在 selfhost 模式下设置为 `true` 以启用。[了解有关 Placement API 的更多信息]({{< ref placement_api.md >}}) |
| DAPR_HOST_IP | Dapr sidecar | 主机选择的 IP 地址。如果未指定，将遍历网络接口并选择找到的第一个非回环地址。|
| DAPR_HEALTH_TIMEOUT | SDKs | 设置“等待 sidecar”可用性的时间。覆盖默认的 60 秒超时设置。 |
