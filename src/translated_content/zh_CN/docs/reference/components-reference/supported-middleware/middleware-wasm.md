---
type: docs
title: "Wasm"
linkTitle: "Wasm"
description: "在HTTP管道中使用Wasm中间件"
aliases:
- /zh-hans/developing-applications/middleware/supported-middleware/middleware-wasm/
---

WebAssembly是一种安全执行由其他语言编译的代码的方法。运行时会执行WebAssembly模块（Wasm），这些模块通常是带有`.wasm`扩展名的二进制文件。

Wasm [HTTP中间件]({{< ref middleware.md >}})允许您使用编译为Wasm二进制文件的自定义逻辑来处理传入请求或提供响应。换句话说，您可以使用未预编译到`daprd`二进制文件中的外部文件来扩展Dapr。Dapr嵌入了[wazero](https://wazero.io)以在不使用CGO的情况下实现这一点。

Wasm二进制文件可以从URL加载。例如，使用URL `file://rewrite.wasm`可以从进程的当前目录加载`rewrite.wasm`文件。在Kubernetes环境中，您可以参考[如何：将Pod卷挂载到Dapr sidecar]({{< ref kubernetes-volume-mounts.md >}})来配置可以包含Wasm模块的文件系统挂载。也可以从远程URL获取Wasm二进制文件。在这种情况下，URL必须精确指向一个Wasm二进制文件。例如：
- `http://example.com/rewrite.wasm`，或
- `https://example.com/rewrite.wasm`。

## 组件格式

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: wasm
spec:
  type: middleware.http.wasm
  version: v1
  metadata:
  - name: url
    value: "file://router.wasm"
  - guestConfig
    value: {"environment":"production"}
```

## 规范元数据字段

用户至少需要指定一个实现[http-handler](https://http-wasm.io/http-handler/)的Wasm二进制文件。如何编译将在后面描述。

| 字段 | 详情 | 必需 | 示例 |
|-------|----------------------------------------------------------------|----------|----------------|
| url   | 包含要实例化的Wasm二进制文件的资源URL。支持的方案包括`file://`、`http://`和`https://`。`file://` URL的路径相对于Dapr进程，除非它以`/`开头。 | true     | `file://hello.wasm`，`https://example.com/hello.wasm` |
| guestConfig   | 传递给Wasm来宾的可选配置。用户可以传递由Wasm代码解析的任意字符串。 | false     | `environment=production`，`{"environment":"production"}` |

## Dapr配置

要应用中间件，必须在[configuration]({{< ref configuration-concept.md >}})中引用它。请参阅[中间件管道]({{< ref "middleware.md#customize-processing-pipeline">}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: wasm
      type: middleware.http.wasm
```

*注意*：WebAssembly中间件使用的资源比本地中间件多。这可能导致资源限制比在本地代码中更快达到。生产环境中应[控制最大并发]({{< ref control-concurrency.md >}})。

### 生成Wasm

此组件允许您使用[http-handler](https://http-wasm.io/http-handler/)应用程序二进制接口（ABI）编译的自定义逻辑来处理传入请求或提供响应。`handle_request`函数接收传入请求，并可以根据需要对其进行处理或提供响应。

要编译您的Wasm，您需要使用符合http-handler的来宾SDK（如[TinyGo](https://github.com/http-wasm/http-wasm-guest-tinygo)）来编译源代码。

以下是TinyGo中的示例：

```go
package main

import (
	"strings"

	"github.com/http-wasm/http-wasm-guest-tinygo/handler"
	"github.com/http-wasm/http-wasm-guest-tinygo/handler/api"
)

func main() {
	handler.HandleRequestFn = handleRequest
}

// handleRequest实现了一个简单的HTTP路由器。
func handleRequest(req api.Request, resp api.Response) (next bool, reqCtx uint32) {
	// 如果URI以/host开头，修剪它并分派到下一个处理程序。
	if uri := req.GetURI(); strings.HasPrefix(uri, "/host") {
		req.SetURI(uri[5:])
		next = true // 继续到主机上的下一个处理程序。
		return
	}

	// 提供静态响应
	resp.Headers().Set("Content-Type", "text/plain")
	resp.Body().WriteString("hello")
	return // 跳过下一个处理程序，因为我们已经写了一个响应。
}
```

如果使用TinyGo，按如下所示编译，并将名为"url"的规范元数据字段设置为输出的位置（例如，`file://router.wasm`）：

```bash
tinygo build -o router.wasm -scheduler=none --no-debug -target=wasi router.go`
```

### Wasm `guestConfig` 示例

以下是如何使用`guestConfig`将配置传递给Wasm的示例。在Wasm代码中，您可以使用来宾SDK中定义的函数`handler.Host.GetConfig`来获取配置。在以下示例中，Wasm中间件从组件中定义的JSON配置中解析执行的`environment`。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: wasm
spec:
  type: middleware.http.wasm
  version: v1
  metadata:
  - name: url
    value: "file://router.wasm"
  - guestConfig
    value: {"environment":"production"}
```
以下是TinyGo中的示例：

```go
package main

import (
	"encoding/json"
	"github.com/http-wasm/http-wasm-guest-tinygo/handler"
	"github.com/http-wasm/http-wasm-guest-tinygo/handler/api"
)

type Config struct {
	Environment string `json:"environment"`
}

func main() {
	// 获取配置字节，这是组件中定义的guestConfig的值。
	configBytes := handler.Host.GetConfig()
	
	config := Config{}
	json.Unmarshal(configBytes, &config)
	handler.Host.Log(api.LogLevelInfo, "Config environment: "+config.Environment)
}
```

## 相关链接

- [中间件]({{< ref middleware.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
- [控制最大并发]({{< ref control-concurrency.md >}})
