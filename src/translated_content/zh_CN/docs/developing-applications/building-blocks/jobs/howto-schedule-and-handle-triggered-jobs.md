---
type: docs
title: "操作指南：调度和处理触发的作业"
linkTitle: "操作指南：调度和处理触发的作业"
weight: 2000
description: "学习如何使用作业API来调度和处理触发的作业"
---

现在您已经了解了[作业构建块]({{< ref jobs-overview.md >}})提供的功能，让我们来看一个如何使用API的示例。下面的代码示例描述了一个为数据库备份应用程序调度作业并在触发时处理它们的应用程序，也就是作业因到达其到期时间而被返回到应用程序的时间。

<!-- 
如果可能，包含一个图表或图像。
-->

## 启动调度器服务

当您[在本地托管模式或Kubernetes上运行`dapr init`]({{< ref install-dapr-selfhost.md >}})时，Dapr调度器服务会启动。

## 设置作业API

在您的代码中，配置并调度应用程序内的作业。

{{< tabs ".NET" "Go" >}}

{{% codetab %}}

<!-- .NET -->

以下.NET SDK代码示例调度名为`prod-db-backup`的作业。作业数据包含有关您将定期备份的数据库的信息。在本示例中，您将：
- 定义在示例其余部分中使用的类型
- 在应用程序启动期间注册一个端点，以处理服务上的所有作业触发调用
- 向Dapr注册作业

在以下示例中，您将创建记录，序列化并与作业一起注册，以便在将来作业被触发时可以使用这些信息：
- 备份任务的名称（`db-backup`）
- 备份任务的`Metadata`，包括：
  - 数据库名称（`DBName`）
  - 数据库位置（`BackupLocation`）

创建一个ASP.NET Core项目，并从NuGet添加最新版本的`Dapr.Jobs`。

> **注意：** 虽然您的项目不严格需要使用`Microsoft.NET.Sdk.Web` SDK来创建作业，但在撰写本文档时，只有调度作业的服务会接收到其触发调用。由于这些调用期望有一个可以处理作业触发的端点，并且需要`Microsoft.NET.Sdk.Web` SDK，因此建议您为此目的使用ASP.NET Core项目。

首先定义类型以持久化我们的备份作业数据，并将我们自己的JSON属性名称属性应用于属性，以便它们与其他语言示例保持一致。

```cs
//定义我们将用来表示作业数据的类型
internal sealed record BackupJobData([property: JsonPropertyName("task")] string Task, [property: JsonPropertyName("metadata")] BackupMetadata Metadata);
internal sealed record BackupMetadata([property: JsonPropertyName("DBName")]string DatabaseName, [property: JsonPropertyName("BackupLocation")] string BackupLocation);
```

接下来，作为应用程序设置的一部分，设置一个处理程序，该处理程序将在作业在您的应用程序上被触发时调用。此处理程序负责根据提供的作业名称识别应如何处理作业。

这通过在ASP.NET Core中注册一个处理程序来实现，路径为`/job/<job-name>`，其中`<job-name>`是参数化的，并传递给此处理程序委托，以满足Dapr期望有一个端点可用于处理触发的命名作业。

在您的`Program.cs`文件中填入以下内容：

```cs
using System.Text;
using System.Text.Json;
using Dapr.Jobs;
using Dapr.Jobs.Extensions;
using Dapr.Jobs.Models;
using Dapr.Jobs.Models.Responses;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprJobsClient();
var app = builder.Build();

//注册一个端点以接收和处理触发的作业
var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(5));
app.MapDaprScheduledJobHandler((string jobName, DaprJobDetails jobDetails, ILogger logger, CancellationToken cancellationToken) => {
  logger?.LogInformation("Received trigger invocation for job '{jobName}'", jobName);
  switch (jobName)
  {
    case "prod-db-backup":
      // 反序列化作业负载元数据
      var jobData = JsonSerializer.Deserialize<BackupJobData>(jobDetails.Payload);
      
      // 处理备份操作 - 我们假设这在您的代码中已实现
      await BackupDatabaseAsync(jobData, cancellationToken);
      break;
  }
}, cancellationTokenSource.Token);

await app.RunAsync();
```

最后，作业本身需要在Dapr中注册，以便可以在以后触发。您可以通过将`DaprJobsClient`注入到类中并作为应用程序的入站操作的一部分执行此操作，但为了本示例的目的，它将放在您上面开始的`Program.cs`文件的底部。因为您将使用依赖注入注册的`DaprJobsClient`，所以首先创建一个范围以便可以访问它。

```cs
//创建一个范围以便可以访问注册的DaprJobsClient
await using scope = app.Services.CreateAsyncScope();
var daprJobsClient = scope.ServiceProvider.GetRequiredService<DaprJobsClient>();

//创建我们希望与未来作业触发一起呈现的负载
var jobData = new BackupJobData("db-backup", new BackupMetadata("my-prod-db", "/backup-dir")); 

//将我们的负载序列化为UTF-8字节
var serializedJobData = JsonSerializer.SerializeToUtf8Bytes(jobData);

//调度我们的备份作业每分钟运行一次，但只重复10次
await daprJobsClient.ScheduleJobAsync("prod-db-backup", DaprJobSchedule.FromDuration(TimeSpan.FromMinutes(1)),
    serializedJobData, repeats: 10);
```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

