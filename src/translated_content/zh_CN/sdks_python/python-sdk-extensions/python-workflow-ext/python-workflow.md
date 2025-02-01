---
type: docs
title: "使用 Dapr Workflow Python SDK 入门"
linkTitle: "工作流"
weight: 30000
description: 如何使用 Dapr Python SDK 开始并运行工作流
---

{{% alert title="注意" color="primary" %}}
Dapr Workflow 目前处于 alpha 阶段。
{{% /alert %}}

我们来创建一个 Dapr 工作流，并通过控制台调用它。通过[提供的 hello world 工作流示例](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)，您将会：

- 运行一个[使用 `DaprClient` 的 Python 控制台应用程序](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py)
- 利用 Python 工作流 SDK 和 API 调用来启动、暂停、恢复、终止和清除工作流实例

此示例使用 `dapr init` 的默认配置在[本地模式](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted)下运行。

在 Python 示例项目中，`app.py` 文件包含应用程序的设置，其中包括：
- 工作流定义
- 工作流活动定义
- 工作流和工作流活动的注册

## 先决条件
- 已安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 已初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- 已安装 [Python 3.8+](https://www.python.org/downloads/)
- 已安装 [Dapr Python 包]({{< ref "python#installation" >}}) 和 [工作流扩展]({{< ref "python-workflow/_index.md" >}})
- 确保您使用的是最新的 proto 绑定（proto 绑定是用于定义服务接口的协议缓冲区文件）

## 设置环境

运行以下命令以安装使用 Dapr Python SDK 运行此工作流示例的必要依赖。

```bash
pip3 install -r demo_workflow/requirements.txt
```

克隆 [Python SDK 仓库]。

```bash
git clone https://github.com/dapr/python-sdk.git
```

从 Python SDK 根目录导航到 Dapr 工作流示例。

```bash
cd examples/demo_workflow
```

## 本地运行应用程序

要运行 Dapr 应用程序，您需要启动 Python 程序和一个 Dapr 辅助进程。在终端中运行：

```bash
dapr run --app-id orderapp --app-protocol grpc --dapr-grpc-port 50001 --resources-path components --placement-host-address localhost:50005 -- python3 app.py
```

> **注意：** 由于 Windows 中未定义 Python3.exe，您可能需要使用 `python app.py` 而不是 `python3 app.py`。

**预期输出**

```
== APP == ==========根据输入开始计数器增加==========

== APP == start_resp exampleInstanceID

== APP == 你好，计数器！
== APP == 新的计数器值是：1！

== APP == 你好，计数器！
== APP == 新的计数器值是：11！

== APP == 你好，计数器！
== APP == 你好，计数器！
== APP == 在暂停调用后从 hello_world_wf 获取响应：已暂停

== APP == 你好，计数器！
== APP == 在恢复调用后从 hello_world_wf 获取响应：运行中

== APP == 你好，计数器！
== APP == 新的计数器值是：111！

== APP == 你好，计数器！
== APP == 实例成功清除

== APP == start_resp exampleInstanceID

== APP == 你好，计数器！
== APP == 新的计数器值是：1112！

== APP == 你好，计数器！
== APP == 新的计数器值是：1122！

== APP == 在终止调用后从 hello_world_wf 获取响应：已终止
== APP == 在终止调用后从 child_wf 获取响应：已终止
== APP == 实例成功清除
```

## 发生了什么？

当您运行 `dapr run` 时，Dapr 客户端：
1. 注册了工作流 (`hello_world_wf`) 及其活动 (`hello_act`)
2. 启动了工作流引擎

```python
def main():
    with DaprClient() as d:
        host = settings.DAPR_RUNTIME_HOST
        port = settings.DAPR_GRPC_PORT
        workflowRuntime = WorkflowRuntime(host, port)
        workflowRuntime = WorkflowRuntime()
        workflowRuntime.register_workflow(hello_world_wf)
        workflowRuntime.register_activity(hello_act)
        workflowRuntime.start()

        print("==========根据输入开始计数器增加==========")
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")
```

然后 Dapr 暂停并恢复了工作流：

```python
       # 暂停
        d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"在暂停调用后从 {workflowName} 获取响应：{getResponse.runtime_status}")

        # 恢复
        d.resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"在恢复调用后从 {workflowName} 获取响应：{getResponse.runtime_status}")
```

一旦工作流恢复，Dapr 触发了一个工作流事件并打印了新的计数器值：

```python
        # 触发事件
        d.raise_workflow_event(instance_id=instanceId, workflow_component=workflowComponent,
                    event_name=eventName, event_data=eventData)
```

为了从您的状态存储中清除工作流状态，Dapr 清除了工作流：

```python
        # 清除
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("实例成功清除")
```

然后示例演示了通过以下步骤终止工作流：
- 使用与已清除工作流相同的 `instanceId` 启动一个新的工作流。
- 在关闭工作流之前终止并清除工作流。

```python
        # 启动另一个工作流
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")

        # 终止
        d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        sleep(1)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"在终止调用后从 {workflowName} 获取响应：{getResponse.runtime_status}")

        # 清除
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("实例成功清除")
```

## 下一步
- [了解更多关于 Dapr 工作流的信息]({{< ref workflow-overview.md >}})
- [工作流 API 参考]({{< ref workflow_api.md >}})
