---
type: docs
title: "Dapr 配置"
linkTitle: "概述"
weight: 100
description: "Dapr 配置概述"
---

Dapr 配置通过一系列设置和策略，允许您调整单个 Dapr 应用程序的行为，或控制平面系统服务的整体行为。

[欲了解更多信息，请阅读配置概念。]({{< ref configuration-concept.md >}})

## 应用程序配置

### 设置应用程序配置

您可以在自托管模式或 Kubernetes 模式下设置应用程序配置。

{{< tabs "Self-hosted" Kubernetes >}}

 <!-- 自托管 -->
{{% codetab %}}

在自托管模式下，Dapr 配置是一个[配置文件]({{< ref configuration-schema.md >}})，例如 `config.yaml`。默认情况下，Dapr sidecar 会在默认的 Dapr 文件夹中查找运行时配置：
- Linux/MacOs: `$HOME/.dapr/config.yaml`
- Windows: `%USERPROFILE%\.dapr\config.yaml`

您还可以在 `dapr run` CLI 命令中使用 `--config` 标志指定文件路径来应用配置。

{{% /codetab %}}

 <!-- Kubernetes -->
{{% codetab %}}

在 Kubernetes 模式下，Dapr 配置是一个应用于集群的配置资源。例如：

```bash
kubectl apply -f myappconfig.yaml
```

您可以使用 Dapr CLI 列出应用程序的配置资源。

```bash
dapr configurations -k
```

Dapr sidecar 可以通过 `dapr.io/config` 注解来应用特定配置。例如：

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "myappconfig"
```

> **注意：** [查看所有 Kubernetes 注解]({{< ref "arguments-annotations-overview.md" >}})，以便在 sidecar 注入器系统服务激活时配置 Dapr sidecar。

{{% /codetab %}}

{{< /tabs >}}

### 应用程序配置选项

以下是您可以在 sidecar 上设置的所有配置选项。

- [跟踪](#tracing)
- [指标](#metrics)
- [日志](#logging)
- [中间件](#middleware)
- [名称解析](#name-resolution)
- [限制 secret 存储访问](#scope-secret-store-access)
- [构建块 API 的访问控制白名单](#access-control-allow-lists-for-building-block-apis)
- [服务调用 API 的访问控制白名单](#access-control-allow-lists-for-service-invocation-api)
- [禁止使用某些组件类型](#disallow-usage-of-certain-component-types)
- [启用预览功能](#turning-on-preview-features)
- [示例 sidecar 配置](#example-sidecar-configuration)

#### 跟踪

跟踪配置用于启用应用程序的跟踪功能。

`Configuration` 规范下的 `tracing` 部分包含以下属性：

```yml
tracing:
  samplingRate: "1"
  otel: 
    endpointAddress: "otelcollector.observability.svc.cluster.local:4317"
  zipkin:
    endpointAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
```

下表列出了跟踪的属性：

| 属性     | 类型   | 描述 |
|--------------|--------|-------------|
| `samplingRate` | string | 设置跟踪的采样率以启用或禁用。
| `stdout` | bool | 为跟踪写入更详细的信息
| `otel.endpointAddress` | string | 设置 Open Telemetry (OTEL) 服务器地址以发送跟踪。这可能需要或不需要 https:// 或 http://，具体取决于您的 OTEL 提供商。
| `otel.isSecure` | bool | 连接到端点地址是否加密
| `otel.protocol` | string | 设置为 `http` 或 `grpc` 协议
| `zipkin.endpointAddress` | string | 设置 Zipkin 服务器地址以发送跟踪。这应该在端点上包含协议 (http:// 或 https://)。

##### `samplingRate`

`samplingRate` 用于启用或禁用跟踪。`samplingRate` 的有效范围是 `0` 到 `1`（含）。采样率决定了是否根据值对跟踪跨度进行采样。

`samplingRate : "1"` 采样所有跟踪。默认情况下，采样率为 (0.0001)，即 1 万分之一。

要禁用采样率，请在配置中设置 `samplingRate : "0"`。

##### `otel`

OpenTelemetry (`otel`) 端点也可以通过环境变量进行配置。`OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量的存在会为 sidecar 启用跟踪。

| 环境变量 | 描述 |
|----------------------|-------------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | 设置 Open Telemetry (OTEL) 服务器地址，启用跟踪 |
| `OTEL_EXPORTER_OTLP_INSECURE` | 将连接到端点设置为未加密（true/false） |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | 传输协议 (`grpc`, `http/protobuf`, `http/json`) |

有关更多信息，请参阅 [可观察性分布式跟踪]({{< ref "tracing-overview.md" >}})。

#### 指标

`Configuration` 规范下的 `metrics` 部分可用于启用或禁用应用程序的指标。

`metrics` 部分包含以下属性：

```yml
metrics:
  enabled: true
  rules: []
  latencyDistributionBuckets: []
  http:
    increasedCardinality: true
    pathMatching:
      - /items
      - /orders/{orderID}
      - /orders/{orderID}/items/{itemID}
      - /payments/{paymentID}
      - /payments/{paymentID}/status
      - /payments/{paymentID}/refund
      - /payments/{paymentID}/details
    excludeVerbs: false
  recordErrorCodes: true
```