以下Go SDK代码示例调度名为`prod-db-backup`的作业。作业数据存储在备份数据库（`"my-prod-db"`）中，并使用`ScheduleJobAlpha1`进行调度。这提供了`jobData`，其中包括：
- 备份`Task`名称
- 备份任务的`Metadata`，包括：
  - 数据库名称（`DBName`）
  - 数据库位置（`BackupLocation`）

```go
package main

import (
    //...

	daprc "github.com/dapr/go-sdk/client"
	"github.com/dapr/go-sdk/examples/dist-scheduler/api"
	"github.com/dapr/go-sdk/service/common"
	daprs "github.com/dapr/go-sdk/service/grpc"
)

func main() {
    // 初始化服务器
	server, err := daprs.NewService(":50070")
    // ...

	if err = server.AddJobEventHandler("prod-db-backup", prodDBBackupHandler); err != nil {
		log.Fatalf("failed to register job event handler: %v", err)
	}

	log.Println("starting server")
	go func() {
		if err = server.Start(); err != nil {
			log.Fatalf("failed to start server: %v", err)
		}
	}()
    // ...

    // 设置备份位置
	jobData, err := json.Marshal(&api.DBBackup{
		Task: "db-backup",
		Metadata: api.Metadata{
			DBName:         "my-prod-db",
			BackupLocation: "/backup-dir",
		},
	},
	)
	// ...
}
```

作业是通过设置`Schedule`和所需的`Repeats`数量来调度的。这些设置决定了作业应被触发并发送回应用程序的最大次数。

在此示例中，在触发时间，即根据`Schedule`的`@every 1s`，此作业被触发并最多发送回应用程序`Repeats`（`10`）次。

```go	
    // ...
    // 设置作业
	job := daprc.Job{
		Name:     "prod-db-backup",
		Schedule: "@every 1s",
		Repeats:  10,
		Data: &anypb.Any{
			Value: jobData,
		},
	}
```

在触发时间，调用`prodDBBackupHandler`函数，在触发时间执行此作业的所需业务逻辑。例如：

#### HTTP

当您使用Dapr的作业API创建作业时，Dapr会自动假定在`/job/<job-name>`有一个可用的端点。例如，如果您调度一个名为`test`的作业，Dapr期望您的应用程序在`/job/test`监听作业事件。确保您的应用程序为此端点设置了一个处理程序，以便在作业被触发时处理它。例如：

*注意：以下示例是用Go编写的，但适用于任何编程语言。*

```go

func main() {
    ...
    http.HandleFunc("/job/", handleJob)
	http.HandleFunc("/job/<job-name>", specificJob)
    ...
}

func specificJob(w http.ResponseWriter, r *http.Request) {
    // 处理特定触发的作业
}

func handleJob(w http.ResponseWriter, r *http.Request) {
    // 处理触发的作业
}
```

#### gRPC

当作业到达其计划的触发时间时，触发的作业通过以下回调函数发送回应用程序：

*注意：以下示例是用Go编写的，但适用于任何支持gRPC的编程语言。*

```go
import rtv1 "github.com/dapr/dapr/pkg/proto/runtime/v1"
...
func (s *JobService) OnJobEventAlpha1(ctx context.Context, in *rtv1.JobEventRequest) (*rtv1.JobEventResponse, error) {
    // 处理触发的作业
}
```

此函数在您的gRPC服务器上下文中处理触发的作业。当您设置服务器时，确保注册回调服务器，当作业被触发时将调用此函数：

```go
...
js := &JobService{}
rtv1.RegisterAppCallbackAlphaServer(server, js)
```

在此设置中，您可以完全控制如何接收和处理触发的作业，因为它们直接通过此gRPC方法路由。

#### SDKs

对于SDK用户，处理触发的作业更简单。当作业被触发时，Dapr会自动将作业路由到您在服务器初始化期间设置的事件处理程序。例如，在Go中，您可以这样注册事件处理程序：

```go
...
if err = server.AddJobEventHandler("prod-db-backup", prodDBBackupHandler); err != nil {
    log.Fatalf("failed to register job event handler: %v", err)
}
```

Dapr负责底层路由。当作业被触发时，您的`prodDBBackupHandler`函数将被调用，并带有触发的作业数据。以下是处理触发作业的示例：

```go
// ...

// 在作业触发时调用此函数
func prodDBBackupHandler(ctx context.Context, job *common.JobEvent) error {
	var jobData common.Job
	if err := json.Unmarshal(job.Data, &jobData); err != nil {
		// ...
	}

	var jobPayload api.DBBackup
	if err := json.Unmarshal(job.Data, &jobPayload); err != nil {
		// ...
	}
	fmt.Printf("job %d received:\n type: %v \n typeurl: %v\n value: %v\n extracted payload: %v\n", jobCount, job.JobType, jobData.TypeURL, jobData.Value, jobPayload)
	jobCount++
	return nil
}
```

{{% /codetab %}}

{{< /tabs >}}

## 运行Dapr sidecar

一旦您在应用程序中设置了作业API，在终端窗口中使用以下命令运行Dapr sidecar。

{{< tabs "Go" >}}

{{% codetab %}}

```bash
dapr run --app-id=distributed-scheduler \
                --metrics-port=9091 \
                --dapr-grpc-port 50001 \
                --app-port 50070 \
                --app-protocol grpc \
                --log-level debug \
                go run ./main.go
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

- [了解更多关于调度器控制平面服务的信息]({{< ref "concepts/dapr-services/scheduler.md" >}})
- [作业API参考]({{< ref jobs_api.md >}})
