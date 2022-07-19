---
type: docs
title: "run CLI 命令参考文档"
linkTitle: "run"
description: "有关 run CLI 命令的详细信息"
---

### 说明

并排运行 Dapr 和 (可选) 应用程序。 比较 daprd 参数、CLI 参数和 Kubernetes 注解的完整列表可以在[此处]({{< ref arguments-annotations-overview.md >}})找到。

### 支持的平台

- [自托管]({{< ref self-hosted >}})

### 用法

```bash
dapr run [flags] [command]
```

### 参数

| Name                           | 环境变量                | 默认值                                                                                      | 说明                                                                                                     |
| ------------------------------ | ------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `--app-id`, `-a`               | `APP_ID`            |                                                                                          | 用于服务发现的应用程序 Id                                                                                         |
| `--app-max-concurrency`        |                     | `unlimited`                                                                              | 应用程序的并发级别，默认为无限制                                                                                       |
| `--app-port`, `-p`             | `APP_PORT`          |                                                                                          | 应用程序正在侦听的端口                                                                                            |
| `--app-protocol`, `-P`         |                     | `http`                                                                                   | 协议（gRPC 或 HTTP） Dapr 用于与应用程序通信。 有效值为: `http` 或 `grpc`                                                  |
| `--app-ssl`                    |                     | `false`                                                                                  | 当 Dapr 调用应用程序时启用 https                                                                                 |
| `--components-path`, `-d`      |                     | `Linux & Mac: $HOME/.dapr/components`, `Windows: %USERPROFILE%\.dapr\components`   | Components 目录的路径                                                                                       |
| `--config`, `-c`               |                     | `Linux & Mac: $HOME/.dapr/config.yaml`, `Windows: %USERPROFILE%\.dapr\config.yaml` | Dapr 配置文件                                                                                              |
| `--dapr-grpc-port`             | `DAPR_GRPC_PORT`    | `50001`                                                                                  | Dapr 要监听的 gRPC 端口                                                                                      |
| `--dapr-http-port`             | `DAPR_HTTP_PORT`    | `3500`                                                                                   | Dapr 要监听的 HTTP 端口                                                                                      |
| `--enable-profiling`           |                     | `false`                                                                                  | 通过 HTTP 端点启用 `pproft` 性能检测                                                                             |
| `--help`, `-h`                 |                     |                                                                                          | 显示此帮助消息                                                                                                |
| `--image`                      |                     |                                                                                          | 要在中生成代码的 image。 输入为： `repository/image`                                                                |
| `--log-level`                  |                     | `info`                                                                                   | 日志详细程度。 有效值因为其中之一: `debug`, `info`, `warn`, `error`, `fatal`, or `panic`                               |
| `--metrics-port`               | `DAPR_METRICS_PORT` | `9090`                                                                                   | Dapr 将 metrics 信息发送到的端口                                                                                |
| `--profile-port`               |                     | `7777`                                                                                   | 要监听的性能检测服务的端口                                                                                          |
| `--unix-domain-socket`, `-u`   |                     |                                                                                          | Unix domain socket 目录挂载的路径。 如果指定，与Dapr sidecar 的通信使用unix域套接字，与使用TCP端口相比，延迟更低，吞吐量更大。 在 Windows 操作系统上不可用 |
| `--dapr-http-max-request-size` |                     | `4`                                                                                      | 请求正文的最大尺寸，单位为MB。                                                                                       |
| `--dapr-http-read-buffer-size` |                     | `4`                                                                                      | Http 请求头读取缓冲区的最大大小，单位为KB。  默认是4KB。  当发送的http请求头超过默认4KB时，你应该给它设置一个更大的值，例如16(或者16KB)。                    |
### 示例

```bash
# 运行一个 .NET 应用
dapr run --app-id myapp --app-port 5000 -- dotnet run

# 使用unix domain sockets运行一个 .Net 应用 
dapr run --app-id myapp --app-port 5000 --unix-domain-socket /tmp -- dotnet run

# 运行一个 Java 应用
dapr run --app-id myapp -- java -jar myapp.jar

# 运行一个 NodeJs 应用，并且监听 3000端口
dapr run --app-id myapp --app-port 3000 -- node myapp.js

# 运行一个Python 应用
dapr run --app-id myapp -- python myapp.py

# 只运行边车
dapr run --app-id myapp

# 运行一个GO实现的 gRPC 应用，并且监听5000端口
dapr run --app-id myapp --app-port 5000 --app-protocol grpc -- go run main.go
```
