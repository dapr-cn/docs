---
type: docs
title: "使用 .NET SDK 进行 Pub/Sub 故障排查"
linkTitle: "Pub/Sub 故障排查"
weight: 100000
description: 使用 .NET SDK 进行 Pub/Sub 故障排查
---

# Pub/Sub 故障排查

Pub/Sub 的常见问题是应用程序中的 Pub/Sub 端点未被调用。

这个问题可以分为几个层次，每个层次有不同的解决方案：

- 应用程序没有接收到来自 Dapr 的任何流量
- 应用程序没有向 Dapr 注册 Pub/Sub 端点
- Pub/Sub 端点已在 Dapr 中注册，但请求没有到达预期的端点

## 步骤 1：提高日志级别

**这一点很重要。后续步骤将依赖于您查看日志输出的能力。ASP.NET Core 默认日志设置几乎不记录任何内容，因此您需要更改它。**

调整日志详细程度以包括 ASP.NET Core 的 `Information` 日志，如[此处](https://docs.microsoft.com/en-us/aspnet/core/mvc/controllers/routing?view=aspnetcore-5.0#debug-diagnostics)所述。将 `Microsoft` 键设置为 `Information`。

## 步骤 2：验证您可以接收到来自 Dapr 的流量

1. 像往常一样启动应用程序（`dapr run ...`）。确保在命令行中包含 `--app-port` 参数。Dapr 需要知道您的应用程序正在监听流量。默认情况下，ASP.NET Core 应用程序将在本地开发中监听 5000 端口的 HTTP。

2. 等待 Dapr 启动完成

3. 检查日志

您应该看到类似这样的日志条目：

```
info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
      Request starting HTTP/1.1 GET http://localhost:5000/.....
```

在初始化过程中，Dapr 会向您的应用程序发送一些请求以进行配置。如果找不到这些请求，则意味着出现了问题。请通过问题或 Discord 请求帮助（包括日志）。如果您看到对应用程序的请求，请继续执行下一步。

## 步骤 3：验证端点注册

1. 像往常一样启动应用程序（`dapr run ...`）。

2. 使用命令行中的 `curl`（或其他 HTTP 测试工具）访问 `/dapr/subscribe` 端点。

假设您的应用程序监听端口为 5000，这里是一个示例命令：

```sh
curl http://localhost:5000/dapr/subscribe -v
```

对于配置正确的应用程序，输出应如下所示：

```txt
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 5000 (#0)
> GET /dapr/subscribe HTTP/1.1
> Host: localhost:5000
> User-Agent: curl/7.64.1
> Accept: */*
>
< HTTP/1.1 200 OK
< Date: Fri, 15 Jan 2021 22:31:40 GMT
< Content-Type: application/json
< Server: Kestrel
< Transfer-Encoding: chunked
<
* Connection #0 to host localhost left intact
[{"topic":"deposit","route":"deposit","pubsubName":"pubsub"},{"topic":"withdraw","route":"withdraw","pubsubName":"pubsub"}]* Closing connection 0
```

特别注意 HTTP 状态码和 JSON 输出。

```txt
< HTTP/1.1 200 OK
```

200 状态码表示成功。

JSON 数据块是 `/dapr/subscribe` 的输出，由 Dapr 运行时处理。在这种情况下，它使用的是此仓库中的 `ControllerSample` - 这是正确输出的示例。

```json
[
    {"topic":"deposit","route":"deposit","pubsubName":"pubsub"},
    {"topic":"withdraw","route":"withdraw","pubsubName":"pubsub"}
]
```

---

通过此命令的输出，您可以诊断问题或继续下一步。

### 选项 0：响应为 200 并包含一些 Pub/Sub 条目

**如果您在此测试的 JSON 输出中有条目，则问题出在其他地方，请继续执行下一步。**

### 选项 1：响应不是 200，或不包含 JSON

如果响应不是 200 或不包含 JSON，则 `MapSubscribeHandler()` 端点未被访问。

确保在 `Startup.cs` 中有如下代码并重复测试。

```cs
app.UseRouting();

app.UseCloudEvents();

app.UseEndpoints(endpoints =>
{
    endpoints.MapSubscribeHandler(); // 这是 Dapr 订阅处理程序
    endpoints.MapControllers();
});
```

**如果添加订阅处理程序没有解决问题，请在此仓库中打开一个问题，并包括您的 `Startup.cs` 文件的内容。**

### 选项 2：响应包含 JSON 但为空（如 `[]`）

如果 JSON 输出是一个空数组（如 `[]`），则订阅处理程序已注册，但没有注册主题端点。

---

如果您使用控制器进行 Pub/Sub，您应该有一个类似的方法：

```C#
[Topic("pubsub", "deposit")]
[HttpPost("deposit")]
public async Task<ActionResult> Deposit(...)

// 使用 Pub/Sub 路由
[Topic("pubsub", "transactions", "event.type == \"withdraw.v2\"", 1)]
[HttpPost("withdraw")]
public async Task<ActionResult> Withdraw(...)
```

在此示例中，`Topic` 和 `HttpPost` 属性是必需的，但其他细节可能不同。

---

如果您使用路由进行 Pub/Sub，您应该有一个类似的端点：

```C#
endpoints.MapPost("deposit", ...).WithTopic("pubsub", "deposit");
```

在此示例中，调用 `WithTopic(...)` 是必需的，但其他细节可能不同。

---

**在更正此代码并重新测试后，如果 JSON 输出仍然是空数组（如 `[]`），请在此仓库中打开一个问题，并包括 `Startup.cs` 和您的 Pub/Sub 端点的内容。**

## 步骤 4：验证端点可达性

在此步骤中，我们将验证注册的 Pub/Sub 条目是否可达。上一步应该让您得到如下的 JSON 输出：

```json
[
  {
    "pubsubName": "pubsub",
    "topic": "deposit",
    "route": "deposit"
  },
  {
    "pubsubName": "pubsub",
    "topic": "deposit",
    "routes": {
      "rules": [
        {
          "match": "event.type == \"withdraw.v2\"",
          "path": "withdraw"
        }
      ]
    }
  }
]
```

保留此输出，因为我们将使用 `route` 信息来测试应用程序。

1. 像往常一样启动应用程序（`dapr run ...`）。
   
2. 使用命令行中的 `curl`（或其他 HTTP 测试工具）访问注册的 Pub/Sub 端点之一。

假设您的应用程序监听端口为 5000，并且您的一个 Pub/Sub 路由是 `withdraw`，这里是一个示例命令：

```sh
curl http://localhost:5000/withdraw -H 'Content-Type: application/json' -d '{}' -v
```

以下是对示例运行上述命令的输出：

```txt
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 5000 (#0)
> POST /withdraw HTTP/1.1
> Host: localhost:5000
> User-Agent: curl/7.64.1
> Accept: */*
> Content-Type: application/json
> Content-Length: 2
>
* upload completely sent off: 2 out of 2 bytes
< HTTP/1.1 400 Bad Request
< Date: Fri, 15 Jan 2021 22:53:27 GMT
< Content-Type: application/problem+json; charset=utf-8
< Server: Kestrel
< Transfer-Encoding: chunked
<
* Connection #0 to host localhost left intact
{"type":"https://tools.ietf.org/html/rfc7231#section-6.5.1","title":"One or more validation errors occurred.","status":400,"traceId":"|5e9d7eee-4ea66b1e144ce9bb.","errors":{"Id":["The Id field is required."]}}* Closing connection 0
```

根据 HTTP 400 和 JSON 负载，此响应表明端点已被访问，但请求由于验证错误而被拒绝。

您还应该查看正在运行的应用程序的控制台输出。这是去掉 Dapr 日志头后的示例输出，以便更清晰。

```
info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
      Request starting HTTP/1.1 POST http://localhost:5000/withdraw application/json 2
info: Microsoft.AspNetCore.Routing.EndpointMiddleware[0]
      Executing endpoint 'ControllerSample.Controllers.SampleController.Withdraw (ControllerSample)'
info: Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker[3]
      Route matched with {action = "Withdraw", controller = "Sample"}. Executing controller action with signature System.Threading.Tasks.Task`1[Microsoft.AspNetCore.Mvc.ActionResult`1[ControllerSample.Account]] Withdraw(ControllerSample.Transaction, Dapr.Client.DaprClient) on controller ControllerSample.Controllers.SampleController (ControllerSample).
info: Microsoft.AspNetCore.Mvc.Infrastructure.ObjectResultExecutor[1]
      Executing ObjectResult, writing value of type 'Microsoft.AspNetCore.Mvc.ValidationProblemDetails'.
info: Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker[2]
      Executed action ControllerSample.Controllers.SampleController.Withdraw (ControllerSample) in 52.1211ms
info: Microsoft.AspNetCore.Routing.EndpointMiddleware[1]
      Executed endpoint 'ControllerSample.Controllers.SampleController.Withdraw (ControllerSample)'
info: Microsoft.AspNetCore.Hosting.Diagnostics[2]
      Request finished in 157.056ms 400 application/problem+json; charset=utf-8
```

主要关注的日志条目是来自路由的：

```txt
info: Microsoft.AspNetCore.Routing.EndpointMiddleware[0]
      Executing endpoint 'ControllerSample.Controllers.SampleController.Withdraw (ControllerSample)'
```

此条目显示：

- 路由已执行
- 路由选择了 `ControllerSample.Controllers.SampleController.Withdraw (ControllerSample)` 端点

现在您有了排查此步骤问题所需的信息。

### 选项 0：路由选择了正确的端点

如果路由日志条目中的信息是正确的，则意味着在隔离情况下，您的应用程序行为正确。

示例：

```txt
info: Microsoft.AspNetCore.Routing.EndpointMiddleware[0]
      Executing endpoint 'ControllerSample.Controllers.SampleController.Withdraw (ControllerSample)'
```

您可能想尝试使用 Dapr CLI 直接发送 Pub/Sub 消息并比较日志输出。

示例命令：

```sh
dapr publish --pubsub pubsub --topic withdraw --data '{}'
```

**如果在这样做之后您仍然不理解问题，请在此仓库中打开一个问题，并包括您的 `Startup.cs` 的内容。**

### 选项 1：路由未执行

如果您在日志中没有看到 `Microsoft.AspNetCore.Routing.EndpointMiddleware` 的条目，则意味着请求被其他东西处理了。通常情况下，问题是一个行为不当的中间件。请求的其他日志可能会给您一个线索。

**如果您需要帮助理解问题，请在此仓库中打开一个问题，并包括您的 `Startup.cs` 的内容。**

### 选项 2：路由选择了错误的端点

如果您在日志中看到 `Microsoft.AspNetCore.Routing.EndpointMiddleware` 的条目，但它包含错误的端点，则意味着您有一个路由冲突。被选择的端点将出现在日志中，这应该能给您一个关于冲突原因的想法。

**如果您需要帮助理解问题，请在此仓库中打开一个问题，并包括您的 `Startup.cs` 的内容。**