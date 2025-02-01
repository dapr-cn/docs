---
type: docs
title: "Dapr API 日志"
linkTitle: "API 日志"
weight: 3000
description: "了解 Dapr 中的 API 日志记录工作原理以及如何查看日志"
---

API 日志记录可以让您查看应用程序对 Dapr sidecar 的 API 调用情况。这对于监控应用程序行为或进行调试非常有用。您还可以将 Dapr API 日志记录与 Dapr 日志事件结合使用（参见[配置和查看 Dapr 日志]({{< ref "logs-troubleshooting.md" >}})），以便更好地利用日志记录功能。

## 概述

API 日志记录默认情况下是禁用的。

要启用 API 日志记录，可以在启动 `daprd` 进程时使用 `--enable-api-logging` 命令行选项。例如：

```bash
./daprd --enable-api-logging
```

## 在自托管模式下配置 API 日志记录

当使用 Dapr CLI 运行应用程序时，要启用 API 日志记录，请传递 `--enable-api-logging` 标志：

```bash
dapr run \
  --enable-api-logging \
  -- node myapp.js
```

### 在自托管模式下查看 API 日志

使用 Dapr CLI 运行 Dapr 时，您的应用程序日志输出和 Dapr 运行时日志输出会被重定向到同一会话中，便于调试。

下面的示例显示了一些 API 日志：

```bash
$ dapr run --enable-api-logging -- node myapp.js

ℹ️  Starting Dapr with id order-processor on port 56730
✅  You are up and running! Both Dapr and your app logs will appear here.
.....
INFO[0000] HTTP API Called app_id=order-processor instance=mypc method="POST /v1.0/state/mystate" scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
== APP == INFO:root:Saving Order: {'orderId': '483'}
INFO[0000] HTTP API Called app_id=order-processor instance=mypc method="GET /v1.0/state/mystate/key123" scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
== APP == INFO:root:Getting Order: {'orderId': '483'}
INFO[0000] HTTP API Called app_id=order-processor instance=mypc method="DELETE /v1.0/state/mystate" scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
== APP == INFO:root:Deleted Order: {'orderId': '483'}
INFO[0000] HTTP API Called app_id=order-processor instance=mypc method="PUT /v1.0/metadata/cliPID" scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
```

## 在 Kubernetes 中配置 API 日志记录

您可以通过在 pod 规范模板中添加以下注释来为 sidecar 启用 API 日志：

```yaml
annotations:
  dapr.io/enable-api-logging: "true"
```

### 在 Kubernetes 上查看 API 日志

Dapr API 日志会被写入标准输出（stdout）和标准错误（stderr），您可以在 Kubernetes 上查看这些日志。

通过执行以下命令查看 Kubernetes API 日志。

```bash
kubectl logs <pod_name> daprd -n <name_space>
```

下面的示例显示了在 Kubernetes 中的 `info` 级别 API 日志记录（启用了[URL 混淆](#obfuscate-urls-in-http-api-logging)）。

```bash
time="2022-03-16T18:32:02.487041454Z" level=info msg="HTTP API Called" method="POST /v1.0/invoke/{id}/method/{method:*}" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
time="2022-03-16T18:32:02.698387866Z" level=info msg="HTTP API Called" method="POST /v1.0/invoke/{id}/method/{method:*}" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
time="2022-03-16T18:32:02.917629403Z" level=info msg="HTTP API Called" method="POST /v1.0/invoke/{id}/method/{method:*}" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
time="2022-03-16T18:32:03.137830112Z" level=info msg="HTTP API Called" method="POST /v1.0/invoke/{id}/method/{method:*}" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
time="2022-03-16T18:32:03.359097916Z" level=info msg="HTTP API Called" method="POST /v1.0/invoke/{id}/method/{method:*}" app_id=invoke-caller instance=invokecaller-f4f949886-cbnmt scope=dapr.runtime.http-info type=log useragent=Go-http-client/1.1 ver=edge
```

## API 日志记录配置

使用 [Dapr 配置规范]({{< ref "configuration-overview.md" >}}#sidecar-configuration)，您可以配置 Dapr 运行时中 API 日志记录的默认行为。

### 默认启用 API 日志记录

使用 Dapr 配置规范，您可以为 `--enable-api-logging` 标志（以及在 Kubernetes 上运行时的相应注释）设置默认值，使用 `logging.apiLogging.enabled` 选项。此值适用于引用定义该配置文档或资源的所有 Dapr 运行时。

- 如果 `logging.apiLogging.enabled` 设置为 `false`，即默认值，则 Dapr 运行时的 API 日志记录是禁用的，除非 `--enable-api-logging` 设置为 `true`（或添加 `dapr.io/enable-api-logging: true` 注释）。
- 当 `logging.apiLogging.enabled` 为 `true` 时，Dapr 运行时默认启用 API 日志记录，可以通过设置 `--enable-api-logging=false` 或使用 `dapr.io/enable-api-logging: false` 注释来禁用。

例如：

```yaml
logging:
  apiLogging:
    enabled: true
```

### 在 HTTP API 日志记录中混淆 URL

默认情况下，HTTP 端点的 API 调用日志包括被调用的完整 URL（例如，`POST /v1.0/invoke/directory/method/user-123`），这可能包含个人可识别信息（PII）。

为了减少在启用 API 日志记录时意外包含 PII 的风险，Dapr 可以记录被调用的抽象路由（例如，`POST /v1.0/invoke/{id}/method/{method:*}`）。这有助于确保符合 GDPR 等隐私法规。

要在 Dapr 的 HTTP API 日志中启用 URL 混淆，请将 `logging.apiLogging.obfuscateURLs` 设置为 `true`。例如：

```yaml
logging:
  apiLogging:
    obfuscateURLs: true
```

Dapr gRPC API 发出的日志不受此配置选项的影响，因为它们仅包含被调用方法的名称而不包含参数。

### 从 API 日志记录中省略健康检查

当启用 API 日志记录时，所有对 Dapr API 服务器的调用都会被记录，包括对健康检查端点的调用（例如 `/v1.0/healthz`）。根据您的环境，这可能会每分钟生成多行日志，并可能产生不必要的噪音。

您可以使用 Dapr 配置规范配置 Dapr 在启用 API 日志记录时不记录对健康检查端点的调用，通过设置 `logging.apiLogging.omitHealthChecks: true`。默认值为 `false`，这意味着健康检查调用会记录在 API 日志中。

例如：

```yaml
logging:
  apiLogging:
    omitHealthChecks: true
```