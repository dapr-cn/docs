---
type: docs
title: "对使用 .NET SDK 的 发布/订阅 进行故障排除。"
linkTitle: "发布/订阅的故障排除"
weight: 100000
description: 试用 .NET 虚拟 Actor
---

# 发布/订阅的故障排除

发布/订阅 最常见的问题是应用程序中的 发布/订阅 终结点没有被调用。

这个问题有几层有不同的解决方案：

- 应用程序没有接收到任何来自 Dapr 的流量
- 应用程序没有向 Dapr 注册 发布/订阅 终结点
- 发布/订阅 终结点在 Dapr 注册，但请求没有到达所需的终结点

## 第 1 步：打开日志

**这一点很重要。 之后的步骤将取决于您能否看到日志输出。 ASP.NET Core日志几乎没有默认日志设置，所以您需要更改它。**

按照 [这里](https://docs.microsoft.com/en-us/aspnet/core/mvc/controllers/routing?view=aspnetcore-5.0#debug-diagnostics)的描述，调整日志记录的详细程度，以包含 ASP.NET Core 的 `Information` 日志记录。 将 `Microsoft` 键的值设为 `Information`。

## 第 2 步：验证您可以接收来自 Dapr 的流量

1. 像平常一样启动应用程序(`dapr run ...`)。 请确保您在命令行中包含 `--app-port` 参数。 Dapr需要知道您的应用程序正在监听流量。 默认情况下，ASP.NET Core应用程序将在本地开发中通过5000端口监听HTTP。

2. 等待 Dapr 完成启动

3. 检查日志

你应该看到一个日志条目，如：

```
info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
      Request starting HTTP/1.1 GET http://localhost:5000/.....
```

在初始化过程中，Dapr会对您的应用程序发出一些配置请求。 如果你找不到这些，那么这意味着出了问题。 请通过 issue 或 Discord 请求帮助 (包括日志)。 如果您看到向应用程序发出的请求，请继续第 3 步。

## 第 3 步：验证终结点注册

1. 像平常一样启动应用程序(dapr run ...)。

2. 在命令行中使用`curl`（或其他HTTP测试工具）来访问`/dapr/subscribe`端点。

下面是一个例子，假设你的应用程序的监听端口是5000。

```sh
curl http://localhost:5000/dapr/subscribe -v
```

对于正确配置的应用，输出应如下所示：

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

特别注意 HTTP 状态代码和 JSON 输出。

```txt
< HTTP/1.1 200 OK
```

200 状态代码表示成功。


最后包含的 JSON blob 是`/dapr/subscribe`的输出，由Dapr运行时处理。 在这种情况下，它使用的是这个repo中的`ControllerSample` - 所以这是一个正确输出的例子。

```json
[
    {"topic":"deposit","route":"deposit","pubsubName":"pubsub"},
    {"topic":"withdraw","route":"withdraw","pubsubName":"pubsub"}
]
```

---

有了这个命令的输出，你就可以诊断问题或进入下一步了。

### 选项0：响应是200，其中包含一些 发布/订阅 条目。

**如果您在 JSON 输出中有此测试的条目，那么问题就会在其他地方出现，然后转到步骤 2。**

### 选项 1： 响应不是 200， 或不包含 Json

如果响应不是200或不包含 JSON ，则 `MapSubscribibeHandler()` 终结点未能实现。

请确保您在 `Startup.cs` 中有一些代码，然后重复测试。

```cs
app.UseRouting();

app.UseCloudEvents();

app.UseEndpoints(endpoints =>
{
    endpoints.MapSubscribeHandler(); // This is the Dapr subscribe handler
    endpoints.MapControllers();
});
```

**如果添加订阅处理程序无法解决问题。 请在此仓库中打开一个问题，并包含您的 `Startup.cs` 文件。**

### 选项 2：响应包含JSON，但它是空的（如 `[]`）

如果JSON输出是一个空数组 (如 `[]`)，那么下面的处理程序将被注册，但没有任何 topic 终结点。

---

如果你正在使用一个控制器来处理 发布/订阅 ，你应该有一个类似的方法：

```C#
[Topic("pubsub", "deposit")]
[HttpPost("deposit")]
public async Task<ActionResult> Deposit(...)
```

在这个示例中，需要 `Topic` 和 `HttpPost` 属性，但其他细节可能不同。

---

如果你使用的是 发布/订阅 的路由，你应该有一个终结点，比如：

```C#
endpoints.MapPost("deposit", ...).WithTopic("pubsub", "deposit");
```

在这个例子中，需要调用 `WithTopic(...)` ，但其他细节可能有所不同。

---

**在纠正这段代码并重新测试后，如果JSON输出仍然是空数组（像 `[]` ），那么请在这个仓库上打开一个问题，并包含 `Startup.cs` 的内容和你的 发布/订阅 终结点。**

## 第 4 步：验证终结点是否可访问

在这一步中，我们将验证用 发布/订阅 注册的条目是否可以访问。 最后一步应该给你留下一些JSON输出，比如下面：

```json
[
    {"topic":"deposit","route":"deposit","pubsubName":"pubsub"},
    {"topic":"withdraw","route":"withdraw","pubsubName":"pubsub"}
]
```

保留此输出，因为我们将使用 `route` 信息来测试应用程序。

1. 像平常一样启动应用程序(`dapr run ...`)。

2. 在命令行使用 `curl` (或其他HTTP测试工具) 来访问一个注册了 发布/订阅 终结点的路由。

下面是一个例子，假设您的应用程序的监听端口是5000，并且您的 发布/订阅 路由之一是`withdraw`。

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

根据 HTTP 400 和 JSON 有效载荷，该响应表明已到达终结点，但由于验证错误，请求被拒绝。

你也应该看看运行应用程序的控制台输出。 这是为清晰起见，去掉Dapr日志头的输出示例。

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
- 路由选择 `ControllerSample.Controllers.SampleController.Withdraw (ControllerSample)` 终结点

现在你已经掌握了解决这个问题所需的信息。

### 选项0：路由选择正确的终结点

如果路由日志条目中的信息是正确的，那么这意味着您的应用程序的行为是正确的。

示例:

```txt
info: Microsoft.AspNetCore.Routing.EndpointMiddleware[0]
      Executing endpoint 'ControllerSample.Controllers.SampleController.Withdraw (ControllerSample)'
```

您可能想尝试使用 Dapr cli 执行直接发送 发布/订阅 消息并比较日志输出。

示例命令：

```sh
dapr publish --pubsub pubsub --topic withdraw --data '{}'
```

**如果这样做之后，你仍然不理解这个问题，请在此仓库中打开一个问题，并包含您的 `Startup.cs` 文件。**

### 选项 1：路由没有执行

如果您在日志中没有看到 `Microsoft.AspNetCore.Routing.EndpointMiddleware` 的条目，那么这意味着该请求是由路由以外的其他东西处理的。 在这种情况下，问题通常是中间件错乱。 请求中的其他日志可能会给你一个线索，让你知道发生了什么。

**如果您需要帮助理解这个问题，请在此仓库中打开一个问题，并包含您的 `Startup.cs` 文件。**

### 选项 2：路由选择了错误的终结点

如果您在日志中看到 `Microsoft.AspNetCore.Routing.EndpointMiddleware` 的条目，但它包含了错误的端点，那么这意味着您有路由冲突。 所选择的终结点将出现在日志中，以便让你了解造成冲突的原因。

**如果您需要帮助理解这个问题，请在此仓库中打开一个问题，并包含您的 `Startup.cs` 文件。**
