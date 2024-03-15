---
type: docs
title: 开始使用 Dapr Workflow Python SDK
linkTitle: Workflow
weight: 30000
description: 如何使用 Dapr Python SDK 启动和运行工作流
---

{{% alert title="注意" color="primary" %}}
Dapr工作流目前处于alpha阶段。
{{% /alert %}}

让我们创建一个 Dapr 工作流，并使用控制台调用它。 通过[提供的hello world工作流示例](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)，您将：

- 运行一个[使用`DaprClient`的Python控制台应用程序](https://github.com/dapr/python-sdk/blob/master/examples/demo_workflow/app.py)
- 利用Python工作流SDK和API调用来启动、暂停、恢复、终止和清除工作流实例

这个示例使用[dapr init](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted)中的默认配置，在[自托管模式](https://github.com/dapr/cli#install-dapr-on-your-local-machine-self-hosted)下。

在Python示例项目中，`app.py`文件包含了应用程序的设置，包括：

- 工作流定义
- 工作流活动定义
- 工作流和工作流活动的注册

## 前期准备

- 已安装[Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [已安装Python 3.8+](https://www.python.org/downloads/)。
- [Dapr Python包]({{< ref "python#installation" >}})和[工作流扩展]({{< ref "python-workflow/_index.md" >}})已安装
- 验证您是否正在使用最新的proto绑定

## 设置环境

运行以下命令使用 Dapr Python SDK 安装运行此工作流示例所需的依赖项。

```bash
pip3 install -r demo_workflow/requirements.txt
```

克隆[Python SDK存储库]。

```bash
git clone https://github.com/dapr/python-sdk.git
```

从 Python SDK 根目录中，导航到 Dapr Workflow 示例。

```bash
cd examples/demo_workflow
```

## 在本地运行应用程序

要运行 Dapr 应用程序，您需要启动 Python 程序和 Dapr sidecar。 在终端中运行：

```bash
dapr run --app-id orderapp --app-protocol grpc --dapr-grpc-port 50001 --resources-path components --placement-host-address localhost:50005 -- python3 app.py
```

> \*\*注意：\*\*由于Python3.exe在Windows中未定义，您可能需要使用`python app.py`替代`python3 app.py`。

**预期输出**

```
== APP == ==========Start Counter Increase as per Input:==========

== APP == start_resp exampleInstanceID

== APP == Hi Counter!
== APP == New counter value is: 1!

== APP == Hi Counter!
== APP == New counter value is: 11!

== APP == Hi Counter!
== APP == Hi Counter!
== APP == Get response from hello_world_wf after pause call: Suspended

== APP == Hi Counter!
== APP == Get response from hello_world_wf after resume call: Running

== APP == Hi Counter!
== APP == New counter value is: 111!

== APP == Hi Counter!
== APP == Instance Successfully Purged

== APP == start_resp exampleInstanceID

== APP == Hi Counter!
== APP == New counter value is: 1112!

== APP == Hi Counter!
== APP == New counter value is: 1122!

== APP == Get response from hello_world_wf after terminate call: Terminated
== APP == Get response from child_wf after terminate call: Terminated
== APP == Instance Successfully Purged
```

## 发生了什么？

当你运行 `dapr run`，Dapr 客户端：

1. 注册了工作流（`hello_world_wf`）及其活动（`hello_act`）
2. 启动工作流引擎

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

        print("==========Start Counter Increase as per Input:==========")
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")
```

Dapr 然后暂停并恢复工作流：

```python
       # Pause
        d.pause_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after pause call: {getResponse.runtime_status}")

        # Resume
        d.resume_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after resume call: {getResponse.runtime_status}")
```

一旦工作流恢复，Dapr会触发一个工作流事件并打印新的计数器值：

```python
        # Raise event
        d.raise_workflow_event(instance_id=instanceId, workflow_component=workflowComponent,
                    event_name=eventName, event_data=eventData)
```

为了清除状态存储中的工作流状态，Dapr已经清除了工作流：

```python
        # Purge
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("Instance Successfully Purged")
```

然后示范了通过以下方式终止工作流程：

- 使用与清除的工作流相同的`instanceId`启动新的工作流程。
- 在关闭工作流之前终止工作流并清除。

```python
        # Kick off another workflow
        start_resp = d.start_workflow(instance_id=instanceId, workflow_component=workflowComponent,
                        workflow_name=workflowName, input=inputData, workflow_options=workflowOptions)
        print(f"start_resp {start_resp.instance_id}")

        # Terminate
        d.terminate_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        sleep(1)
        getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        print(f"Get response from {workflowName} after terminate call: {getResponse.runtime_status}")

        # Purge
        d.purge_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        try:
            getResponse = d.get_workflow(instance_id=instanceId, workflow_component=workflowComponent)
        except DaprInternalError as err:
            if nonExistentIDError in err._message:
                print("Instance Successfully Purged")
```

## 下一步

- [了解更多关于Dapr工作流]({{< ref workflow-overview.md >}})
- [Workflow API 参考文档]({{< ref workflow_api.md >}})