在上面的示例中，路径过滤器 `/orders/{orderID}/items/{itemID}` 将返回 _单个指标计数_，匹配所有 `orderID` 和所有 `itemID`，而不是为每个 `itemID` 返回多个指标。有关更多信息，请参阅 [HTTP 指标路径匹配]({{< ref "metrics-overview.md#http-metrics-path-matching" >}})。

上面的示例还启用了 [记录错误代码指标]({{< ref "metrics-overview.md#configuring-metrics-for-error-codes" >}})，默认情况下是禁用的。

下表列出了指标的属性：

| 属性                     | 类型    | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`                    | boolean | 当设置为 true 时，默认情况下，启用指标收集和指标端点。                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `rules`                      | array   | 命名规则以过滤指标。每个规则包含一组 `labels` 以进行过滤和一个 `regex` 表达式以应用于指标路径。                                                                                                                                                                                                                                                                                                                                                                                                           |
| `latencyDistributionBuckets` | array   | 延迟指标直方图的延迟分布桶的毫秒数组。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `http.increasedCardinality`  | boolean | 当设置为 `true`（默认）时，在 Dapr HTTP 服务器中，每个请求路径都会导致创建一个新的“桶”指标。这可能会导致问题，包括在请求的端点很多时（例如与 RESTful API 交互时）出现过多的内存消耗。<br> 为了缓解与 HTTP 服务器相关的[高基数指标]({{< ref "metrics-overview.md#high-cardinality-metrics" >}})的高内存使用和出口成本，您应该将 `metrics.http.increasedCardinality` 属性设置为 `false`。 |
| `http.pathMatching`          | array   | 路径匹配的路径数组，允许用户定义匹配路径以管理基数。                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `http.excludeVerbs`          | boolean | 当设置为 true 时（默认值为 false），Dapr HTTP 服务器在构建方法指标标签时忽略每个请求的 HTTP 动词。                                                                                                                                                                                                                                                                                                                                                                                                                  |

为了进一步帮助管理基数，路径匹配允许您根据定义的模式匹配指定的路径，减少唯一指标路径的数量，从而控制指标基数。此功能对于具有动态 URL 的应用程序特别有用，确保指标保持有意义且可管理，而不会消耗过多的内存。

使用规则，您可以为 Dapr sidecar 暴露的每个指标设置正则表达式。例如：

```yml
metrics:
  enabled: true
  rules:
    - name: dapr_runtime_service_invocation_req_sent_total
      labels:
      - name: method
        regex:
          "orders/": "orders/.+"
```

有关更多信息，请参阅 [指标文档]({{< ref "metrics-overview.md" >}})。

#### 日志

`Configuration` 规范下的 `logging` 部分用于配置 Dapr 运行时中的日志记录方式。

`logging` 部分包含以下属性：

```yml
logging:
  apiLogging:
    enabled: false
    obfuscateURLs: false
    omitHealthChecks: false
```

下表列出了日志记录的属性：

| 属性     | 类型   | 描述 |
|--------------|--------|-------------|
| `apiLogging.enabled` | boolean | `daprd` 的 `--enable-api-logging` 标志的默认值（以及相应的 `dapr.io/enable-api-logging` 注解）：除非为每个 Dapr 运行时传递 `true` 或 `false` 值，否则使用配置规范中设置的值作为默认值。默认值：`false`。
| `apiLogging.obfuscateURLs` | boolean | 启用时，会在 HTTP API 日志（如果启用）中模糊化 URL 的值，记录抽象路由名称而不是被调用的完整路径，该路径可能包含个人可识别信息（PII）。默认值：`false`。
| `apiLogging.omitHealthChecks` | boolean | 如果为 `true`，则在启用 API 日志记录时，不会记录对健康检查端点（例如 `/v1.0/healthz`）的调用。这在这些调用在日志中添加了大量噪音时很有用。默认值：`false`

有关更多信息，请参阅 [日志记录文档]({{< ref "logs.md" >}})。

#### 中间件

中间件配置设置命名的 HTTP 管道中间件处理程序。`Configuration` 规范下的 `httpPipeline` 和 `appHttpPipeline` 部分包含以下属性：

```yml
httpPipeline: # 用于传入的 http 调用
  handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
appHttpPipeline: # 用于传出的 http 调用
  handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
```

下表列出了 HTTP 处理程序的属性：

| 属性 | 类型   | 描述 |
|----------|--------|-------------|
| `name`     | string | 中间件组件的名称
| `type`     | string | 中间件组件的类型

有关更多信息，请参阅 [中间件管道]({{< ref "middleware.md" >}})。

#### 名称解析组件

您可以在配置文件中设置要使用的名称解析组件。例如，要将 `spec.nameResolution.component` 属性设置为 `"sqlite"`，请在 `spec.nameResolution.configuration` 字典中传递配置选项，如下所示。

这是一个配置资源的基本示例：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration 
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "sqlite"
    version: "v1"
    configuration:
      connectionString: "/home/user/.dapr/nr.db"
```

