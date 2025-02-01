---
type: docs
title: "HashiCorp Consul"
linkTitle: "HashiCorp Consul"
description: HashiCorp Consul 名称解析组件的详细信息
---

## 配置格式

在 [Dapr 配置]({{< ref configuration-overview.md >}}) 中设置 HashiCorp Consul。

在配置中，添加 `nameResolution` 规范，并将 `component` 字段设为 `"consul"`。

如果您使用 Dapr sidecar 将服务注册到 Consul，需要以下配置：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "consul"
    configuration:
      selfRegister: true
```

如果 Consul 服务注册由 Dapr 外部管理，您需要确保 Dapr 到 Dapr 的内部 gRPC 端口已添加到服务元数据中的 `DAPR_PORT`（此键是可配置的），并且 Consul 服务 ID 与 Dapr 应用 ID 匹配。在这种情况下，可以省略上述配置中的 `selfRegister`。

## 行为

在 `init` 时，Consul 组件会验证与配置的（或默认的）代理的连接，或者在配置时注册服务。名称解析接口不支持“关闭时”模式，因此在使用 Dapr 将服务注册到 Consul 时请注意，它不会注销服务。

该组件通过过滤健康服务来解析目标应用，并在元数据中查找 `DAPR_PORT`（键是可配置的）以获取 Dapr sidecar 端口。Consul 使用 `service.meta` 而不是 `service.port`，以避免干扰现有的 Consul 配置。

## 规范配置字段

配置规范基于 Consul API 的 v1.3.0 版本

| 字段            | 必需 | 类型 | 详情  | 示例 |
|-----------------|:----:|-----:|:-----|-----|
| Client          | N    | [*api.Config](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#Config) | 配置客户端连接到 Consul 代理。如果为空，将使用 SDK 默认值，即地址 `127.0.0.1:8500` | `10.0.4.4:8500`
| QueryOptions    | N    | [*api.QueryOptions](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#QueryOptions) | 配置用于解析健康服务的查询，如果为空，将默认为 `UseCache:true` | `UseCache: false`, `Datacenter: "myDC"`
| Checks          | N    | [[]*api.AgentServiceCheck](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#AgentServiceCheck) | 配置健康检查（如果/当注册时）。如果为空，将默认为 Dapr sidecar 健康端点上的单个健康检查 | 参见 [示例配置](#sample-configurations)
| Tags            | N    | `[]string` | 配置注册服务时要包含的任何标签 | `- "dapr"`
| Meta            | N    | `map[string]string` | 配置注册服务时要包含的任何附加元数据 | `DAPR_METRICS_PORT: "${DAPR_METRICS_PORT}"`
| DaprPortMetaKey | N    | `string` | 用于从 Consul 服务元数据中获取 Dapr sidecar 端口的键，在服务解析期间，它也将用于在注册期间在元数据中设置 Dapr sidecar 端口。如果为空，将默认为 `DAPR_PORT` | `"DAPR_TO_DAPR_PORT"`
| SelfRegister    | N    | `bool` | 控制 Dapr 是否将服务注册到 Consul。名称解析接口不支持“关闭时”模式，因此如果使用 Dapr 将服务注册到 Consul，请注意它不会注销服务。如果为空，将默认为 `false` | `true`
| AdvancedRegistration | N | [*api.AgentServiceRegistration](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#AgentServiceRegistration) | 通过配置提供对服务注册的完全控制。如果配置了该组件，将忽略 Checks、Tags、Meta 和 SelfRegister 的任何配置。 | 参见 [示例配置](#sample-configurations)

## 示例配置

### 基本

所需的最低配置如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "consul"
```

### 带有额外自定义的注册

启用 `SelfRegister` 后，可以自定义检查、标签和元数据

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "consul"
    configuration:
      client:
        address: "127.0.0.1:8500"
      selfRegister: true
      checks:
        - name: "Dapr Health Status"
          checkID: "daprHealth:${APP_ID}"
          interval: "15s"
          http: "http://${HOST_ADDRESS}:${DAPR_HTTP_PORT}/v1.0/healthz"
        - name: "Service Health Status"
          checkID: "serviceHealth:${APP_ID}"
          interval: "15s"
          http: "http://${HOST_ADDRESS}:${APP_PORT}/health"
      tags:
        - "dapr"
        - "v1"
        - "${OTHER_ENV_VARIABLE}"
      meta:
        DAPR_METRICS_PORT: "${DAPR_METRICS_PORT}"
        DAPR_PROFILE_PORT: "${DAPR_PROFILE_PORT}"
      daprPortMetaKey: "DAPR_PORT"
      queryOptions:
        useCache: true
        filter: "Checks.ServiceTags contains dapr"
```

### 高级注册

配置高级注册可以让您在注册时完全控制设置所有可能的 Consul 属性。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "consul"
    configuration:
      client:
          address: "127.0.0.1:8500"
      selfRegister: false
      queryOptions:
        useCache: true
      daprPortMetaKey: "DAPR_PORT"
      advancedRegistration:
        name: "${APP_ID}"
        port: ${APP_PORT}
        address: "${HOST_ADDRESS}"
        check:
          name: "Dapr Health Status"
          checkID: "daprHealth:${APP_ID}"
          interval: "15s"
          http: "http://${HOST_ADDRESS}:${DAPR_HTTP_PORT}/v1.0/healthz"
        meta:
          DAPR_METRICS_PORT: "${DAPR_METRICS_PORT}"
          DAPR_PROFILE_PORT: "${DAPR_PROFILE_PORT}"
        tags:
          - "dapr"
```

## 设置 HashiCorp Consul
{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
HashiCorp 提供了关于如何为不同托管模型设置 Consul 的深入指南。查看 [自托管指南](https://learn.hashicorp.com/collections/consul/getting-started)
{{% /codetab %}}

{{% codetab %}}
HashiCorp 提供了关于如何为不同托管模型设置 Consul 的深入指南。查看 [Kubernetes 指南](https://learn.hashicorp.com/collections/consul/kubernetes)
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [服务调用构建块]({{< ref service-invocation >}})
