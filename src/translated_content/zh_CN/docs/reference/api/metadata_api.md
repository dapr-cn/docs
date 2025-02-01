---
type: docs
title: "元数据 API 参考"
linkTitle: "元数据 API"
description: "关于元数据 API 的详细文档"
weight: 1100
---

Dapr 提供了一个元数据 API，可以返回有关 sidecar 的信息，从而支持运行时发现。元数据端点返回以下信息：
- 运行时版本
- 已加载的资源列表（包括 `components`、`subscriptions` 和 `HttpEndpoints`）
- 注册的 actor 类型
- 启用的功能
- 应用程序连接的详细信息
- 自定义的临时属性信息。

## 元数据 API

### 组件
每个加载的组件提供其名称、类型和版本，以及支持的功能信息。这些功能适用于 [state store]({{< ref supported-state-stores.md >}}) 和 [binding]({{< ref supported-bindings.md >}}) 组件类型。下表显示了给定版本的组件类型和能力列表。此列表可能会在将来扩展，仅代表当前已加载组件的能力。

组件类型 | 能力
---------| ----
State Store | ETAG, TRANSACTION, ACTOR, QUERY_API
Binding     | INPUT_BINDING, OUTPUT_BINDING

### HTTPEndpoints
每个加载的 `HttpEndpoint` 提供一个名称，以便轻松识别与运行时关联的 Dapr 资源。

### 订阅
元数据 API 返回应用程序已向 Dapr 运行时注册的 pub/sub 订阅列表。这包括 pub/sub 名称、主题、路由、死信主题、订阅类型和与订阅相关的元数据。

### 启用的功能
通过配置规范启用的功能列表（包括构建时的覆盖）。

### 应用程序连接详细信息
元数据 API 返回与 Dapr 连接到应用程序相关的信息。这包括应用程序端口、协议、主机、最大并发性以及健康检查的详细信息。

### 属性

元数据 API 允许您以键值对的格式存储附加的属性信息。这些信息是临时的内存信息，如果 sidecar 重新加载则不会持久化。此信息应在 sidecar 创建时添加（例如，在应用程序启动后）。

## 获取 Dapr sidecar 信息

从元数据端点获取 Dapr sidecar 信息。

