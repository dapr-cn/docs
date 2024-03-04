---
type: docs
title: "使用 Dapr 可插拔组件 Go SDK 入门"
linkTitle: "Go"
weight: 1000
description: 如何使用 Dapr 可插拔组件 Go SDK 快速启动和运行
no_list: true
is_preview: true
---

Dapr 提供了帮助开发 Go 可插拔组件的包。

## 前期准备

- [Go 1.19](https://go.dev/dl/) 或更高版本
- [Dapr 1.9 CLI]({{< ref install-dapr-cli.md >}}) 或更高版本
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- Linux、Mac 或 Windows（使用 WSL）

{{% alert title="Note" color="primary" %}}
在 Windows 上开发 Dapr 可插拔组件需要 WSL。 并非所有语言和 SDK 都在“本机”Windows 上公开 Unix 域套接字。
{{% /alert %}}

## 应用程序创建

创建一个可插拔组件始于一个空的Go应用程序。

```bash
mkdir example
cd component
go mod init example
```

## 导入 Dapr 包

导入 Dapr 可插拔组件 SDK 包。

```bash
go get github.com/dapr-sandbox/components-go-sdk@v0.1.0
```

## 创建 main 包

在`main.go`中，导入Dapr可插拔组件包并运行应用程序。

```go
package main

import (
    dapr "github.com/dapr-sandbox/components-go-sdk"
)

func main() {
    dapr.MustRun()
}
```

这将创建一个没有组件的应用程序。 您需要实现并注册一个或多个组件。

## 实现和注册组件

 - [实现一个输入/输出绑定组件]({{< ref go-bindings >}})
 - [实现一个pub/sub组件]({{< ref go-pub-sub >}})
 - [实现一个状态存储组件]({{< ref go-state-store >}})

{{% alert title="Note" color="primary" %}}
每种类型的单个组件只能注册到单个服务。 然而 [同一类型的多个组件可以分布在多个服务中]({{< ref go-advanced >}}).
{{% /alert %}}

## 在本地测试组件

### 创建 Dapr 组件的 socket 目录

Dapr通过在一个公共目录中使用Unix域套接字文件与可插拔组件进行通信。 默认情况下，Dapr 和可插拔组件都使用 `/tmp/dapr-components-sockets` 目录。 如果该目录尚不存在，您应该创建该目录。

```bash
mkdir /tmp/dapr-components-sockets
```

### 启动可插拔组件

可插拔组件可以通过在命令行上启动应用程序进行测试。

要启动组件，在应用程序目录中执行以下操作：

```bash
go run main.go
```

### 配置 Dapr 以使用可插拔组件

要配置Dapr使用该组件，请在资源目录中创建一个组件YAML文件。 例如，对于一个状态存储组件：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <component name>
spec:
  type: state.<socket name>
  version: v1
  metadata:
  - name: key1
    value: value1
  - name: key2
    value: value2
```

任何`metadata`属性将在组件实例化时通过其`Store.Init(metadata state.Metadata)`方法传递给组件。

### 启动 Dapr

要启动 Dapr（以及可选地使用该服务的服务）：

```bash
dapr run --app-id <app id> --resources-path <resources path> ...
```

此时，Dapr sidecar 将已经启动并通过 Unix Domain Socket 连接到组件。 然后你可以通过组件进行交互：
- 通过使用组件的服务（如果已启动），或者
- 通过直接使用 Dapr 的 HTTP 或 gRPC API

## 创建容器

可插拔组件被部署为容器，作为应用程序的 sidecar 运行（如 Dapr 本身）。 创建用于Go应用程序的Docker镜像的典型`Dockerfile`可能如下所示：

```dockerfile
FROM golang:1.20-alpine AS builder

WORKDIR /usr/src/app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Build the application
COPY . .
RUN go build -v -o /usr/src/bin/app .

FROM alpine:latest

# Setup non-root user and permissions
RUN addgroup -S app && adduser -S app -G app
RUN mkdir /tmp/dapr-components-sockets && chown app /tmp/dapr-components-sockets

# Copy application to runtime image
COPY --from=builder --chown=app /usr/src/bin/app /app

USER app

CMD ["/app"]
```

构建镜像：

```bash
docker build -f Dockerfile -t <image name>:<tag> .
```

{{% alert title="Note" color="primary" %}}
`Dockerfile` 中的 `COPY` 操作的路径是相对于构建镜像时传递的 Docker 上下文的，而 Docker 上下文本身会根据正在构建的应用程序的需求而变化。 在上面的示例中，假设 Docker 上下文是组件应用程序目录。
{{% /alert %}}

## 下一步
- [Dapr 可插拔组件 Go SDK 的高级技巧]({{< ref go-advanced >}})
- 详细了解如何实现：
  - [绑定]({{< ref go-bindings >}})
  - [State]({{< ref go-state-store >}})
  - [Pub/sub]({{< ref go-pub-sub >}})
