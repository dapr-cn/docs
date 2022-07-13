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
在 Kubernetes 模式下，Dapr 可以通过集群中的一个配置 CRD 进行配置。 例如:

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
注意：有更多的 [Kubernetes 注解]({{< ref "arguments-annotations-overview.md" >}})可用于在通过 sidecar Injector 系统服务激活时配置 Dapr sidecar。

### Sidecar 配置

以下配置设置可以应用于 Dapr 应用程序 sidecar：
- [追踪](#tracing)
- [度量](#metrics)
- [中间件](#middleware)
- [限定范围的秘密储存](#scoping-secrets-for-secret-stores)
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

下面的表格给出了调用链追踪功能可配置的属性：

| 属性                       | 数据类型   | 说明                    |
| ------------------------ | ------ | --------------------- |
| `samplingRate`           | string | 设置采样率，可以用来控制追踪功能是否开启。 |
| `zipkin.endpointAddress` | string | 设置 Zipkin 服务器地址。      |


`samplingRate` 用来控制调用链追踪是否启用。 要禁用采样率 , 可以在配置文件中设置 `samplingRate : "0"` 。 SamplingRate 的有效值在0到1之间。 系统将根据采样率配置的数值决定一条 trace span 是否要被采样。 如果设置 `samplingRate : "1"` ，将会对所有的调用链进行采样。 默认情况下，采样率配置为 (0.0001)，即每10,000条请求中会有一条被采样。

更多信息请参见 [可观察性分布式追踪]({{< ref " tracing-overview. md" >}}) 。

#### 度量

配置中的 metrics 部分用来为应用开启或禁用度量功能。

`Configuration` sepc下的 `metrics` 部分包含以下属性：

```yml
metrics:
  enabled: true
```

下面的表格给出了度量功能可配置的属性：

| 属性        | 数据类型    | 说明        |
| --------- | ------- | --------- |
| `enabled` | boolean | 是否启用度量功能。 |

有关详细信息，请参阅 [指标文档]({{< ref " metrics-overview. md" >}})

#### 中间件

中间件配置用于配置一系列可命名的 Http 管道处理器。`Configuration` spec 下的`httpPipeline` 部分包含以下的配置属性：

```yml
httpPipeline:
  handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
```

下面的表格给出了 HTTP 处理器可配置的属性：

| 属性   | 数据类型   | 说明        |
| ---- | ------ | --------- |
| name | string | 中间件组件的名称。 |
| type | string | 中间件组件的类型。 |

更多信息见 [中间件管道]({{< ref " middleware. md" >}}) 。

#### 限定作用域的秘密储存控制
请参阅 [秘密范围]({{< ref "secret-scope.md" >}}) 指南，了解如何将秘密范围化到一个应用程序的信息和例子。

#### 构建块 API 的访问控制允许列表
请参阅 [选择性地启用 Dapr sidecar 上的 Dapr APIs]({{< ref "api-allowlist.md" >}}) 指南，了解如何在构建块 API 列表上设置 ACL 的信息和例子。

#### 服务调用 API 的访问控制允许列表
有关如何使用服务调用 API 的 ACL 设置允许列表的信息和示例，请参阅 [服务调用的允许列表]({{< ref "invoke-allowlist.md" >}}) 指南。

#### 启用预览功能
请参阅 [预览功能]({{< ref "preview-features.md" >}}) 指南，了解关于如何选择加入某个版本的预览功能的信息和例子。 预览功能可以增加新的功能，这些功能在运行时成为普遍可用（GA）之前还需要更多时间。

### Sidecar 配置示例
下面的 yaml 内容展示了一个可以被应用于 Dapr sidecar 的配置文件：

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
有一个名为 `daprsystem` 的配置文件，该文件随应用全局设置的 Dapr 控制平面系统服务一起安装。 这个配置仅在 Dapr 部署到 Kubernetes 中时生效。

### 控制平面配置列表
在 Dapr 控制平面中，可以使用以下配置项：

| 属性               | 数据类型   | 说明                                 |
| ---------------- | ------ | ---------------------------------- |
| enabled          | bool   | 配置 mtls 是否开启                       |
| allowedClockSkew | string | 证书到期时，基于本地时钟偏差给出的额外过期时间。 默认值为15分钟。 |
| workloadCertTTL  | string | 证书有效时间。 默认值为 24 小时。                |

更多信息请参见 [Mutual TLS]({{< ref " mtls. md" >}}) 指南 和 [安全概念]({{< ref " security-concept. md" >}}) 。

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
