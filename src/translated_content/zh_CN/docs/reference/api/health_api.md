---
type: docs
title: "健康 API 参考"
linkTitle: "健康 API"
description: "关于健康 API 的详细文档"
weight: 1000
---

Dapr 提供健康检查功能，用于检查 Dapr 的就绪状态或存活状态，以及从 SDKs 检查初始化的就绪性。

## 获取 Dapr 健康状态

可以通过以下方式获取 Dapr 的健康状态：
- 检查 sidecar 的健康状况
- 检查 sidecar 的健康状况，包括组件的就绪性，适用于初始化期间。

### 等待 Dapr HTTP 端口可用

等待所有组件初始化完成，Dapr HTTP 端口可用，同时应用程序通道已初始化。例如，此端点用于 Kubernetes 的存活性探针。

#### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/healthz
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
204  | Dapr 是健康的
500  | Dapr 是不健康的

#### URL 参数

参数 | 描述
--------- | -----------
daprPort | Dapr 端口

#### 示例

```shell
curl -i http://localhost:3500/v1.0/healthz
```

### 等待 `/outbound` 路径的特定健康检查

等待所有组件初始化完成，Dapr HTTP 端口可用，但应用程序通道尚未建立。此端点允许您的应用程序在应用程序通道初始化之前调用 Dapr sidecar 的 API，例如使用 secret API 读取机密信息。在 Dapr SDKs 中，可以使用 `waitForSidecar` 方法（例如 .NET 和 Java SDKs）来检查 sidecar 是否已正确初始化，以便进行后续调用。

例如，[Java SDK]({{< ref "java-client.md#wait-for-sidecar" >}}) 和 [.NET SDK]({{< ref "dotnet-client.md#wait-for-sidecar" >}}) 使用此端点进行初始化。

目前，`v1.0/healthz/outbound` 端点在以下 SDK 中支持：
- [.NET SDK]({{< ref "dotnet-client.md#wait-for-sidecar" >}})
- [Java SDK]({{< ref "java-client.md#wait-for-sidecar" >}})
- [Python SDK]({{< ref "python-client.md#health-timeout" >}})
- [JavaScript SDK](https://github.com/dapr/js-sdk/blob/4189a3d2ad6897406abd766f4ccbf2300c8f8852/src/interfaces/Client/IClientHealth.ts#L14)

#### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/healthz/outbound
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
204  | Dapr 是健康的
500  | Dapr 是不健康的

#### URL 参数

参数 | 描述
--------- | -----------
daprPort | Dapr 端口

#### 示例

```shell
curl -i http://localhost:3500/v1.0/healthz/outbound
```

## 相关文章

- [Sidecar 健康]({{< ref "sidecar-health.md" >}})
- [应用程序健康]({{< ref "app-health.md" >}})
