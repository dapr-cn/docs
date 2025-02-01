---
type: docs
title: "使用 Dapr 可插拔组件 Go SDK 入门"
linkTitle: "Go"
weight: 1000
description: 如何使用 Dapr 可插拔组件 Go SDK 快速上手
no_list: true
is_preview: true
---

Dapr 提供了一些工具包，帮助开发者创建 Go 可插拔组件。

## 前置条件

- [Go 1.19](https://go.dev/dl/) 或更高版本
- [Dapr 1.9 CLI]({{< ref install-dapr-cli.md >}}) 或更高版本
- 已初始化的 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- Linux、Mac 或 Windows（使用 WSL）

{{% alert title="注意" color="primary" %}}
在 Windows 上开发 Dapr 可插拔组件需要使用 WSL。并非所有语言和 SDK 都能在“原生”Windows 上支持 Unix 域套接字。
{{% /alert %}}

## 创建应用程序

要创建一个可插拔组件，首先需要一个空的 Go 应用程序。

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

## 创建主包

在 `main.go` 中，导入 Dapr 可插拔组件包并运行应用程序。

```go
package main

import (
	dapr "github.com/dapr-sandbox/components-go-sdk"
)

func main() {
	dapr.MustRun()
}
```

这会创建一个没有组件的应用程序，您需要实现并注册一个或多个组件。

## 实现和注册组件

- [实现一个输入/输出绑定组件]({{< ref go-bindings >}})
- [实现一个发布/订阅组件]({{< ref go-pub-sub >}})
- [实现一个状态存储组件]({{< ref go-state-store >}})

{{% alert title="注意" color="primary" %}}
每种类型的组件只能注册一个到单个服务中。然而，[同一类型的多个组件可以分布在多个服务中]({{< ref go-advanced >}})。
{{% /alert %}}

## 本地测试组件

### 创建 Dapr 组件套接字目录

Dapr 通过 Unix 域套接字文件在一个公共目录中与可插拔组件通信。默认情况下，Dapr 和可插拔组件都使用 `/tmp/dapr-components-sockets` 目录。如果该目录尚不存在，您应该创建它。

```bash
mkdir /tmp/dapr-components-sockets
```

### 启动可插拔组件

可以通过在命令行启动应用程序来测试可插拔组件。

要启动组件，在应用程序目录中：

```bash
go run main.go
```

### 配置 Dapr 使用可插拔组件

要配置 Dapr 使用组件，请在资源目录中创建一个组件 YAML 文件。例如，对于一个状态存储组件：

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

任何 `metadata` 属性将在组件实例化时通过其 `Store.Init(metadata state.Metadata)` 方法传递给组件。

### 启动 Dapr

要启动 Dapr（以及可选的使用该服务的服务）：

```bash
dapr run --app-id <app id> --resources-path <resources path> ...
```

此时，Dapr sidecar 将已启动并通过 Unix 域套接字连接到组件。然后，您可以通过以下方式与组件交互：
- 通过使用该组件的服务（如果已启动），或
- 直接使用 Dapr HTTP 或 gRPC API

## 创建容器

可插拔组件作为容器部署，作为应用程序的 sidecar 运行（如同 Dapr 本身）。一个典型的用于创建 Go 应用程序 Docker 镜像的 `Dockerfile` 可能如下所示：

```dockerfile
FROM golang:1.20-alpine AS builder

WORKDIR /usr/src/app

# 下载依赖
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# 构建应用程序
COPY . .
RUN go build -v -o /usr/src/bin/app .

FROM alpine:latest

# 设置非 root 用户和权限
RUN addgroup -S app && adduser -S app -G app
RUN mkdir /tmp/dapr-components-sockets && chown app /tmp/dapr-components-sockets

# 将应用程序复制到运行时镜像
COPY --from=builder --chown=app /usr/src/bin/app /app

USER app

CMD ["/app"]
```

构建镜像：

```bash
docker build -f Dockerfile -t <image name>:<tag> .
```

{{% alert title="注意" color="primary" %}}
`Dockerfile` 中 `COPY` 操作的路径是相对于构建镜像时传递的 Docker 上下文的，而 Docker 上下文本身会根据所构建应用程序的需求而有所不同。在上面的示例中，假设 Docker 上下文是组件应用程序目录。
{{% /alert %}}

## 下一步
- [使用可插拔组件 Go SDK 的高级技术]({{< ref go-advanced >}})
- 了解更多关于实现：
  - [绑定]({{< ref go-bindings >}})
  - [状态]({{< ref go-state-store >}})
  - [发布/订阅]({{< ref go-pub-sub >}})
