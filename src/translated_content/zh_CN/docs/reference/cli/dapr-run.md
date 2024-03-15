---
type: docs
title: run CLI command reference
linkTitle: run
description: Detailed information on the run CLI command
---

### Description

Run Dapr and (optionally) your application side by side. A full list comparing daprd arguments, CLI arguments, and Kubernetes annotations can be found [here]({{< ref arguments-annotations-overview.md >}}).

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})

### Usage

```bash
dapr run [flags] [command]
```

### Flags

| Name                              | Environment Variable | Default                                                                              | Description                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------- | -------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--app-id`, `-a`                  | `APP_ID`             |                                                                                      | The id for your application, used for service discovery. Cannot contain dots.                                                                                                                                                                                                                                                                       |
| `--app-max-concurrency`           |                      | `unlimited`                                                                          | 应用程序的并发级别；默认为无限制                                                                                                                                                                                                                                                                                                                                    |
| `--app-port`, `-p`                | `APP_PORT`           |                                                                                      | 应用程序正在侦听的端口                                                                                                                                                                                                                                                                                                                                         |
| `--app-protocol`, `-P`            |                      | `http`                                                                               | Dapr 用于与应用程序通信的协议。 Valid values are: `http`, `grpc`, `https` (HTTP with TLS), `grpcs` (gRPC with TLS), `h2c` (HTTP/2 Cleartext)                                                                                                                                                            |
| `--resources-path`, `-d`          |                      | Linux/Mac: `$HOME/.dapr/components` <br/>Windows: `%USERPROFILE%\.dapr\components`   | The path for resources directory. If you've organized your resources into multiple folders (for example, components in one folder, resiliency policies in another), you can define multiple resource paths. See [example]({{< ref "#examples" >}}) below. |
| `--app-channel-address`           |                      | `127.0.0.1`                                                                          | The network address the application listens on                                                                                                                                                                                                                                                                                                      |
| `--runtime-path`                  |                      |                                                                                      | Dapr 运行时安装路径                                                                                                                                                                                                                                                                                                                                        |
| `--config`, `-c`                  |                      | Linux/Mac: `$HOME/.dapr/config.yaml` <br/>Windows: `%USERPROFILE%\.dapr\config.yaml` | Dapr configuration file                                                                                                                                                                                                                                                                                                                             |
| `--dapr-grpc-port`, `-G`          | `DAPR_GRPC_PORT`     | `50001`                                                                              | The gRPC port for Dapr to listen on                                                                                                                                                                                                                                                                                                                 |
| `--dapr-internal-grpc-port`, `-I` |                      | `50002`                                                                              | The gRPC port for the Dapr internal API to listen on. Set during development for apps experiencing temporary errors with service invocation failures due to mDNS caching, or configuring Dapr sidecars behind firewall. Can be any value greater than 1024 and must be different for each app.                                                      |
| `--dapr-http-port`, `-H`          | `DAPR_HTTP_PORT`     | `3500`                                                                               | The HTTP port for Dapr to listen on                                                                                                                                                                                                                                                                                                                 |
| `--enable-profiling`              |                      | `false`                                                                              | Enable "pprof" profiling via an HTTP endpoint                                                                                                                                                                                                                                                                                                       |
| `--help`, `-h`                    |                      |                                                                                      | Print the help message                                                                                                                                                                                                                                                                                                                              |
| `--run-file`, `-f`                |                      | Linux/MacOS: `$HOME/.dapr/dapr.yaml`                                                 | Run multiple applications at once using a Multi-App Run template file. Currently in [alpha]({{< ref "support-preview-features.md" >}}) and only available in Linux/MacOS                                                                                                     |
| `--image`                         |                      |                                                                                      | Use a custom Docker image. Format is `repository/image` for Docker Hub, or `example.com/repository/image` for a custom registry.                                                                                                                                                                                                                    |
| `--log-level`                     |                      | `info`                                                                               | 日志详细程度。 Valid values are: `debug`, `info`, `warn`, `error`, `fatal`, or `panic`                                                                                                                                                                                                                                                                     |
| `--enable-api-logging`            |                      | `false`                                                                              | 启用从应用程序到 Dapr 的所有 API 调用的日志记录                                                                                                                                                                                                                                                                                                                       |
| `--metrics-port`                  | `DAPR_METRICS_PORT`  | `9090`                                                                               | Dapr 将 metrics 信息发送到的端口                                                                                                                                                                                                                                                                                                                             |
| `--profile-port`                  |                      | `7777`                                                                               | 要监听的性能检测服务的端口                                                                                                                                                                                                                                                                                                                                       |
| `--enable-app-health-check`       |                      | `false`                                                                              | Enable health checks for the application using the protocol defined with app-protocol                                                                                                                                                                                                                                                               |
| `--app-health-check-path`         |                      |                                                                                      | Path used for health checks; HTTP only                                                                                                                                                                                                                                                                                                              |
| `--app-health-probe-interval`     |                      |                                                                                      | 以秒为单位探测应用程序健康状态的间隔                                                                                                                                                                                                                                                                                                                                  |
| `--app-health-probe-timeout`      |                      |                                                                                      | 应用健康探测的超时时间（以毫秒为单位）                                                                                                                                                                                                                                                                                                                                 |
| `--app-health-threshold`          |                      |                                                                                      | 应用被视为不健康之前的最大连续失败次数                                                                                                                                                                                                                                                                                                                                 |
| `--unix-domain-socket`, `-u`      |                      |                                                                                      | Unix domain socket 目录挂载的路径。 如果指定了，与 Dapr sidecar 的通信将使用 unix domain sockets，与使用 TCP 端口相比，具有更低的延迟和更大的吞吐量。 在 Windows 操作系统上不可用。                                                                                                                                                                                                                        |
| `--dapr-http-max-request-size`    |                      | `4`                                                                                  | 请求正文的最大尺寸，单位为MB。                                                                                                                                                                                                                                                                                                                                    |
| `--dapr-http-read-buffer-size`    |                      | `4`                                                                                  | Http 请求头读取缓冲区的最大大小，单位为KB。 这也限制了 HTTP 标头的最大大小。 默认是4KB。                                                                                                                                                                                                                                                                                               |
| `--kubernetes`, `-k`              |                      |                                                                                      | Running Dapr on Kubernetes, and used for [Multi-App Run template files on Kubernetes]({{< ref multi-app-dapr-run >}}).                                                                                                                                                       |
| `--components-path`, `-d`         |                      | Linux/Mac: `$HOME/.dapr/components` <br/>Windows: `%USERPROFILE%\.dapr\components`   | **Deprecated** in favor of `--resources-path`                                                                                                                                                                                                                                                                                                       |

### 示例

```bash
# Run a .NET application
dapr run --app-id myapp --app-port 5000 -- dotnet run

# Run a .Net application with unix domain sockets
dapr run --app-id myapp --app-port 5000 --unix-domain-socket /tmp -- dotnet run

# Run a Java application
dapr run --app-id myapp -- java -jar myapp.jar

# Run a NodeJs application that listens to port 3000
dapr run --app-id myapp --app-port 3000 -- node myapp.js

# Run a Python application
dapr run --app-id myapp -- python myapp.py

# Run sidecar only
dapr run --app-id myapp

# Run a gRPC application written in Go (listening on port 3000)
dapr run --app-id myapp --app-port 5000 --app-protocol grpc -- go run main.go

# Run a NodeJs application that listens to port 3000 with API logging enabled
dapr run --app-id myapp --app-port 3000 --enable-api-logging  -- node myapp.js

# Pass multiple resource paths
dapr run --app-id myapp --resources-path path1 --resources-path path2

# Run the multi-app run template file
dapr run -f dapr.yaml

# Run the multi-app run template file on Kubernetes
dapr run -k -f dapr.yaml
```
