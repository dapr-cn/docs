---
type: docs
title: "run CLI 命令参考"
linkTitle: "run"
description: "有关 run CLI 命令的详细信息"
---

### 说明

并排运行 Dapr 和 (可选) 应用程序。 A full list comparing daprd arguments, CLI arguments, and Kubernetes annotations can be found [here]({{< ref arguments-annotations-overview.md >}}).

### 支持的平台

- [自托管]({{< ref self-hosted >}})

### 用法

```bash
dapr run [flags] [command]
```

### 参数

| Name                           | 环境变量                | 默认值                                                                                      | 说明                                                                       |
| ------------------------------ | ------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `--app-id`, `-a`               | `APP_ID`            |                                                                                          | 用于服务发现的应用程序 Id                                                           |
| `--app-max-concurrency`        |                     | `unlimited`                                                                              | 应用程序的并发级别，默认为无限制                                                         |
| `--app-port`, `-p`             | `APP_PORT`          |                                                                                          | 应用程序正在侦听的端口                                                              |
| `--app-protocol`, `-P`         |                     | `http`                                                                                   | 协议（gRPC 或 HTTP） Dapr 用于与应用程序通信。 有效值为: `http` 或 `grpc`                    |
| `--app-ssl`                    |                     | `false`                                                                                  | 当 Dapr 调用应用程序时启用 https                                                   |
| `--components-path`, `-d`      |                     | `Linux & Mac: $HOME/.dapr/components`, `Windows: %USERPROFILE%\.dapr\components`   | Components 目录的路径                                                         |
| `--config`, `-c`               |                     | `Linux & Mac: $HOME/.dapr/config.yaml`, `Windows: %USERPROFILE%\.dapr\config.yaml` | Dapr 配置文件                                                                |
| `--dapr-grpc-port`             | `DAPR_GRPC_PORT`    | `50001`                                                                                  | Dapr 要监听的 gRPC 端口                                                        |
| `--dapr-http-port`             | `DAPR_HTTP_PORT`    | `3500`                                                                                   | Dapr 要监听的 HTTP 端口                                                        |
| `--enable-profiling`           |                     | `false`                                                                                  | 通过 HTTP 端点启用 `pproft` 性能检测                                               |
| `--help`, `-h`                 |                     |                                                                                          | 显示此帮助消息                                                                  |
| `--image`                      |                     |                                                                                          | 要在中生成代码的 image。 输入为： `repository/image`                                  |
| `--log-level`                  |                     | `info`                                                                                   | 日志详细程度。 有效值因为其中之一: `debug`, `info`, `warn`, `error`, `fatal`, or `panic` |
| `--metrics-port`               | `DAPR_METRICS_PORT` | `9090`                                                                                   | The port that Dapr sends its metrics information to                      |
| `--profile-port`               |                     | `7777`                                                                                   | 要侦听的性能检测服务的端口                                                            |
| `--dapr-http-max-request-size` |                     | `4`                                                                                      | Max size of request body in MB.                                          |

### 示例

```bash
# Run a .NET application
dapr run --app-id myapp --app-port 5000 -- dotnet run

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
```
