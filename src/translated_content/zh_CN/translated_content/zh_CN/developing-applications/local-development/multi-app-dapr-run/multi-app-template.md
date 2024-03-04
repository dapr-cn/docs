---
type: docs
title: "如何使用多应用运行模板文件"
linkTitle: "How to: Use the Multi-App Run template"
weight: 2000
description: 解构多应用运行模板文件及其属性
---

{{% alert title="Note" color="primary" %}}
 **Kubernetes**的多应用运行目前是一个预览功能。
{{% /alert %}}

Multi-App Run模板文件是一个YAML文件，您可以使用它同时运行多个应用程序。 在本指南中，您将学习如何：
- 使用多应用程序模板
- 查看已启动的应用程序
- 停止多应用程序模板
- 结构化多应用程序模板文件

## 使用多应用程序模板

您可以以以下两种方式之一使用多应用程序模板文件：

### 通过提供目录路径执行

当您提供一个目录路径时，CLI 将尝试定位该目录中默认命名为 `dapr.yaml` 的多应用运行模板文件。 如果文件未找到，CLI 将返回一个错误。

执行以下命令行工具命令来读取默认命名为 `dapr.yaml` 的多应用运行模板文件：

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

```cmd
# the template file needs to be called `dapr.yaml` by default if a directory path is given

dapr run -f <dir_path>
```
{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

```cmd
dapr run -f -k <dir_path>
```
{{% /codetab %}}

{{< /tabs >}}

### 通过提供文件路径执行

如果多应用运行模板文件的名称不是`dapr.yaml`，那么您可以提供相对或绝对文件路径给命令：

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
dapr run -f -k ./path/to/<your-preferred-file-name>.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## 查看已启动的应用程序

一旦多应用程序模板运行起来，您可以使用以下命令查看已启动的应用程序：

```cmd
dapr list
```

## 停止多应用程序模板

随时使用以下任一命令停止多应用运行模板：

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

```cmd
# the template file needs to be called `dapr.yaml` by default if a directory path is given

dapr stop -f <dir_path>
```
或者:

```cmd
dapr stop -f ./path/to/<your-preferred-file-name>.yaml
```

{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

```cmd
# the template file needs to be called `dapr.yaml` by default if a directory path is given

dapr stop -f -k
```
或者:

```cmd
dapr stop -f -k ./path/to/<your-preferred-file-name>.yaml
```

{{% /codetab %}}

{{< /tabs >}}


## 模板文件结构

多应用运行模板文件可以包括以下属性。 下面是一个示例模板，显示了配置了一些属性的两个应用程序。

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

```yaml
version: 1
common: # optional section for variables shared across apps
  resourcesPath: ./app/components # any dapr resources to be shared across apps
  env:  # any environment variable shared across apps
    DEBUG: true
apps:
  - appID: webapp # optional
    appDirPath: .dapr/webapp/ # REQUIRED
    resourcesPath: .dapr/resources # deprecated
    resourcesPaths: .dapr/resources # comma separated resources paths. (optional) can be left to default value by convention.
    appChannelAddress: 127.0.0.1 # network address where the app listens on. (optional) can be left to default value by convention.
    configFilePath: .dapr/config.yaml # (optional) can be default by convention too, ignore if file is not found.
    appProtocol: http
    appPort: 8080
    appHealthCheckPath: "/healthz"
    command: ["python3", "app.py"]
    appLogDestination: file # (optional), can be file, console or fileAndConsole. default is fileAndConsole.
    daprdLogDestination: file # (optional), can be file, console or fileAndConsole. default is file.
  - appID: backend # optional
    appDirPath: .dapr/backend/ # REQUIRED
    appProtocol: grpc
    appPort: 3000
    unixDomainSocket: "/tmp/test-socket"
    env:
      DEBUG: false
    command: ["./backend"]
```

以下规则适用于模板文件中的所有路径：
 - 如果路径是绝对路径，则使用原样。
 - 所有在common部分下的相对路径都应该相对于模板文件路径提供。
 - 在应用程序部分的`appDirPath`应该相对于模板文件路径提供。
 - 所有在apps部分下的其他相对路径都应该相对于`appDirPath`提供。

{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

```yaml
version: 1
common: # optional section for variables shared across apps
  env:  # any environment variable shared across apps
    DEBUG: true
apps:
  - appID: webapp # optional
    appDirPath: .dapr/webapp/ # REQUIRED
    appChannelAddress: 127.0.0.1 # network address where the app listens on. (optional) can be left to default value by convention.
    appProtocol: http
    appPort: 8080
    appHealthCheckPath: "/healthz"
    appLogDestination: file # (optional), can be file, console or fileAndConsole. default is fileAndConsole.
    daprdLogDestination: file # (optional), can be file, console or fileAndConsole. default is file.
    containerImage: ghcr.io/dapr/samples/hello-k8s-node:latest # (optional) URI of the container image to be used when deploying to Kubernetes dev/test environment.
    createService: true # (optional) Create a Kubernetes service for the application when deploying to dev/test environment.
  - appID: backend # optional
    appDirPath: .dapr/backend/ # REQUIRED
    appProtocol: grpc
    appPort: 3000
    unixDomainSocket: "/tmp/test-socket"
    env:
      DEBUG: false
```

以下规则适用于模板文件中的所有路径：
 - 如果路径是绝对路径，则使用原样。
 - 在应用程序部分的`appDirPath`应该相对于模板文件路径提供。
 - 所有在app部分下的相对路径都应该相对于`appDirPath`提供。

{{% /codetab %}}

{{< /tabs >}}

## 模板属性

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

多应用运行模板的属性与 `dapr run` CLI 标志， [CLI 参考文档中列出]({{< ref "dapr-run.md#flags" >}}).

{{< table "table table-white table-striped table-bordered" >}}

| 属性                       | 必填 | 详情                                                                                                                           | 示例                                        |
| ------------------------ |:--:| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `appDirPath`             | 是  | 应用代码的路径                                                                                                                      | `./webapp/`, `./backend/`                 |
| `appID`                  | 否  | 应用程序的应用程序 ID。 如果未提供，将从`appDirPath`派生                                                                                         | `webapp`, `backend`                       |
| `resourcesPath`          | 否  | **已弃用**。 Dapr 资源的路径。 可以按照惯例设置为默认值                                                                                            | `./app/components`, `./webapp/components` |
| `resourcesPaths`         | 否  | 逗号分隔的 Dapr 资源路径。 可以按照惯例设置为默认值                                                                                                | `./app/components`, `./webapp/components` |
| `appChannelAddress`      | 否  | 应用程序监听的网络地址。 可以按照惯例设置为默认值。                                                                                                   | `127.0.0.1` | `localhost`                 |
| `configFilePath`         | 否  | 应用程序配置文件的路径                                                                                                                  | `./webapp/config.yaml`                    |
| `appProtocol`            | 否  | Dapr用于与应用程序通信的协议。                                                                                                            | `http`, `grpc`                            |
| `appPort`                | 否  | 应用程序正在监听的端口                                                                                                                  | `8080`, `3000`                            |
| `daprHTTPPort`           | 否  | Dapr HTTP端口                                                                                                                  |                                           |
| `daprGRPCPort`           | 否  | Dapr GRPC端口                                                                                                                  |                                           |
| `daprInternalGRPCPort`   | 否  | dapr 内部 API 监听的 gRPC 端口；在从本地 DNS 组件解析值时使用                                                                                    |                                           |
| `metricsPort`            | 否  | Dapr 将 metrics 信息发送到的端口                                                                                                      |                                           |
| `unixDomainSocket`       | 否  | Unix domain socket 目录挂载的路径。 如果指定了，与 Dapr sidecar 的通信将使用 unix domain sockets，与使用 TCP 端口相比，具有更低的延迟和更大的吞吐量。 在 Windows 操作系统上不可用。 | `/tmp/test-socket`                        |
| `profilePort`            | 否  | 要监听的性能检测服务的端口                                                                                                                |                                           |
| `enableProfiling`        | 否  | 通过 HTTP 端点启用性能检测                                                                                                             |                                           |
| `apiListenAddresses`     | 否  | Dapr API监听地址                                                                                                                 |                                           |
| `logLevel`               | 否  | 日志详细程度。                                                                                                                      |                                           |
| `appMaxConcurrency`      | 否  | 应用程序的并发级别；默认为无限制                                                                                                             |                                           |
| `placementHostAddress`   | 否  |                                                                                                                              |                                           |
| `appSSL`                 | 否  | 当 Dapr 调用应用程序时启用 https                                                                                                       |                                           |
| `daprHTTPMaxRequestSize` | 否  | 请求正文的最大尺寸，单位为MB。                                                                                                             |                                           |
| `daprHTTPReadBufferSize` | 否  | Http 请求头读取缓冲区的最大大小，单位为KB。 这也限制了 HTTP 标头的最大大小。 默认是4KB。                                                                        |                                           |
| `enableAppHealthCheck`   | 否  | 在应用程序上启用应用健康检查                                                                                                               | `true`, `false`                           |
| `appHealthCheckPath`     | 否  | 健康检查文件的路径                                                                                                                    | `/healthz`                                |
| `appHealthProbeInterval` | 否  | 以秒为单位探测应用程序健康状态的间隔                                                                                                           |                                           |
|                          |    |                                                                                                                              |                                           |
| `appHealthProbeTimeout`  | 否  | 应用健康探测的超时时间（以毫秒为单位）                                                                                                          |                                           |
| `appHealthThreshold`     | 否  | 应用被视为不健康之前的最大连续失败次数                                                                                                          |                                           |
| `enableApiLogging`       | 否  | 启用从应用程序到 Dapr 的所有 API 调用的日志记录                                                                                                |                                           |
| `runtimePath`            | 否  | Dapr 运行时安装路径                                                                                                                 |                                           |
| `env`                    | 否  | 映射到环境变量；每个应用程序应用的环境变量将覆盖所有应用程序共享的环境变量                                                                                        | `DEBUG`, `DAPR_HOST_ADD`                  |
| `appLogDestination`      | 否  | 用于输出应用日志的日志目的地; 其值可以是 file、console 或 fileAndConsole。 默认值为 fileAndConsole                                                     | `file`, `console`, `fileAndConsole`       |
| `daprdLogDestination`    | 否  | 用于输出 daprd 日志的日志目标；其值可以是文件（file），控制台（console）或文件和控制台（fileAndConsole）。 默认值为 file                                              | `file`, `console`, `fileAndConsole`       |

{{< /table >}}

## 下一步

看 [此视频概述了多应用运行](https://youtu.be/s1p9MNl4VGo?t=2456):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=2456" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

多应用运行模板的属性与 `dapr run -k` CLI 标志， [CLI 参考文档中列出]({{< ref "dapr-run.md#flags" >}}).

{{< table "table table-white table-striped table-bordered" >}}

| 属性                       | 必填 | 详情                                                                                                                           | 示例                                             |
| ------------------------ |:--:| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `appDirPath`             | 是  | 应用代码的路径                                                                                                                      | `./webapp/`, `./backend/`                      |
| `appID`                  | 否  | 应用程序的应用程序 ID。 如果未提供，将从`appDirPath`派生                                                                                         | `webapp`, `backend`                            |
| `appChannelAddress`      | 否  | 应用程序监听的网络地址。 可以按照惯例设置为默认值。                                                                                                   | `127.0.0.1` | `localhost`                      |
| `appProtocol`            | 否  | Dapr 用于与应用程序通信的协议。                                                                                                           | `http`, `grpc`                                 |
| `appPort`                | 否  | 应用程序正在监听的端口                                                                                                                  | `8080`, `3000`                                 |
| `daprHTTPPort`           | 否  | Dapr HTTP端口                                                                                                                  |                                                |
| `daprGRPCPort`           | 否  | Dapr GRPC端口                                                                                                                  |                                                |
| `daprInternalGRPCPort`   | 否  | dapr 内部 API 监听的 gRPC 端口；在从本地 DNS 组件解析值时使用                                                                                    |                                                |
| `metricsPort`            | 否  | Dapr 将 metrics 信息发送到的端口                                                                                                      |                                                |
| `unixDomainSocket`       | 否  | Unix domain socket 目录挂载的路径。 如果指定了，与 Dapr sidecar 的通信将使用 unix domain sockets，与使用 TCP 端口相比，具有更低的延迟和更大的吞吐量。 在 Windows 操作系统上不可用。 | `/tmp/test-socket`                             |
| `profilePort`            | 否  | 要监听的性能检测服务的端口                                                                                                                |                                                |
| `enableProfiling`        | 否  | 通过 HTTP 端点启用性能检测                                                                                                             |                                                |
| `apiListenAddresses`     | 否  | Dapr API监听地址                                                                                                                 |                                                |
| `logLevel`               | 否  | 日志详细程度。                                                                                                                      |                                                |
| `appMaxConcurrency`      | 否  | 应用程序的并发级别；默认为无限制                                                                                                             |                                                |
| `placementHostAddress`   | 否  |                                                                                                                              |                                                |
| `appSSL`                 | 否  | 当 Dapr 调用应用程序时启用 https                                                                                                       |                                                |
| `daprHTTPMaxRequestSize` | 否  | 请求正文的最大尺寸，单位为MB。                                                                                                             |                                                |
| `daprHTTPReadBufferSize` | 否  | Http 请求头读取缓冲区的最大大小，单位为KB。 这也限制了 HTTP 标头的最大大小。 默认是4KB。                                                                        |                                                |
| `enableAppHealthCheck`   | 否  | 在应用程序上启用应用健康检查                                                                                                               | `true`, `false`                                |
| `appHealthCheckPath`     | 否  | 健康检查文件的路径                                                                                                                    | `/healthz`                                     |
| `appHealthProbeInterval` | 否  | 以秒为单位探测应用程序健康状态的间隔                                                                                                           |                                                |
|                          |    |                                                                                                                              |                                                |
| `appHealthProbeTimeout`  | 否  | 应用健康探测的超时时间（以毫秒为单位）                                                                                                          |                                                |
| `appHealthThreshold`     | 否  | 应用被视为不健康之前的最大连续失败次数                                                                                                          |                                                |
| `enableApiLogging`       | 否  | 启用从应用程序到 Dapr 的所有 API 调用的日志记录                                                                                                |                                                |
| `env`                    | 否  | 映射到环境变量；每个应用程序应用的环境变量将覆盖所有应用程序共享的环境变量                                                                                        | `DEBUG`, `DAPR_HOST_ADD`                       |
| `appLogDestination`      | 否  | 用于输出应用日志的日志目的地; 其值可以是 file、console 或 fileAndConsole。 默认值为 fileAndConsole                                                     | `file`, `console`, `fileAndConsole`            |
| `daprdLogDestination`    | 否  | 用于输出 daprd 日志的日志目标；其值可以是文件（file），控制台（console）或文件和控制台（fileAndConsole）。 默认值为 file                                              | `file`, `console`, `fileAndConsole`            |
| `containerImage`         | 否  | 部署到 Kubernetes 开发/测试环境时要使用的容器映像的 URI。                                                                                        | `ghcr.io/dapr/samples/hello-k8s-python:latest` |
| `createService`          | 否  | 在部署到开发/测试环境时为应用程序创建一个Kubernetes服务。                                                                                           | `true`, `false`                                |

{{< /table >}}

## 下一步

看 [此视频概述了 Kubernetes 中的多应用运行](https://youtu.be/nWatANwaAik?si=O8XR-TUaiY0gclgO&t=1024):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/nWatANwaAik?si=O8XR-TUaiY0gclgO&amp;start=1024" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

{{% /codetab %}}

{{< /tabs >}}


