---
type: docs
title: "如何使用多应用运行模板文件"
linkTitle: "如何使用多应用运行模板"
weight: 2000
description: 解压多应用运行模板文件及其属性
---

{{% alert title="注意" color="primary" %}}
目前，多应用运行在 **Kubernetes** 中是一个预览功能。
{{% /alert %}}

多应用运行模板文件是一个 YAML 文件，您可以使用它一次运行多个应用。在本指南中，您将学习如何：
- 使用多应用运行模板
- 查看已启动的应用
- 停止多应用运行模板
- 结构化多应用运行模板文件

## 使用多应用运行模板

您可以通过以下两种方式之一使用多应用运行模板文件：

### 通过提供目录路径执行

当您提供目录路径时，CLI 会在该目录中寻找名为 `dapr.yaml` 的多应用运行模板文件。如果找不到该文件，CLI 会返回错误。

执行以下 CLI 命令以读取默认名为 `dapr.yaml` 的多应用运行模板文件：

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

```cmd
# 如果给定目录路径，模板文件需要默认命名为 `dapr.yaml`

dapr run -f <dir_path>
```
{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

```cmd
dapr run -f <dir_path> -k 
```
{{% /codetab %}}

{{< /tabs >}}

### 通过提供文件路径执行

如果多应用运行模板文件的名称不是 `dapr.yaml`，您可以将相对或绝对文件路径提供给命令：

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

```cmd
dapr run -f ./path/to/<your-preferred-file-name>.yaml
```

{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

```cmd
dapr run -f ./path/to/<your-preferred-file-name>.yaml -k 
```
{{% /codetab %}}

{{< /tabs >}}

## 查看已启动的应用

一旦多应用模板正在运行，您可以使用以下命令查看已启动的应用：

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

```cmd
dapr list
```

{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

```cmd
dapr list -k 
```
{{% /codetab %}}

{{< /tabs >}}

## 停止多应用运行模板

您可以随时使用以下任一命令停止多应用运行模板：

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

```cmd
# 如果给定目录路径，模板文件需要默认命名为 `dapr.yaml`

dapr stop -f <dir_path>
```
或：

```cmd
dapr stop -f ./path/to/<your-preferred-file-name>.yaml
```

{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

```cmd
# 如果给定目录路径，模板文件需要默认命名为 `dapr.yaml`

dapr stop -f <dir_path> -k
```
或：

```cmd
dapr stop -f ./path/to/<your-preferred-file-name>.yaml -k 
```

{{% /codetab %}}

{{< /tabs >}}

## 模板文件结构

多应用运行模板文件可以包含以下属性。下面是一个示例模板，展示了两个应用及其配置的一些属性。

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

```yaml
version: 1
common: # 可选部分，用于跨应用共享变量
  resourcesPath: ./app/components # 任何要跨应用共享的 dapr 资源
  env:  # 任何跨应用共享的环境变量
    DEBUG: true
apps:
  - appID: webapp # 可选
    appDirPath: .dapr/webapp/ # 必需
    resourcesPath: .dapr/resources # 已弃用
    resourcesPaths: .dapr/resources # 逗号分隔的资源路径。（可选）可以按约定保留为默认值。
    appChannelAddress: 127.0.0.1 # 应用监听的网络地址。（可选）可以按约定保留为默认值。
    configFilePath: .dapr/config.yaml # （可选）也可以按约定为默认值，如果未找到文件则忽略。
    appProtocol: http
    appPort: 8080
    appHealthCheckPath: "/healthz"
    command: ["python3", "app.py"]
    appLogDestination: file # （可选），可以是 file, console 或 fileAndConsole。默认是 fileAndConsole。
    daprdLogDestination: file # （可选），可以是 file, console 或 fileAndConsole。默认是 file。
  - appID: backend # 可选
    appDirPath: .dapr/backend/ # 必需
    appProtocol: grpc
    appPort: 3000
    unixDomainSocket: "/tmp/test-socket"
    env:
      DEBUG: false
    command: ["./backend"]
```

模板文件中所有路径适用以下规则：
 - 如果路径是绝对的，则按原样使用。
 - common 部分下的所有相对路径应相对于模板文件路径提供。
 - apps 部分下的 `appDirPath` 应相对于模板文件路径提供。
 - apps 部分下的所有其他相对路径应相对于 `appDirPath` 提供。

{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

```yaml
version: 1
common: # 可选部分，用于跨应用共享变量
  env:  # 任何跨应用共享的环境变量
    DEBUG: true
apps:
  - appID: webapp # 可选
    appDirPath: .dapr/webapp/ # 必需
    appChannelAddress: 127.0.0.1 # 应用监听的网络地址。（可选）可以按约定保留为默认值。
    appProtocol: http
    appPort: 8080
    appHealthCheckPath: "/healthz"
    appLogDestination: file # （可选），可以是 file, console 或 fileAndConsole。默认是 fileAndConsole。
    daprdLogDestination: file # （可选），可以是 file, console 或 fileAndConsole。默认是 file。
    containerImage: ghcr.io/dapr/samples/hello-k8s-node:latest # （可选）在 Kubernetes 开发/测试环境中部署时使用的容器镜像 URI。
    createService: true # （可选）在开发/测试环境中部署应用时创建 Kubernetes 服务。
  - appID: backend # 可选
    appDirPath: .dapr/backend/ # 必需
    appProtocol: grpc
    appPort: 3000
    unixDomainSocket: "/tmp/test-socket"
    env:
      DEBUG: false
```

模板文件中所有路径适用以下规则：
 - 如果路径是绝对的，则按原样使用。
 - apps 部分下的 `appDirPath` 应相对于模板文件路径提供。
 - app 部分下的所有相对路径应相对于 `appDirPath` 提供。

{{% /codetab %}}

{{< /tabs >}}

## 模板属性

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

多应用运行模板的属性与 `dapr run` CLI 标志对齐，[在 CLI 参考文档中列出]({{< ref "dapr-run.md#flags" >}})。

{{< table "table table-white table-striped table-bordered" >}}

| 属性                     | 必需 | 详情 | 示例 |
|--------------------------|:----:|------|------|
| `appDirPath`             | Y    | 应用代码的路径 | `./webapp/`, `./backend/` |
| `appID`                  | N    | 应用的 app ID。如果未提供，将从 `appDirPath` 派生 | `webapp`, `backend` |
| `resourcesPath`          | N    | **已弃用**。Dapr 资源的路径。可以按约定为默认值 | `./app/components`, `./webapp/components` |
| `resourcesPaths`         | N    | 逗号分隔的 Dapr 资源路径。可以按约定为默认值 | `./app/components`, `./webapp/components` |
| `appChannelAddress`      | N    | 应用监听的网络地址。可以按约定保留为默认值。 | `127.0.0.1` | `localhost` |
| `configFilePath`         | N    | 应用配置文件的路径 | `./webapp/config.yaml` |
| `appProtocol`            | N    | Dapr 用于与应用通信的协议。 | `http`, `grpc` |
| `appPort`                | N    | 应用监听的端口 | `8080`, `3000` |
| `daprHTTPPort`           | N    | Dapr HTTP 端口 |  |
| `daprGRPCPort`           | N    | Dapr GRPC 端口 |  |
| `daprInternalGRPCPort`   | N    | Dapr 内部 API 监听的 gRPC 端口；用于从本地 DNS 组件解析值时 |  |
| `metricsPort`            | N    | Dapr 发送其指标信息的端口 |  |
| `unixDomainSocket`       | N    | Unix 域套接字目录挂载的路径。如果指定，与 Dapr 边车的通信使用 Unix 域套接字，与使用 TCP 端口相比，具有更低的延迟和更高的吞吐量。在 Windows 上不可用。 | `/tmp/test-socket` |
| `profilePort`            | N    | 配置文件服务器监听的端口 |  |
| `enableProfiling`        | N    | 通过 HTTP 端点启用分析 |  |
| `apiListenAddresses`     | N    | Dapr API 监听地址 |  |
| `logLevel`               | N    | 日志详细程度。 |  |
| `appMaxConcurrency`      | N    | 应用的并发级别；默认是无限制 |  |
| `placementHostAddress`   | N    |  |  |
| `appSSL`                 | N    | 启用 https，当 Dapr 调用应用时 |  |
| `daprHTTPMaxRequestSize` | N    | 请求体的最大大小（MB）。 |  |
| `daprHTTPReadBufferSize` | N    | HTTP 读取缓冲区的最大大小（KB）。这也限制了 HTTP 头的最大大小。默认是 4 KB |  |
| `enableAppHealthCheck`   | N    | 启用应用的健康检查 | `true`, `false` |
| `appHealthCheckPath`     | N    | 健康检查文件的路径 | `/healthz` |
| `appHealthProbeInterval` | N    | 应用健康探测的间隔（秒） |  |
| `appHealthProbeTimeout`  | N    | 应用健康探测的超时时间（毫秒） |  |
| `appHealthThreshold`     | N    | 应用被认为不健康的连续失败次数 |  |
| `enableApiLogging`       | N    | 启用从应用到 Dapr 的所有 API 调用的日志记录 |  |
| `runtimePath`            | N    | Dapr 运行时安装路径 |  |
| `env`                    | N    | 环境变量的映射；每个应用应用的环境变量将覆盖跨应用共享的环境变量 | `DEBUG`, `DAPR_HOST_ADD` |
| `appLogDestination`      | N    | 输出应用日志的日志目标；其值可以是 file, console 或 fileAndConsole。默认是 fileAndConsole | `file`, `console`, `fileAndConsole` |
| `daprdLogDestination`    | N    | 输出 daprd 日志的日志目标；其值可以是 file, console 或 fileAndConsole。默认是 file | `file`, `console`, `fileAndConsole` |

{{< /table >}}

## 下一步

观看[此视频以了解多应用运行的概述](https://youtu.be/s1p9MNl4VGo?t=2456)：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=2456" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

多应用运行模板的属性与 `dapr run -k` CLI 标志对齐，[在 CLI 参考文档中列出]({{< ref "dapr-run.md#flags" >}})。

{{< table "table table-white table-striped table-bordered" >}}

| 属性                     | 必需 | 详情 | 示例 |
|--------------------------|:----:|------|------|
| `appDirPath`             | Y    | 应用代码的路径 | `./webapp/`, `./backend/` |
| `appID`                  | N    | 应用的 app ID。如果未提供，将从 `appDirPath` 派生 | `webapp`, `backend` |
| `appChannelAddress`      | N    | 应用监听的网络地址。可以按约定保留为默认值。 | `127.0.0.1` | `localhost` |
| `appProtocol`            | N    | Dapr 用于与应用通信的协议。 | `http`, `grpc` |
| `appPort`                | N    | 应用监听的端口 | `8080`, `3000` |
| `daprHTTPPort`           | N    | Dapr HTTP 端口 |  |
| `daprGRPCPort`           | N    | Dapr GRPC 端口 |  |
| `daprInternalGRPCPort`   | N    | Dapr 内部 API 监听的 gRPC 端口；用于从本地 DNS 组件解析值时 |  |
| `metricsPort`            | N    | Dapr 发送其指标信息的端口 |  |
| `unixDomainSocket`       | N    | Unix 域套接字目录挂载的路径。如果指定，与 Dapr 边车的通信使用 Unix 域套接字，与使用 TCP 端口相比，具有更低的延迟和更高的吞吐量。在 Windows 上不可用。 | `/tmp/test-socket` |
| `profilePort`            | N    | 配置文件服务器监听的端口 |  |
| `enableProfiling`        | N    | 通过 HTTP 端点启用分析 |  |
| `apiListenAddresses`     | N    | Dapr API 监听地址 |  |
| `logLevel`               | N    | 日志详细程度。 |  |
| `appMaxConcurrency`      | N    | 应用的并发级别；默认是无限制 |  |
| `placementHostAddress`   | N    |  |  |
| `appSSL`                 | N    | 启用 https，当 Dapr 调用应用时 |  |
| `daprHTTPMaxRequestSize` | N    | 请求体的最大大小（MB）。 |  |
| `daprHTTPReadBufferSize` | N    | HTTP 读取缓冲区的最大大小（KB）。这也限制了 HTTP 头的最大大小。默认是 4 KB |  |
| `enableAppHealthCheck`   | N    | 启用应用的健康检查 | `true`, `false` |
| `appHealthCheckPath`     | N    | 健康检查文件的路径 | `/healthz` |
| `appHealthProbeInterval` | N    | 应用健康探测的间隔（秒） |  |
| `appHealthProbeTimeout`  | N    | 应用健康探测的超时时间（毫秒） |  |
| `appHealthThreshold`     | N    | 应用被认为不健康的连续失败次数 |  |
| `enableApiLogging`       | N    | 启用从应用到 Dapr 的所有 API 调用的日志记录 |  |
| `env`                    | N    | 环境变量的映射；每个应用应用的环境变量将覆盖跨应用共享的环境变量 | `DEBUG`, `DAPR_HOST_ADD` |
| `appLogDestination`      | N    | 输出应用日志的日志目标；其值可以是 file, console 或 fileAndConsole。默认是 fileAndConsole | `file`, `console`, `fileAndConsole` |
| `daprdLogDestination`    | N    | 输出 daprd 日志的日志目标；其值可以是 file, console 或 fileAndConsole。默认是 file | `file`, `console`, `fileAndConsole` |
| `containerImage`| N | 在 Kubernetes 开发/测试环境中部署时使用的容器镜像 URI。 | `ghcr.io/dapr/samples/hello-k8s-python:latest`
| `createService`|  N | 在开发/测试环境中部署应用时创建 Kubernetes 服务。 | `true`, `false` |

{{< /table >}}

## 下一步

观看[此视频以了解 Kubernetes 中多应用运行的概述](https://youtu.be/nWatANwaAik?si=O8XR-TUaiY0gclgO&t=1024)：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/nWatANwaAik?si=O8XR-TUaiY0gclgO&amp;start=1024" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

{{% /codetab %}}

{{< /tabs >}}