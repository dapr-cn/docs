---
type: docs
title: "Dapr 配置选项概述"
linkTitle: "概述"
weight: 100
description: "关于 Dapr 配置以及如何设置应用程序选项的信息"
---

## Sidecar 配置

### 设置 Sidecar 选项配置

#### 自托管模式的 Sidecar
在自托管模式下，Dapr 配置通过配置文件进行定义，如 `config.yaml`。 默认情况下，Dapr sidecar 会在默认的 Dapr 目录下寻找运行时配置，在 Linux / MacOS操作系统下，位置为 `$HOME/.dapr/config.yaml` ， Windows操作系统下则为 `%USERPROFILE%\.dapr\config.yaml`

也可以在运行 `dapr run` CLI 命令时，通过使用 `--config` 标志来制定 Dapr sidecar 所读取的配置文件所在的位置。

#### Kubernetes 模式的 Sidecar
在 Kubernetes 模式下，Dapr 可以通过集群中的一个配置 CRD 进行配置。 例如：

```bash
kubectl apply -f myappconfig.yaml
```

您也可以使用 Dapr CLI 工具列举查看当前的配置 CRD 列表：

```bash
dapr configurations -k
```

也可以使用 `dapr.io/config` 注解对指定的 Dapr sidecar 应用特定的配置。 例如:

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "myappconfig"
```
Note: There are more [Kubernetes annotations]({{< ref "arguments-annotations-overview.md" >}}) available to configure the Dapr sidecar on activation by sidecar Injector system service.

### Sidecar 配置

Dapr 应用 sidecar 提供以下配置选项；
- [追踪](#tracing)
- [度量](#metrics)
- [中间件](#middleware)
- [限定范围的密钥储存](#scoping-secrets-for-secret-stores)
- [服务间调用的访问控制](#access-control-allow-lists-for-service-invocation)
- [Sidecar 配置示例](#example-application-sidecar-configuration)

#### 追踪

链路追踪配置用于为应用程序开启调用链追踪功能。

`Configuration` sepc下的 `tracing` 部分包含以下属性：

```yml
tracing:
  samplingRate: "1"
  zipkin:
    endpointAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
```

下面的表格给出了调用链追踪功能可配置的属性

| 属性                       | 数据类型   | 说明                    |
| ------------------------ | ------ | --------------------- |
| `samplingRate`           | string | 设置采样率，可以用来控制追踪功能是否开启。 |
| `zipkin.endpointAddress` | string | 设置 Zipkin 服务器地址。      |


`samplingRate` 用来控制调用链追踪是否启用。 要禁用采样率 , 可以在配置文件中设置 `samplingRate : "0"` 。 SamplingRate 的有效值在0到1之间。 系统将根据采样率配置的数值决定一条 trace span 是否要被采样。 如果设置 `samplingRate : "1"` ，将会对所有的调用链进行采样。 默认情况下，采样率配置为 (0.0001)，即每10,000条请求中会有一条被采样。

See [Observability distributed tracing]({{< ref "tracing-overview.md" >}}) for more information

#### 度量

配置中的 metrics 部分用来为应用开启或禁用度量功能。

`Configuration` sepc下的 `metrics` 部分包含以下属性：

```yml
metrics:
  enabled: true
```

下面的表格给出了度量功能可配置的属性

| 属性        | 数据类型    | 说明        |
| --------- | ------- | --------- |
| `enabled` | boolean | 是否启用度量功能。 |

See [metrics documentation]({{< ref "metrics-overview.md" >}}) for more information

#### 中间件

中间件配置用于配置一系列可命名的HTTP管道处理器。`Configuration` spec 下的`httpPipeline` 部分包含以下的配置属性：

```yml
httpPipeline:
  handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
```

下面的表格给出了HTTP 处理器可配置的属性

| 属性   | 数据类型   | 说明        |
| ---- | ------ | --------- |
| name | string | 中间件组件的名称。 |
| type | string | 中间件组件的类型。 |

See [Middleware pipelines]({{< ref "middleware.md" >}}) for more information

#### 限定作用域的密钥储存控制
See the [Scoping secrets]({{< ref "secret-scope.md" >}}) guide for information and examples on how to scope secrets to an application.

#### Access Control allow lists for building block APIs
See the [selectively enable Dapr APIs on the Dapr sidecar]({{< ref "api-allowlist.md" >}}) guide for information and examples on how to set ACLs on the building block APIs lists.

#### Access Control allow lists for service invocation API
See the [Allow lists for service invocation]({{< ref "invoke-allowlist.md" >}}) guide for information and examples on how to set allow lists with ACLs which using service invocation API.

#### Turning on preview features
See the [preview features]({{< ref "preview-features.md" >}}) guide for information and examples on how to opt-in to preview features for a release. Preview feature enable new capabilities to be added that still need more time until they become generally available (GA) in the runtime.

### Sidecar 配置示例
下面的yaml内容展示了一个可以被应用于Dapr sidecar的配置文件：

```yml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
  httpPipeline:
    handlers:
      - name: oauth2
        type: middleware.http.oauth2
  secrets:
    scopes:
      - storeName: localstore
        defaultAccess: allow
        deniedSecrets: ["redis-password"]
  accessControl:
    defaultAction: deny
    trustDomain: "public"
    policies:
    - appId: app1
      defaultAction: deny
      trustDomain: 'public'
      namespace: "default"
      operations:
      - name: /op1
        httpVerb: ['POST', 'GET']
        action: deny
      - name: /op2/*
        httpVerb: ["*"]
        action: allow
```

## 控制平面配置
在 Dapr 控制平面系统中，安装了一个名为`default` 的配置文件，用于应用全局配置。 这个配置仅在Dapr部署到Kubernetes中时生效。

### 控制平面配置列表
在 Dapr 控制平面中，可以使用以下配置项：

| 属性               | 数据类型   | 说明                                 |
| ---------------- | ------ | ---------------------------------- |
| enabled          | bool   | 配置mtls是否开启                         |
| allowedClockSkew | string | 证书到期时，基于本地时钟偏差给出的额外过期时间。 默认值为15分钟。 |
| workloadCertTTL  | string | 证书有效时间。 默认值为 24 小时。                |

See the [Mutual TLS]({{< ref "mtls.md" >}}) HowTo and [security concepts]({{< ref "security-concept.md" >}}) for more information.

### 控制平面配置示例

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: default
  namespace: default
spec:
  mtls:
    enabled: true
    allowedClockSkew: 15m
    workloadCertTTL: 24h
```
