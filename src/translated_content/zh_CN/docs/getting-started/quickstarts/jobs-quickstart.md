---
type: docs
title: "快速入门：作业"
linkTitle: 作业
weight: 80
description: 开始使用 Dapr 作业构建块
---

{{% alert title="Alpha" color="warning" %}}
作业构建块目前处于 **alpha** 阶段。
{{% /alert %}}

[Dapr 作业构建块]({{< ref jobs-overview.md >}}) 允许您在特定时间或间隔调度和运行作业。在本快速入门中，您将学习如何使用 Dapr 的作业 API 来调度、获取和删除作业。

您可以通过以下两种方式来体验此作业快速入门：

- [同时运行所有示例应用程序]({{< ref "#run-using-multi-app-run" >}})，或
- [逐个运行应用程序]({{< ref "#run-one-job-application-at-a-time" >}})

## 同时运行多个应用

在开始之前，请选择您偏好的 Dapr SDK 语言。目前，您可以使用 Go SDK 来试验作业 API。

{{< tabs Go >}}

 <!-- Go -->
{{% codetab %}}

本快速入门包含两个应用程序：

- **`job-scheduler.go`：** 负责调度、检索和删除作业。
- **`job-service.go`：** 负责处理已调度的作业。

### 步骤 1：准备工作

