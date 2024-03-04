---
type: docs
title: "HashiCorp Consul 名称解析规范"
linkTitle: "HashiCorp Consul"
description: 详细介绍了关于 HashiCorp Consul 服务发现组件的信息
---

## Configuration format

Hashicorp Consul is setup within the [Dapr Configuration]({{< ref configuration-overview.md >}}).

在配置中，添加一个 `nameResolution` spec ，并将 `component` 字段设置为 `"consul`。

如果您正在使用 Dapr sidecar 注册您的服务到 Consul ，那么您将需要以下配置：

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

如果 Consul 服务注册由 Dapr 外部管理，则需要确保将 Dapr-to-Dapr 内部 gRPC 端口添加到 `DAPR_PORT` 下的服务元数据中（此项是可配置的），并且 Consul 服务 ID 与 Dapr 应用 ID 匹配。 然后，您可以从上面的配置中省略 `selfRegister` 。

## 行为

Consul组件在初始化时，认证与配置的（或者默认的）代理链接或者注册这个服务，如果配置去这样做。 名称解析接口不能满足“ shutdown”模式，因此在使用 Dapr 向 Consul 注册服务时需要考虑这一点，因为它不会取消注册服务。

该组件通过过滤健康的服务来解决目标应用程序，并在元数据中寻找`DAPR_PORT`，以检索Dapr sidecar端口（该项是可配置的）。 Consul `service.meta` 在 `service.port` 上使用，以便不去干扰现有的 Consul 服务。


## Spec 配置字段

配置规格已固定为Consul api的v1.3.0版本

| Field                | Required |                                                                                                                数据类型 | 详情                                                                                                                                                                                                                              | 示例                                          |
| -------------------- |:--------:| -------------------------------------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Client               |    否     |                                     [*api.Config](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#Config) | Configures client connection to the Consul agent. If blank it will use the sdk defaults, which in this case is just an address of `127.0.0.1:8500`                                                                              | `10.0.4.4:8500`                             |
| QueryOptions         |    否     |                         [*api.QueryOptions](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#QueryOptions) | 配置用于解决健康服务的查询，如果为空白，它将默认为 `UseCache:true`                                                                                                                                                                                       | `UseCache: false`, `Datacenter: "myDC"`     |
| Checks               |    否     |             [[]*api.AgentServiceCheck](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#AgentServiceCheck) | 当进行注册服务时，配置健康检查。 如果为空白，它将默认到 Dapr sidecar 健康端点                                                                                                                                                                                  | 查看 [示例配置](#sample-configurations)           |
| Tags                 |    否     |                                                                                                          `[]string` | 在注册服务服务时包含的额外标签                                                                                                                                                                                                                 | `- "dapr"`                                  |
| Meta                 |    否     |                                                                                                 `map[string]string` | 在注册服务服务时包含的额外 metadata                                                                                                                                                                                                          | `DAPR_METRICS_PORT: "${DAPR_METRICS_PORT}"` |
| DaprPortMetaKey      |    否     |                                                                                                            `string` | 用于在服务解析过程中从Consul服务元数据中获取Dapr sidecar 端口的 key，它也将用于在注册时在元数据中设置Dapr sidecar 端口。 如果留空，它将默认为 `DAPR_PORT`                                                                                                                           | `"DAPR_TO_DAPR_PORT"`                       |
| SelfRegister         |    否     |                                                                                                              `bool` | 控制 Dapr 是否会向 Consul 注册服务。 The name resolution interface does not cater for an "on shutdown" pattern so please consider this if using Dapr to register services to Consul as it will not deregister services. 如果留空，它将默认为 `false` | `true`                                      |
| AdvancedRegistration |    否     | [*api.AgentServiceRegistration](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#AgentServiceRegistration) | 通过配置完全控制服务注册结果。 如果配置此项，组件将忽略Checks、 Tags、 Meta 和 SelfRegister的任何配置。                                                                                                                                                             | 查看 [示例配置](#sample-configurations)           |

## 示例配置

### Basic

所需的最小配置如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "consul"
```

### 注册时进行小部分定制

启用 `SelfRegister` 然后可以自定义 checks, tags 和 meta

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

配置高级注册后，您可以完全控制注册时可能的所有Consul 属性设置。

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

## 搭建 Hashicorp Consul
{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
HashiCorp提供了关于如何为不同主机模型搭建 Consul 的深度指南。 请查看此处的 [自托管指南](https://learn.hashicorp.com/collections/consul/getting-started)
{{% /codetab %}}

{{% codetab %}}
HashiCorp提供了关于如何为不同主机模型搭建 Consul 的深度指南。 Check out the [Kubernetes guide here](https://learn.hashicorp.com/collections/consul/kubernetes)
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [服务调用构建块]({{< ref service-invocation >}})
