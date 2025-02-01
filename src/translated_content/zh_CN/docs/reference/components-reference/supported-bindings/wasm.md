---
type: docs
title: "Wasm"
linkTitle: "Wasm"
description: "关于 WebAssembly 绑定组件的详细文档"
aliases:
- "/zh-hans/operations/components/setup-bindings/supported-bindings/wasm/"
---

## 概述

使用 WebAssembly，您可以安全地运行用其他语言编写并编译的代码。运行时执行 WebAssembly 模块（Wasm），这些模块通常是带有 `.wasm` 扩展名的二进制文件。

Wasm 绑定允许您通过传递命令行参数或环境变量来调用编译为 Wasm 的程序，就像使用普通子进程一样。例如，即使 Dapr 是用 Go 编写的并运行在没有安装 Python 的平台上，您也可以使用 Python 满足调用需求！

Wasm 二进制文件必须是使用 WebAssembly 系统接口（WASI）编译的程序。二进制文件可以是您编写的程序，例如用 Go 编写的，或者是您用来运行内联脚本的解释器，例如 Python。

至少，您需要指定一个使用标准 WASI 版本 `wasi_snapshot_preview1`（又名 `wasip1`）编译的 Wasm 二进制文件，通常缩写为 `wasi`。

> **注意：** 如果在 Go 1.21+ 中编译，这是 `GOOS=wasip1 GOARCH=wasm`。在 TinyGo、Rust 和 Zig 中，这是目标 `wasm32-wasi`。

您还可以重用现有的二进制文件。例如，[Wasm 语言运行时](https://github.com/vmware-labs/webassembly-language-runtimes)分发已经编译为 WASI 的解释器（包括 PHP、Python 和 Ruby）。

Wasm 二进制文件可以从 URL 加载。例如，URL `file://rewrite.wasm` 会从进程的当前目录加载 `rewrite.wasm`。在 Kubernetes 上，请参阅[如何：将 Pod 卷挂载到 Dapr sidecar]({{< ref kubernetes-volume-mounts.md >}})以配置可以包含 Wasm 二进制文件的文件系统挂载。也可以从远程 URL 获取 Wasm 二进制文件。在这种情况下，URL 必须准确指向一个 Wasm 二进制文件。例如：
- `http://example.com/rewrite.wasm`，或
- `https://example.com/rewrite.wasm`。

Dapr 使用 [wazero](https://wazero.io) 来运行这些二进制文件，因为它没有依赖项。这允许使用 WebAssembly 而无需安装过程，除了 Dapr 本身。

Wasm 输出绑定支持使用 [wasi-http](https://github.com/WebAssembly/wasi-http) 规范进行 HTTP 客户端调用。您可以在此处找到用多种语言进行 HTTP 调用的示例代码：
* [Golang](https://github.com/dev-wasm/dev-wasm-go/tree/main/http)
* [C](https://github.com/dev-wasm/dev-wasm-c/tree/main/http)
* [.NET](https://github.com/dev-wasm/dev-wasm-dotnet/tree/main/http)
* [TypeScript](https://github.com/dev-wasm/dev-wasm-ts/tree/main/http)

{{% alert title="注意" color="primary" %}}
如果您只想进行 HTTP 调用，使用 [service-invocation API]({{< ref howto-invoke-non-dapr-endpoints.md >}}) 更简单。然而，如果您需要添加自己的逻辑 - 例如，过滤或调用多个 API 端点 - 请考虑使用 Wasm。
{{% /alert %}}

## 组件格式

要配置 Wasm 绑定，请创建一个类型为 `bindings.wasm` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: wasm
spec:
  type: bindings.wasm
  version: v1
  metadata:
    - name: url
      value: "file://uppercase.wasm"
```

## 规范元数据字段

| 字段 | 详情 | 必需 | 示例 |
|-------|----------------------------------------------------------------|----------|----------------|
| `url`   | 包含要实例化的 Wasm 二进制文件的资源 URL。支持的方案包括 `file://`、`http://` 和 `https://`。`file://` URL 的路径相对于 Dapr 进程，除非它以 `/` 开头。 | true     | `file://hello.wasm`, `https://example.com/hello.wasm` |

## 绑定支持

此组件支持具有以下操作的**输出绑定**：

- `execute`

## 示例请求

如果存在，`data` 字段将是程序的 STDIN。您可以选择性地为每个请求传递元数据属性：

- `args` 任何 CLI 参数，逗号分隔。这不包括程序名称。

例如，考虑将 `url` 绑定到 Ruby 解释器，例如来自 [webassembly-language-runtimes](https://github.com/vmware-labs/webassembly-language-runtimes/releases/tag/ruby%2F3.2.0%2B20230215-1349da9)：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: wasm
spec:
  type: bindings.wasm
  version: v1
  metadata:
  - name: url
    value: "https://github.com/vmware-labs/webassembly-language-runtimes/releases/download/ruby%2F3.2.0%2B20230215-1349da9/ruby-3.2.0-slim.wasm"
```

假设您想在端口 3500 启动 Dapr 并使用 Wasm 绑定，您可以运行：

```
$ dapr run --app-id wasm --dapr-http-port 3500 --resources-path components
```

以下请求响应 `Hello "salaboy"`：

```sh
$ curl -X POST http://localhost:3500/v1.0/bindings/wasm -d'
{
  "operation": "execute",
  "metadata": {
    "args": "-ne,print \"Hello \"; print"
  },
  "data": "salaboy"
}'
```

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [bindings 构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [bindings API 参考]({{< ref bindings_api.md >}})