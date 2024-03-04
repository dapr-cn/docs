---
type: docs
title: "操作方法：有选择地在 Dapr 边车上启用 Dapr API"
linkTitle: "Dapr API 允许列表"
weight: 4500
description: "选择哪些 Dapr sidecar API 可用于应用"
---

In certain scenarios, such as zero trust networks or when exposing the Dapr sidecar to external traffic through a frontend, it's recommended to only enable the Dapr sidecar APIs that are being used by the app. Doing so reduces the attack surface and helps keep the Dapr APIs scoped to the actual needs of the application.

Dapr allows developers to control which APIs are accessible to the application by setting an API allowlist or denylist using a [Dapr Configuration]({{<ref "configuration-overview.md">}}).

### Default behavior

If no API allowlist or denylist is specified, the default behavior is to allow access to all Dapr APIs.

- If only a denylist is defined, all Dapr APIs are allowed except those defined in the denylist
- If only an allowlist is defined, only the Dapr APIs listed in the allowlist are allowed
- If both an allowlist and a denylist are defined, the allowed APIs are those defined in the allowlist, unless they are also included in the denylist. In other words, the denylist overrides the allowlist for APIs that are defined in both.
- If neither is defined, all APIs are allowed.

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

### Using an allowlist

#### 启用特定的 HTTP API

The following example enables the state `v1.0` HTTP API and blocks all other HTTP APIs:

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

The following example enables the state `v1` gRPC API and blocks all other gRPC APIs:

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

### Using a denylist

#### Disabling specific HTTP APIs

The following example disables the state `v1.0` HTTP API, allowing all other HTTP APIs:

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

#### Disabling specific gRPC APIs

The following example disables the state `v1` gRPC API, allowing all other gRPC APIs:

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

`name` 字段是您想要启用的 Dapr API 的名称。

参阅此与不同 Dapr API 相对应的值列表：

| API group                                         | HTTP API                                                  | [gRPC API](https://github.com/dapr/dapr/blob/master/pkg/grpc/endpoints.go) |
| ------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| [服务调用]({{< ref service_invocation_api.md >}})     | `invoke` (`v1.0`)                                         | `invoke` (`v1`)                                                            |
| [State]({{< ref state_api.md>}})                  | `state` (`v1.0` and `v1.0-alpha1`)                        | `state` (`v1` and `v1alpha1`)                                              |
| [Pub/sub（发布/订阅）]({{< ref pubsub.md >}})           | `publish` (`v1.0` and `v1.0-alpha1`)                      | `publish` (`v1` and `v1alpha1`)                                            |
| [(Output) Bindings]({{< ref bindings_api.md >}})  | `bindings` (`v1.0`)                                       | `bindings` (`v1`)                                                          |
| [密钥]({{< ref secrets_api.md >}})                  | `secrets` (`v1.0`)                                        | `secrets` (`v1`)                                                           |
| [Actors]({{< ref actors_api.md >}})               | `actors`  (`v1.0`)                                        | `actors` (`v1`)                                                            |
| [元数据]({{< ref metadata_api.md >}})                | `metadata` (`v1.0`)                                       | `metadata` (`v1`)                                                          |
| [Configuration]({{< ref configuration_api.md >}}) | `configuration` (`v1.0` and `v1.0-alpha1`)                | `configuration` (`v1` and `v1alpha1`)                                      |
| [分布式锁]({{< ref distributed_lock_api.md >}})       | `lock` (`v1.0-alpha1`)<br/>`unlock` (`v1.0-alpha1`) | `lock` (`v1alpha1`)<br/>`unlock` (`v1alpha1`)                        |
| 密码学                                               | `crypto` (`v1.0-alpha1`)                                  | `crypto` (`v1alpha1`)                                                      |
| [Workflow]({{< ref workflow_api.md >}})           | `workflows` (`v1.0-alpha1`)                               | `workflows` (`v1alpha1`)                                                   |
| [Health]({{< ref health_api.md >}})               | `healthz`  (`v1.0`)                                       | n/a                                                                        |
| Shutdown                                          | `shutdown` (`v1.0`)                                       | `shutdown` (`v1`)                                                          |