您需要以下工具：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [最新版本的 Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 2：设置环境

克隆 [快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/jobs/go/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从仓库根目录导航到作业目录：

```bash
cd jobs/go/sdk
```

### 步骤 3：调度作业

运行应用程序并调度作业：

```bash
dapr run -f .
```

**预期输出**

```text
== APP - job-service == dapr 客户端初始化中：127.0.0.1:6281
== APP - job-service == 已注册作业处理程序：R2-D2
== APP - job-service == 已注册作业处理程序：C-3PO
== APP - job-service == 已注册作业处理程序：BB-8
== APP - job-service == 在端口启动服务器：6200
== APP - job-service == 作业已调度：R2-D2
== APP - job-service == 作业已调度：C-3PO
== APP - job-service == 2024/07/17 18:09:59 作业：{name:"C-3PO"  due_time:"10s"  data:{value:"{\"droid\":\"C-3PO\",\"Task\":\"Memory Wipe\"}"}}
== APP - job-scheduler == 获取作业响应：{"droid":"C-3PO","Task":"Memory Wipe"}
== APP - job-service == 作业已调度：BB-8
== APP - job-service == 2024/07/17 18:09:59 作业：{name:"BB-8"  due_time:"15s"  data:{value:"{\"droid\":\"BB-8\",\"Task\":\"Internal Gyroscope Check\"}"}}
== APP - job-scheduler == 获取作业响应：{"droid":"BB-8","Task":"Internal Gyroscope Check"}
== APP - job-scheduler == 已删除作业：BB-8
```

5 秒后，终端输出应显示 `R2-D2` 作业正在处理：

```text
== APP - job-service == 启动机器人：R2-D2
== APP - job-service == 执行维护作业：Oil Change
```

10 秒后，终端输出应显示 `C3-PO` 作业正在处理：

```text
== APP - job-service == 启动机器人：C-3PO
== APP - job-service == 执行维护作业：Memory Wipe
```

完成后，您可以使用以下命令停止并清理应用程序进程。

```bash
dapr stop -f .
```

### 发生了什么？

在 Dapr 安装期间运行 `dapr init` 时：

- `dapr_scheduler` 控制平面与其他 Dapr 服务一起启动。
- [在 `.dapr/components` 目录中生成了 `dapr.yaml` 多应用运行模板文件]({{< ref "#dapryaml-multi-app-run-template-file" >}})。

在此快速入门中运行 `dapr run -f .` 启动了 `job-scheduler` 和 `job-service`。在终端输出中，您可以看到以下作业正在调度、检索和删除。

- `R2-D2` 作业正在调度。
- `C-3PO` 作业正在调度。
- `C-3PO` 作业正在检索。
- `BB-8` 作业正在调度。
- `BB-8` 作业正在检索。
- `BB-8` 作业正在删除。
- `R2-D2` 作业在 5 秒后执行。
- `R2-D2` 作业在 10 秒后执行。

#### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行 [多应用运行模板文件]({{< ref multi-app-dapr-run >}}) 启动项目中的所有应用程序。在此快速入门中，`dapr.yaml` 文件包含以下内容：

```yml
version: 1
apps:
  - appDirPath: ./job-service/
    appID: job-service
    appPort: 6200
    daprGRPCPort: 6281
    appProtocol: grpc
    command: ["go", "run", "."]
  - appDirPath: ./job-scheduler/
    appID: job-scheduler
    appPort: 6300
    command: ["go", "run", "."]
```

#### `job-service` 应用

`job-service` 应用程序创建服务调用处理程序以管理作业的生命周期（`scheduleJob`、`getJob` 和 `deleteJob`）。

```go
if err := server.AddServiceInvocationHandler("scheduleJob", scheduleJob); err != nil {
	log.Fatalf("error adding invocation handler: %v", err)
}

if err := server.AddServiceInvocationHandler("getJob", getJob); err != nil {
	log.Fatalf("error adding invocation handler: %v", err)
}

if err := server.AddServiceInvocationHandler("deleteJob", deleteJob); err != nil {
	log.Fatalf("error adding invocation handler: %v", err)
}
```

接下来，为所有机器人注册作业事件处理程序：

```go
for _, jobName := range jobNames {
	if err := server.AddJobEventHandler(jobName, handleJob); err != nil {
		log.Fatalf("failed to register job event handler: %v", err)
	}
	fmt.Println("Registered job handler for: ", jobName)
}

fmt.Println("Starting server on port: " + appPort)
if err = server.Start(); err != nil {
	log.Fatalf("failed to start server: %v", err)
}
```

然后，`job-service` 调用处理调度、获取、删除和处理作业事件的函数。

```go
// 处理调度 DroidJob 的处理程序
func scheduleJob(ctx context.Context, in *common.InvocationEvent) (out *common.Content, err error) {

	if in == nil {
		err = errors.New("no invocation parameter")
		return
	}

	droidJob := DroidJob{}
	err = json.Unmarshal(in.Data, &droidJob)
	if err != nil {
		fmt.Println("failed to unmarshal job: ", err)
		return nil, err
	}

	jobData := JobData{
		Droid: droidJob.Name,
		Task:  droidJob.Job,
	}

	content, err := json.Marshal(jobData)
	if err != nil {
		fmt.Printf("Error marshalling job content")
		return nil, err
	}

	// 调度作业
	job := daprc.Job{
		Name:    droidJob.Name,
		DueTime: droidJob.DueTime,
		Data: &anypb.Any{
			Value: content,
		},
	}

	err = app.daprClient.ScheduleJobAlpha1(ctx, &job)
	if err != nil {
		fmt.Println("failed to schedule job. err: ", err)
		return nil, err
	}

	fmt.Println("Job scheduled: ", droidJob.Name)

	out = &common.Content{
		Data:        in.Data,
		ContentType: in.ContentType,
		DataTypeURL: in.DataTypeURL,
	}

	return out, err

}

// 处理按名称获取作业的处理程序
func getJob(ctx context.Context, in *common.InvocationEvent) (out *common.Content, err error) {

	if in == nil {
		err = errors.New("no invocation parameter")
		return nil, err
	}

	job, err := app.daprClient.GetJobAlpha1(ctx, string(in.Data))
	if err != nil {
		fmt.Println("failed to get job. err: ", err)
	}

	out = &common.Content{
		Data:        job.Data.Value,
		ContentType: in.ContentType,
		DataTypeURL: in.DataTypeURL,
	}

	return out, err
}

// 处理按名称删除作业的处理程序
func deleteJob(ctx context.Context, in *common.InvocationEvent) (out *common.Content, err error) {
	if in == nil {
		err = errors.New("no invocation parameter")
		return nil, err
	}

	err = app.daprClient.DeleteJobAlpha1(ctx, string(in.Data))
	if err != nil {
		fmt.Println("failed to delete job. err: ", err)
	}

	out = &common.Content{
		Data:        in.Data,
		ContentType: in.ContentType,
		DataTypeURL: in.DataTypeURL,
	}

	return out, err
}

// 处理作业事件的处理程序
func handleJob(ctx context.Context, job *common.JobEvent) error {
    var jobData common.Job
    if err := json.Unmarshal(job.Data, &jobData); err != nil {
        return fmt.Errorf("failed to unmarshal job: %v", err)
    }

    var jobPayload JobData
    if err := json.Unmarshal(job.Data, &jobPayload); err != nil {
        return fmt.Errorf("failed to unmarshal payload: %v", err)
    }

    fmt.Println("Starting droid:", jobPayload.Droid)
    fmt.Println("Executing maintenance job:", jobPayload.Task)

    return nil
}
```

#### `job-scheduler` 应用

在 `job-scheduler` 应用程序中，首先将 R2D2、C3PO 和 BB8 作业定义为 `[]DroidJob`：

```go
droidJobs := []DroidJob{
	{Name: "R2-D2", Job: "Oil Change", DueTime: "5s"},
	{Name: "C-3PO", Job: "Memory Wipe", DueTime: "15s"},
	{Name: "BB-8", Job: "Internal Gyroscope Check", DueTime: "30s"},
}
```

然后使用作业 API 调度、检索和删除作业。正如您从终端输出中看到的，首先调度 R2D2 作业：

```go
// 调度 R2D2 作业
err = schedule(droidJobs[0])
if err != nil {
	log.Fatalln("Error scheduling job: ", err)
}
```

然后调度 C3PO 作业，并返回作业数据：

```go
// 调度 C-3PO 作业
err = schedule(droidJobs[1])
if err != nil {
	log.Fatalln("Error scheduling job: ", err)
}

// 获取 C-3PO 作业
resp, err := get(droidJobs[1])
if err != nil {
	log.Fatalln("Error retrieving job: ", err)
}
fmt.Println("Get job response: ", resp)
```

然后调度、检索和删除 BB8 作业：

```go
// 调度 BB-8 作业
err = schedule(droidJobs[2])
if err != nil {
	log.Fatalln("Error scheduling job: ", err)
}

// 获取 BB-8 作业
resp, err = get(droidJobs[2])
if err != nil {
	log.Fatalln("Error retrieving job: ", err)
}
fmt.Println("Get job response: ", resp)

// 删除 BB-8 作业
err = delete(droidJobs[2])
if err != nil {
	log.Fatalln("Error deleting job: ", err)
}
fmt.Println("Job deleted: ", droidJobs[2].Name)
```

`job-scheduler.go` 还定义了 `schedule`、`get` 和 `delete` 函数，从 `job-service.go` 调用。

```go
// 通过从 job-service 调用 grpc 服务并传递 DroidJob 作为参数来调度作业
func schedule(droidJob DroidJob) error {
	jobData, err := json.Marshal(droidJob)
	if err != nil {
		fmt.Println("Error marshalling job content")
		return err
	}

	content := &daprc.DataContent{
		ContentType: "application/json",
		Data:        []byte(jobData),
	}

	// 调度作业
	_, err = app.daprClient.InvokeMethodWithContent(context.Background(), "job-service", "scheduleJob", "POST", content)
	if err != nil {
		fmt.Println("Error invoking method: ", err)
		return err
	}

	return nil
}

// 通过从 job-service 调用 grpc 服务并传递作业名称作为参数来获取作业
func get(droidJob DroidJob) (string, error) {
	content := &daprc.DataContent{
		ContentType: "text/plain",
		Data:        []byte(droidJob.Name),
	}

	// 获取作业
	resp, err := app.daprClient.InvokeMethodWithContent(context.Background(), "job-service", "getJob", "GET", content)
	if err != nil {
		fmt.Println("Error invoking method: ", err)
		return "", err
	}

	return string(resp), nil
}

// 通过从 job-service 调用 grpc 服务并传递作业名称作为参数来删除作业
func delete(droidJob DroidJob) error {
	content := &daprc.DataContent{
		ContentType: "text/plain",
		Data:        []byte(droidJob.Name),
	}

	_, err := app.daprClient.InvokeMethodWithContent(context.Background(), "job-service", "deleteJob", "DELETE", content)
	if err != nil {
		fmt.Println("Error invoking method: ", err)
		return err
	}

	return nil
}
```

{{% /codetab %}}

{{< /tabs >}}

## 逐个运行作业应用程序

{{< tabs Go >}}

 <!-- Go -->
{{% codetab %}}

本快速入门包含两个应用程序：

- **`job-scheduler.go`：** 负责调度、检索和删除作业。
- **`job-service.go`：** 负责处理已调度的作业。

### 步骤 1：准备工作

您需要以下工具：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [最新版本的 Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 2：设置环境

克隆 [快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/jobs)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从仓库根目录导航到作业目录：

```bash
cd jobs/go/sdk
```

### 步骤 3：调度作业

在终端中运行 `job-service` 应用：

```bash
dapr run --app-id job-service --app-port 6200 --dapr-grpc-port 6281 --app-protocol grpc -- go run .
```

**预期输出**

```text
== APP == dapr 客户端初始化中：127.0.0.1:6281
== APP == 已注册作业处理程序：R2-D2
== APP == 已注册作业处理程序：C-3PO
== APP == 已注册作业处理程序：BB-8
== APP == 在端口启动服务器：6200
```

在新终端窗口中运行 `job-scheduler` 应用：

```bash
dapr run --app-id job-scheduler --app-port 6300 -- go run .
```

**预期输出**

```text
== APP == dapr 客户端初始化中：
== APP == 获取作业响应：{"droid":"C-3PO","Task":"Memory Wipe"}
== APP == 获取作业响应：{"droid":"BB-8","Task":"Internal Gyroscope Check"}
== APP == 作业已删除：BB-8
```

返回到 `job-service` 应用的终端窗口。输出应为：

```text
== APP == 作业已调度：R2-D2
== APP == 作业已调度：C-3PO
== APP == 2024/07/17 18:25:36 作业：{name:"C-3PO"  due_time:"10s"  data:{value:"{\"droid\":\"C-3PO\",\"Task\":\"Memory Wipe\"}"}}
== APP == 作业已调度：BB-8
== APP == 2024/07/17 18:25:36 作业：{name:"BB-8"  due_time:"15s"  data:{value:"{\"droid\":\"BB-8\",\"Task\":\"Internal Gyroscope Check\"}"}}
== APP == 启动机器人：R2-D2
== APP == 执行维护作业：Oil Change
== APP == 启动机器人：C-3PO
== APP == 执行维护作业：Memory Wipe
```

解读当您运行 `dapr run` 时 [`job-service`]({{< ref "#job-service-app" >}}) 和 [`job-scheduler`]({{< ref "#job-scheduler-app" >}}) 应用程序中发生的事情。

{{% /codetab %}}

{{< /tabs >}}

## 观看演示

观看使用 Go HTTP 示例的作业 API 演示，录制于 [Dapr 社区电话 #107](https://www.youtube.com/live/WHGOc7Ec_YQ?si=JlOlcJKkhRuhf5R1&t=849)。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/WHGOc7Ec_YQ?si=JlOlcJKkhRuhf5R1&amp;start=849" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 告诉我们您的想法！

我们正在不断努力改进我们的快速入门示例，并重视您的反馈。您觉得这个快速入门有帮助吗？您有改进建议吗？

加入我们的 [discord 频道](https://discord.com/channels/778680217417809931/953427615916638238) 参与讨论。

## 下一步

- 本快速入门的 HTTP 示例：
  - [Go](https://github.com/dapr/quickstarts/tree/master/jobs/go/http)
- 了解更多关于 [作业构建块]({{< ref jobs-overview.md >}})
- 了解更多关于 [调度器控制平面]({{< ref scheduler.md >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
`