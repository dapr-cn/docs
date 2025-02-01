---
type: docs
title: "使用指南：选择性启用 Dapr Sidecar 的 API"
linkTitle: "Dapr API 白名单"
weight: 4500
description: "选择应用程序可以使用的 Dapr Sidecar API"
---

在零信任网络环境中，或通过前端将 Dapr Sidecar 暴露给外部流量时，建议仅启用应用程序实际使用的 Dapr Sidecar API。这样可以减少潜在的攻击风险，并确保 Dapr API 仅限于应用程序的实际需求。

Dapr 允许您通过使用 [Dapr 配置]({{< ref "configuration-schema.md" >}}) 设置 API 白名单或黑名单来控制应用程序可以访问哪些 API。

### 默认设置

如果未指定 API 白名单或黑名单，默认情况下将允许访问所有 Dapr API。

- 如果只定义了黑名单，则除黑名单中定义的 API 外，所有 Dapr API 都被允许访问。
- 如果只定义了白名单，则仅允许白名单中列出的 Dapr API。
- 如果同时定义了白名单和黑名单，则黑名单中的 API 优先于白名单。
- 如果两者都未定义，则允许访问所有 API。

例如，以下配置为 HTTP 和 gRPC 启用所有 API：

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

### 使用白名单

#### 启用特定的 HTTP API

以下示例启用 state `v1.0` HTTP API，并禁用所有其他 HTTP API：

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

#### 启用特定的 gRPC API

以下示例启用 state `v1` gRPC API，并禁用所有其他 gRPC API：

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

### 使用黑名单

#### 禁用特定的 HTTP API

以下示例禁用 state `v1.0` HTTP API，允许所有其他 HTTP API：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  api:
    denied:
      - name: state
        version: v1.0
        protocol: http
```

#### 禁用特定的 gRPC API

以下示例禁用 state `v1` gRPC API，允许所有其他 gRPC API：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  api:
    denied:
      - name: state
        version: v1
        protocol: grpc
```

### Dapr API 列表

`name` 字段用于指定您想启用的 Dapr API 名称。

请参考以下列表获取不同 Dapr API 的名称：

| API 组 | HTTP API | [gRPC API](https://github.com/dapr/dapr/tree/master/pkg/api/grpc) |
| ----- | ----- | ----- |
| [服务调用]({{< ref service_invocation_api.md >}}) | `invoke` (`v1.0`) | `invoke` (`v1`) |
| [状态]({{< ref state_api.md>}})| `state` (`v1.0` 和 `v1.0-alpha1`) | `state` (`v1` 和 `v1alpha1`) |
| [发布/订阅]({{< ref pubsub.md >}}) | `publish` (`v1.0` 和 `v1.0-alpha1`) | `publish` (`v1` 和 `v1alpha1`) |
| [输出绑定]({{< ref bindings_api.md >}})  | `bindings` (`v1.0`) |`bindings` (`v1`) |
| 订阅 | n/a | `subscribe` (`v1alpha1`) |
| [秘密]({{< ref secrets_api.md >}})| `secrets` (`v1.0`) | `secrets` (`v1`) |
| [actor]({{< ref actors_api.md >}}) | `actors`  (`v1.0`) |`actors` (`v1`) |
| [元数据]({{< ref metadata_api.md >}}) | `metadata` (`v1.0`) |`metadata` (`v1`) |
| [配置]({{< ref configuration_api.md >}}) | `configuration` (`v1.0` 和 `v1.0-alpha1`) | `configuration` (`v1` 和 `v1alpha1`) |
| [分布式锁]({{< ref distributed_lock_api.md >}}) | `lock` (`v1.0-alpha1`)<br/>`unlock` (`v1.0-alpha1`) | `lock` (`v1alpha1`)<br/>`unlock` (`v1alpha1`) |
| [加密]({{< ref cryptography_api.md >}}) | `crypto` (`v1.0-alpha1`) | `crypto` (`v1alpha1`) |
| [工作流]({{< ref workflow_api.md >}}) | `workflows` (`v1.0`) |`workflows` (`v1`) |
| [健康检查]({{< ref health_api.md >}}) | `healthz`  (`v1.0`) | n/a |
| 关闭 | `shutdown` (`v1.0`) | `shutdown` (`v1`) |

## 后续步骤

{{< button text="配置 Dapr 使用 gRPC" page="grpc" >}}
