---
type: docs
title: "DaprWorkflowClient 使用"
linkTitle: "DaprWorkflowClient 使用"
weight: 100000
description: 使用 DaprWorkflowClient 的基本提示和建议
---

## 生命周期管理

`DaprWorkflowClient` 可以访问网络资源，这些资源通过 TCP 套接字与 Dapr sidecar 以及其他用于管理和操作工作流的类型进行通信。`DaprWorkflowClient` 实现了 `IAsyncDisposable` 接口，以便快速清理资源。

## 依赖注入

`AddDaprWorkflow()` 方法用于通过 ASP.NET Core 的依赖注入机制注册 Dapr 工作流服务。此方法需要一个选项委托，用于定义您希望在应用程序中注册和使用的每个工作流和活动。

{{% alert title="注意" color="primary" %}} 

此方法会尝试注册一个 `DaprClient` 实例，但仅在尚未以其他生命周期注册的情况下才有效。例如，如果之前以单例生命周期调用了 `AddDaprClient()`，那么无论为工作流客户端选择何种生命周期，都会始终使用单例。`DaprClient` 实例用于与 Dapr sidecar 通信，如果尚未注册，则在 `AddDaprWorkflow()` 注册期间提供的生命周期将用于注册 `DaprWorkflowClient` 及其依赖项。

{{% /alert %}} 

### 单例注册

默认情况下，`AddDaprWorkflow` 方法会以单例生命周期注册 `DaprWorkflowClient` 和相关服务。这意味着服务只会被实例化一次。

以下是在典型的 `Program.cs` 文件中注册 `DaprWorkflowClient` 的示例：

```csharp
builder.Services.AddDaprWorkflow(options => {
    options.RegisterWorkflow<YourWorkflow>();
    options.RegisterActivity<YourActivity>();
});

var app = builder.Build();
await app.RunAsync();
```

### 作用域注册

虽然默认的单例注册通常适用，但您可能希望指定不同的生命周期。这可以通过在 `AddDaprWorkflow` 中传递一个 `ServiceLifetime` 参数来实现。例如，您可能需要将另一个作用域服务注入到 ASP.NET Core 处理管道中，该管道需要 `DaprClient` 使用的上下文，如果前者服务注册为单例，则无法使用。

以下示例演示了这一点：

```csharp
builder.Services.AddDaprWorkflow(options => {
    options.RegisterWorkflow<YourWorkflow>();
    options.RegisterActivity<YourActivity>();
}, ServiceLifecycle.Scoped);

var app = builder.Build();
await app.RunAsync();
```

### 瞬态注册

最后，Dapr 服务也可以使用瞬态生命周期注册，这意味着每次注入时都会重新初始化。这在以下示例中演示：

```csharp
builder.Services.AddDaprWorkflow(options => {
    options.RegisterWorkflow<YourWorkflow>();
    options.RegisterActivity<YourActivity>();
}, ServiceLifecycle.Transient);

var app = builder.Build();
await app.RunAsync();
```

## 将服务注入到工作流活动中

工作流活动支持现代 C# 应用程序中常用的依赖注入。假设在启动时进行了适当的注册，任何此类类型都可以注入到工作流活动的构造函数中，并在工作流执行期间使用。这使得通过注入的 `ILogger` 添加日志记录或通过注入 `DaprClient` 或 `DaprJobsClient` 访问其他 Dapr 组件变得简单。

```csharp
internal sealed class SquareNumberActivity : WorkflowActivity<int, int>
{
    private readonly ILogger _logger;
    
    public MyActivity(ILogger logger)
    {
        this._logger = logger;
    }
    
    public override Task<int> RunAsync(WorkflowActivityContext context, int input) 
    {
        this._logger.LogInformation("Squaring the value {number}", input);
        var result = input * input;
        this._logger.LogInformation("Got a result of {squareResult}", result);
        
        return Task.FromResult(result);
    }
}
```

### 在工作流中使用 ILogger

由于工作流必须是确定性的，因此不能将任意服务注入其中。例如，如果您能够将标准 `ILogger` 注入到工作流中，并且由于错误需要重放它，日志记录的重复操作可能会导致混淆，因为这些操作实际上并没有再次发生。为了解决这个问题，工作流中提供了一种重放安全的日志记录器。它只会在工作流第一次运行时记录事件，而在重放时不会记录任何内容。

这种日志记录器可以通过工作流实例上的 `WorkflowContext` 中的方法获取，并可以像使用 `ILogger` 实例一样使用。

一个展示此功能的完整示例可以在 [.NET SDK 仓库](https://github.com/dapr/dotnet-sdk/blob/master/examples/Workflow/WorkflowConsoleApp/Workflows/OrderProcessingWorkflow.cs) 中找到，以下是该示例的简要摘录。

```csharp
public class OrderProcessingWorkflow : Workflow<OrderPayload, OrderResult>
{
    public override async Task<OrderResult> RunAsync(WorkflowContext context, OrderPayload order)
    {
        string orderId = context.InstanceId;
        var logger = context.CreateReplaySafeLogger<OrderProcessingWorkflow>(); //使用此方法访问日志记录器实例

        logger.LogInformation("Received order {orderId} for {quantity} {name} at ${totalCost}", orderId, order.Quantity, order.Name, order.TotalCost);
        
        //...
    }
}