### 用例：
获取元数据 API 可用于发现已加载组件支持的不同能力。它可以帮助操作员确定要为所需能力提供哪些组件。

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/metadata
```

### URL 参数

参数     | 描述
---------| ----
daprPort | Dapr 端口。

### HTTP 响应代码

代码 | 描述
---- | ----
200  | 返回元数据信息
500  | Dapr 无法返回元数据信息

### HTTP 响应体

**元数据 API 响应对象**

名称                   | 类型                                                                  | 描述
----                   | ----                                                                  | ----
id                     | string                                                                | 应用程序 ID
runtimeVersion         | string                                                                | Dapr 运行时版本
enabledFeatures        | string[]                                                              | 由 Dapr 配置启用的功能列表，参见 https://docs.dapr.io/operations/configuration/preview-features/
actors                 | [元数据 API 响应注册的 actor](#metadataapiresponseactor)[]             | 注册的 actor 元数据的 JSON 编码数组。
extended.attributeName | string                                                                | 自定义属性的键值对列表，其中键是属性名称。
components             | [元数据 API 响应组件](#metadataapiresponsecomponent)[]                | 已加载组件元数据的 JSON 编码数组。
httpEndpoints          | [元数据 API 响应 HttpEndpoint](#metadataapiresponsehttpendpoint)[]    | 已加载 HttpEndpoints 元数据的 JSON 编码数组。
subscriptions          | [元数据 API 响应订阅](#metadataapiresponsesubscription)[]             | pub/sub 订阅元数据的 JSON 编码数组。
appConnectionProperties| [元数据 API 响应应用程序连接属性](#metadataapiresponseappconnectionproperties) | 应用程序连接属性的 JSON 编码对象。

<a id="metadataapiresponseactor"></a>**元数据 API 响应注册的 actor**

名称  | 类型    | 描述
----  | ----    | ----
type  | string  | 注册的 actor 类型。
count | integer | 运行的 actor 数量。

<a id="metadataapiresponsecomponent"></a>**元数据 API 响应组件**

名称    | 类型   | 描述
----    | ----   | ----
name    | string | 组件名称。
type    | string | 组件类型。
version | string | 组件版本。
capabilities | array | 此组件类型和版本支持的能力。

<a id="metadataapiresponsehttpendpoint"></a>**元数据 API 响应 HttpEndpoint**

名称    | 类型   | 描述
----    | ----   | ----
name    | string | HttpEndpoint 的名称。

<a id="metadataapiresponsesubscription"></a>**元数据 API 响应订阅**

名称            | 类型   | 描述
----            | ----   | ----
pubsubname      | string | pub/sub 的名称。
topic           | string | 主题名称。
metadata        | object | 与订阅相关的元数据。
rules           | [元数据 API 响应订阅规则](#metadataapiresponsesubscriptionrules)[] | 与订阅相关的规则列表。
deadLetterTopic | string | 死信主题名称。
type            | string | 订阅类型，可以是 `DECLARATIVE`、`STREAMING` 或 `PROGRAMMATIC`。

<a id="metadataapiresponsesubscriptionrules"></a>**元数据 API 响应订阅规则**

名称    | 类型   | 描述
----    | ----   | ----
match   | string | 用于匹配消息的 CEL 表达式，参见 https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-route-messages/#common-expression-language-cel
path    | string | 如果匹配表达式为真，则路由消息的路径。

<a id="metadataapiresponseappconnectionproperties"></a>**元数据 API 响应应用程序连接属性**

名称          | 类型   | 描述
----          | ----   | ----
port          | integer| 应用程序监听的端口。
protocol      | string | 应用程序使用的协议。
channelAddress| string | 应用程序监听的主机地址。
maxConcurrency| integer| 应用程序可以处理的最大并发请求数。
health        | [元数据 API 响应应用程序连接属性健康](#metadataapiresponseappconnectionpropertieshealth) | 应用程序的健康检查详细信息。

<a id="metadataapiresponseappconnectionpropertieshealth"></a>**元数据 API 响应应用程序连接属性健康**

名称            | 类型   | 描述
----            | ----   | ----
healthCheckPath | string | 健康检查路径，适用于 HTTP 协议。
healthProbeInterval | string | 每次健康探测之间的时间，以 go duration 格式表示。
healthProbeTimeout | string | 每次健康探测的超时时间，以 go duration 格式表示。
healthThreshold | integer | 在应用程序被认为不健康之前失败的健康探测的最大次数。

### 示例

```shell
curl http://localhost:3500/v1.0/metadata
```

```json
{
  "id": "myApp",
  "runtimeVersion": "1.12.0",
  "enabledFeatures": [
    "ServiceInvocationStreaming"
  ],
  "actors": [
    {
      "type": "DemoActor"
    }
  ],
  "components": [
    {
      "name": "pubsub",
      "type": "pubsub.redis",
      "version": "v1"
    },
    {
      "name": "statestore",
      "type": "state.redis",
      "version": "v1",
      "capabilities": [
        "ETAG",
        "TRANSACTIONAL",
        "ACTOR"
      ]
    }
  ],
  "httpEndpoints": [
    {
      "name": "my-backend-api"
    }
  ],
  "subscriptions": [
    {
      "type": "DECLARATIVE",
      "pubsubname": "pubsub",
      "topic": "orders",
      "deadLetterTopic": "",
      "metadata": {
        "ttlInSeconds": "30"
      },
      "rules": [
          {
              "match": "%!s(<nil>)",
              "path": "orders"
          }
      ]
    }
  ],
  "extended": {
    "appCommand": "uvicorn --port 3000 demo_actor_service:app",
    "appPID": "98121",
    "cliPID": "98114",
    "daprRuntimeVersion": "1.12.0"
  },
  "appConnectionProperties": {
    "port": 3000,
    "protocol": "http",
    "channelAddress": "127.0.0.1",
    "health": {
      "healthProbeInterval": "5s",
      "healthProbeTimeout": "500ms",
      "healthThreshold": 3
    }
  }
}
```

## 向 Dapr sidecar 信息添加自定义标签

向元数据端点存储的 Dapr sidecar 信息添加自定义标签。

### 用例：
例如，元数据端点被 Dapr CLI 用于在 selfhost 模式下运行 Dapr 时存储托管 sidecar 的进程的 PID，并存储用于运行应用程序的命令。应用程序也可以在启动后添加属性作为键。

### HTTP 请求

```
PUT http://localhost:<daprPort>/v1.0/metadata/attributeName
```

### URL 参数

参数          | 描述
---------      | ----
daprPort       | Dapr 端口。
attributeName  | 自定义属性名称。这是键值对中的键名称。

### HTTP 请求体

在请求中需要以 RAW 数据传递自定义属性值：

```json
{
  "Content-Type": "text/plain"
}
```

在请求体中放置您想要存储的自定义属性值：

```
attributeValue
```

### HTTP 响应代码

代码 | 描述
---- | ----
204  | 自定义属性已添加到元数据信息中

### 示例

向元数据端点添加自定义属性：

```shell
curl -X PUT -H "Content-Type: text/plain" --data "myDemoAttributeValue" http://localhost:3500/v1.0/metadata/myDemoAttribute
```

获取元数据信息以确认您的自定义属性已添加：

```json
{
  "id": "myApp",
  "runtimeVersion": "1.12.0",
  "enabledFeatures": [
    "ServiceInvocationStreaming"
  ],
  "actors": [
    {
      "type": "DemoActor"
    }
  ],
  "components": [
    {
      "name": "pubsub",
      "type": "pubsub.redis",
      "version": "v1"
    },
    {
      "name": "statestore",
      "type": "state.redis",
      "version": "v1",
      "capabilities": [
        "ETAG",
        "TRANSACTIONAL",
        "ACTOR"
      ]
    }
  ],
  "httpEndpoints": [
    {
      "name": "my-backend-api"
    }
  ],
  "subscriptions": [
    {
      "type": "PROGRAMMATIC",
      "pubsubname": "pubsub",
      "topic": "orders",
      "deadLetterTopic": "",
      "metadata": {
        "ttlInSeconds": "30"
      },
      "rules": [
          {
              "match": "%!s(<nil>)",
              "path": "orders"
          }
      ]
    }
  ],
  "extended": {
    "myDemoAttribute": "myDemoAttributeValue",
    "appCommand": "uvicorn --port 3000 demo_actor_service:app",
    "appPID": "98121",
    "cliPID": "98114",
    "daprRuntimeVersion": "1.12.0"
  },
  "appConnectionProperties": {
    "port": 3000,
    "protocol": "http",
    "channelAddress": "127.0.0.1",
    "health": {
      "healthProbeInterval": "5s",
      "healthProbeTimeout": "500ms",
      "healthThreshold": 3
    }
  }
}
```