有关更多信息，请参阅：
- [名称解析组件文档]({{< ref supported-name-resolution >}})以获取更多示例。
- [配置文件文档]({{< ref configuration-schema.md >}})以了解如何为每个组件配置名称解析。

#### 限制 secret 存储访问

有关如何将 secret 范围限定到应用程序的信息和示例，请参阅 [范围 secret]({{< ref "secret-scope.md" >}}) 指南。

#### 构建块 API 的访问控制白名单

有关如何在构建块 API 列表上设置访问控制白名单（ACL）的信息和示例，请参阅 [在 Dapr sidecar 上选择性启用 Dapr API]({{< ref "api-allowlist.md" >}}) 指南。

#### 服务调用 API 的访问控制白名单

有关如何使用 ACL 设置白名单的服务调用 API 的信息和示例，请参阅 [服务调用的白名单]({{< ref "invoke-allowlist.md" >}}) 指南。

#### 禁止使用某些组件类型

使用 `Configuration` 规范中的 `components.deny` 属性，您可以指定不能初始化的组件类型的拒绝列表。

例如，下面的配置禁止初始化类型为 `bindings.smtp` 和 `secretstores.local.file` 的组件：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
spec: 
  components:
    deny:
      - bindings.smtp
      - secretstores.local.file
```

可选地，您可以通过在组件名称末尾添加版本来指定要禁止的版本。例如，`state.in-memory/v1` 禁止初始化类型为 `state.in-memory` 且版本为 `v1` 的组件，但不禁止组件的（假设的）`v2` 版本。

{{% alert title="注意" color="primary" %}}
 当您将组件类型 `secretstores.kubernetes` 添加到拒绝列表时，Dapr 禁止创建 _额外的_ 类型为 `secretstores.kubernetes` 的组件。

 但是，它不会禁用内置的 Kubernetes secret 存储，该存储是：
 - 由 Dapr 自动创建
 - 用于存储组件规范中指定的 secret
 
 如果您想禁用内置的 Kubernetes secret 存储，您需要使用 `dapr.io/disable-builtin-k8s-secret-store` [注解]({{< ref arguments-annotations-overview.md >}})。
{{% /alert %}} 

#### 启用预览功能

有关如何选择加入发布版的预览功能的信息和示例，请参阅 [预览功能]({{< ref "preview-features.md" >}}) 指南。

启用预览功能可以解锁新的功能，以便进行开发/测试，因为它们仍然需要更多时间才能在运行时中普遍可用（GA）。

### 示例 sidecar 配置

以下 YAML 显示了一个可以应用于应用程序的 Dapr sidecar 的示例配置文件。

```yml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    stdout: true
    otel:
      endpointAddress: "localhost:4317"
      isSecure: false
      protocol: "grpc"
  httpPipeline:
    handlers:
      - name: oauth2
        type: middleware.http.oauth2
  secrets:
    scopes:
      - storeName: localstore
        defaultAccess: allow
        deniedSecrets: ["redis-password"]
  components:
    deny:
      - bindings.smtp
      - secretstores.local.file
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

一个名为 `daprsystem` 的单一配置文件与 Dapr 控制平面系统服务一起安装，应用全局设置。

> **仅在 Dapr 部署到 Kubernetes 时设置。**

### 控制平面配置设置

Dapr 控制平面配置包含以下部分：

- [`mtls`](#mtls-mutual-tls) 用于 mTLS（相互 TLS）

### mTLS（相互 TLS）

`mtls` 部分包含 mTLS 的属性。

| 属性         | 类型   | 描述 |
|------------------|--------|-------------|
| `enabled`          | bool   | 如果为 true，则启用集群中服务和应用程序之间通信的 mTLS。
| `allowedClockSkew` | string | 检查 TLS 证书到期时允许的容差，以允许时钟偏差。遵循 [Go 的 time.ParseDuration](https://pkg.go.dev/time#ParseDuration) 使用的格式。默认值为 `15m`（15 分钟）。
| `workloadCertTTL`  | string | Dapr 签发的证书 TLS 的有效期。遵循 [Go 的 time.ParseDuration](https://pkg.go.dev/time#ParseDuration) 使用的格式。默认值为 `24h`（24 小时）。
| `sentryAddress`  | string | 连接到 Sentry 服务器的主机名端口地址。 |
| `controlPlaneTrustDomain` | string | 控制平面的信任域。用于验证与控制平面服务的连接。 |
| `tokenValidators` | array | 用于验证证书请求的其他 Sentry 令牌验证器。 |

有关更多信息，请参阅 [mTLS 操作指南]({{< ref "mtls.md" >}}) 和 [安全概念]({{< ref "security-concept.md" >}})。

### 示例控制平面配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: true
    allowedClockSkew: 15m
    workloadCertTTL: 24h
```

## 下一步

{{< button text="了解并发和速率限制" page="control-concurrency" >}}
