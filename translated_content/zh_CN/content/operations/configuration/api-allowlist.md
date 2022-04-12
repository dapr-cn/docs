---
type: docs
title: "操作方法：有选择地在 Dapr 边车上启用 Dapr API"
linkTitle: "Dapr API 允许列表"
weight: 4500
description: "选择哪些 Dapr sidecar API 可用于应用"
---

在某些情况下，如零信任网络或当通过前端将 Dapr sidecar 暴露在外部流量中时，建议仅启用应用正在使用的 Dapr sidecar API。 这样做可减少攻击面，并有助于将 Dapr API 范围控制在应用程序的实际需求范围内。

Dapr 允许开发人员使用 [Dapr 配置]({{<ref "configuration-overview.md">}})设置 API 允许列表来控制应用程序可访问的 API。

### 默认行为

如果未指定 API 允许列表部分，则默认行为是允许访问所有 Dapr API。 设置允许列表后，只能访问指定的 API。

例如，以下配置支持 HTTP 和 gRPC 的所有 API：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
```

### 启用特定的 HTTP API

以下示例使状态 `v1.0` HTTP API 并阻止所有其他：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  api:
    allowed:
    - name: state
      version: v1.0
      protocol: http
```

### 启用特定的gRPC API

以下示例使状态 `v1` gRPC API 并阻止所有其他：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  api:
    allowed:
    - name: state
      version: v1
      protocol: grpc
```

### Dapr API 列表

`name` 字段是您想要启用的 Dapr API 的名称。

参阅此与不同 Dapr API 相对应的值列表：

| Name     | Dapr API                                      |
| -------- | --------------------------------------------- |
| state    | [State]({{< ref state_api.md>}})              |
| invoke   | [服务调用]({{< ref service_invocation_api.md >}}) |
| secrets  | [密钥]({{< ref secrets_api.md >}})              |
| bindings | [输出绑定]({{< ref bindings_api.md >}})           |
| publish  | [Pub/Sub]({{< ref pubsub.md >}})              |
| actors   | [Actors]({{< ref actors_api.md >}})           |
| metadata | [Metadata]({{< ref metadata_api.md >}})       |
