---
type: docs
title: "工作流 API 参考"
linkTitle: "工作流 API"
description: "关于工作流 API 的详细文档"
weight: 300
---

Dapr 提供了与工作流交互的功能，并自带一个内置的 `dapr` 组件。

## 启动工作流请求

使用指定名称启动一个工作流实例，并可选地指定一个实例 ID。

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<workflowName>/start[?instanceID=<instanceID>]
```

请注意，工作流实例 ID 只能包含字母、数字、下划线和破折号。

### URL 参数

参数 | 描述
--------- | -----------
`workflowComponentName` | 对于 Dapr 工作流使用 `dapr`
`workflowName` | 标识工作流类型
`instanceID` | （可选）为特定工作流的每次运行创建的唯一值

### 请求内容

任何请求内容都将作为输入传递给工作流。Dapr API 会原样传递内容，不会尝试解释。

### HTTP 响应代码

代码 | 描述
---- | -----------
`202`  | 已接受
`400`  | 请求格式错误
`500`  | 请求格式正确，但 Dapr 代码或底层组件出错

### 响应内容

API 调用将返回如下的响应：

```json
{
    "instanceID": "12345678"
}
```

## 终止工作流请求

终止具有指定名称和实例 ID 的正在运行的工作流实例。

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceId>/terminate
```

{{% alert title="注意" color="primary" %}}
终止一个工作流将同时终止该实例创建的所有子工作流。

终止一个工作流不会影响由该实例启动的任何正在进行的活动。
{{% /alert %}}

### URL 参数

参数 | 描述
--------- | -----------
`workflowComponentName` | 对于 Dapr 工作流使用 `dapr`
`instanceId` | 为特定工作流的每次运行创建的唯一值

### HTTP 响应代码

代码 | 描述
---- | -----------
`202`  | 已接受
`400`  | 请求格式错误
`500`  | 请求格式正确，但 Dapr 代码或底层组件出错

### 响应内容

此 API 不返回任何内容。

## 触发事件请求

对于支持订阅外部事件的工作流组件，例如 Dapr 工作流引擎，可以使用以下“触发事件”API 将命名事件传递给特定的工作流实例。

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceID>/raiseEvent/<eventName>
```

{{% alert title="注意" color="primary" %}}
订阅事件的具体机制取决于您使用的工作流组件。Dapr 工作流有一种订阅外部事件的方式，但其他工作流组件可能有不同的方式。
{{% /alert %}}

### URL 参数

参数 | 描述
--------- | -----------
`workflowComponentName` | 对于 Dapr 工作流使用 `dapr`
`instanceId` | 为特定工作流的每次运行创建的唯一值
`eventName` | 要触发的事件名称

### HTTP 响应代码

代码 | 描述
---- | -----------
`202`  | 已接受
`400`  | 请求格式错误
`500`  | 请求格式正确，但 Dapr 代码或底层组件出错

### 响应内容

无。

## 暂停工作流请求

暂停一个正在运行的工作流实例。

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceId>/pause
```

### URL 参数

参数 | 描述
--------- | -----------
`workflowComponentName` | 对于 Dapr 工作流使用 `dapr`
`instanceId` | 为特定工作流的每次运行创建的唯一值

### HTTP 响应代码

代码 | 描述
---- | -----------
`202`  | 已接受
`400`  | 请求格式错误
`500`  | Dapr 代码或底层组件出错

### 响应内容

无。

## 恢复工作流请求

恢复一个已暂停的工作流实例。

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceId>/resume
```

### URL 参数

参数 | 描述
--------- | -----------
`workflowComponentName` | 对于 Dapr 工作流使用 `dapr`
`instanceId` | 为特定工作流的每次运行创建的唯一值

### HTTP 响应代码

代码 | 描述
---- | -----------
`202`  | 已接受
`400`  | 请求格式错误
`500`  | Dapr 代码或底层组件出错

### 响应内容

无。

## 清除工作流请求

使用工作流的实例 ID 从您的状态存储中清除工作流状态。

```
POST http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceId>/purge
```

{{% alert title="注意" color="primary" %}}
只有状态为 `COMPLETED`、`FAILED` 或 `TERMINATED` 的工作流可以被清除。
{{% /alert %}}

### URL 参数

参数 | 描述
--------- | -----------
`workflowComponentName` | 对于 Dapr 工作流使用 `dapr`
`instanceId` | 为特定工作流的每次运行创建的唯一值

### HTTP 响应代码

代码 | 描述
---- | -----------
`202`  | 已接受
`400`  | 请求格式错误
`500`  | Dapr 代码或底层组件出错

### 响应内容

无。

## 获取工作流请求

获取给定工作流实例的信息。

```
GET http://localhost:3500/v1.0/workflows/<workflowComponentName>/<instanceId>
```

### URL 参数

参数 | 描述
--------- | -----------
`workflowComponentName` | 对于 Dapr 工作流使用 `dapr`
`instanceId` | 为特定工作流的每次运行创建的唯一值

### HTTP 响应代码

代码 | 描述
---- | -----------
`200`  | 正常
`400`  | 请求格式错误
`500`  | 请求格式正确，但 Dapr 代码或底层组件出错

### 响应内容

API 调用将返回如下的 JSON 响应：

```json
{
  "createdAt": "2023-01-12T21:31:13Z",
  "instanceID": "12345678",
  "lastUpdatedAt": "2023-01-12T21:31:13Z",
  "properties": {
    "property1": "value1",
    "property2": "value2",
  },
  "runtimeStatus": "RUNNING",
 }
```

参数 | 描述
--------- | -----------
`runtimeStatus` | 工作流实例的状态。值包括：`"RUNNING"`、`"COMPLETED"`、`"CONTINUED_AS_NEW"`、`"FAILED"`、`"CANCELED"`、`"TERMINATED"`、`"PENDING"`、`"SUSPENDED"`  

## 组件格式

一个 Dapr `workflow.yaml` 组件文件具有以下结构：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: workflow.<TYPE>
  version: v1.0-alpha1
  metadata:
  - name: <NAME>
    value: <VALUE>
 ```

| 设置 | 描述 |
| ------- | ----------- |
| `metadata.name` | 工作流组件的名称。 |
| `spec/metadata` | 由工作流组件指定的附加元数据参数 |

然而，Dapr 附带一个内置的基于 Dapr actor 的 `dapr` 工作流组件。使用内置的 Dapr 工作流组件不需要组件文件。

## 下一步

- [工作流 API 概述]({{< ref workflow-overview.md >}})
- [将用户路由到工作流模式]({{< ref workflow-patterns.md >}})
