---
type: docs
title: "Metadata API 参考"
linkTitle: "Metadata API"
description: "有关元数据 API 的详细文档"
weight: 800
---

Dapr 有一个 metadata API，它返回有关 sidecar 的信息，从而实现运行时可发现性。 元数据终结点返回加载的组件和激活的 Actors（如果存在）的列表。

Dapr metadata API 还允许您以键值对的格式存储其他信息。

注意：Dapr CLI 在独立模式下运行 dapr 时，Dapr 元数据端点用于存储托管 sidecar 的进程的 PID 和用于运行应用程序的命令。

## 获取 Dapr sidecar 信息

获取元数据终结点提供的 Dapr sidecar 信息。

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/metadata
```

### URL 参数

| 参数       | 说明       |
| -------- | -------- |
| daprPort | Dapr 端口。 |

### HTTP 响应码

| 代码  | 说明             |
| --- | -------------- |
| 200 | 返回的元数据信息       |
| 500 | Dapr 无法返回元数据信息 |

### HTTP 响应正文

**元数据 API 响应对象**

| Name                   | 数据类型                                                                  | 说明                          |
| ---------------------- | --------------------------------------------------------------------- | --------------------------- |
| id                     | string                                                                | 应用 ID                       |
| actors                 | [Metadata API Response Registered Actor](#metadataapiresponseactor)[] | 已注册 Actor 与元数据的 json 编码数组。  |
| extended.attributeName | string                                                                | 作为键值对的自定义属性列表，其中 key 是属性名称。 |
| 组件                     | [Metadata API Response Component](#metadataapiresponsecomponent)[]    | 加载的组件元数据的 json 编码数组。        |

<a id="metadataapiresponseactor"></a>**Metadata API Response Registered Actor**

| Name  | 数据类型    | 说明               |
| ----- | ------- | ---------------- |
| type  | string  | 已注册的 Actor 组件类型。 |
| count | integer | 运行的 Actor 数量。    |

<a id="metadataapiresponsecomponent"></a>**Metadata API Response Component**

| Name    | 数据类型   | 说明    |
| ------- | ------ | ----- |
| name    | string | 组件名称. |
| type    | string | 组件类型. |
| version | string | 组件版本. |

### 示例

注意：此示例基于适用于 Python</a>的Dapr SDK 中提供的 Actor 示例。</p> 



```shell
curl http://localhost:3500/v1.0/metadata
```




```json
{
    "id":"demo-actor",
    "actors":[
        {
            "type":"DemoActor",
            "count":1
        }
    ],
    "extended": {
        "cliPID":"1031040",
        "appCommand":"uvicorn --port 3000 demo_actor_service:app"
    },
    "components":[
        {
            "name":"pubsub",
            "type":"pubsub.redis",
            "version":""
        },
        {
            "name":"statestore",
            "type":"state.redis",
            "version":""
        }
    ]
}
```




## 将自定义属性添加到 Dapr sidecar 信息中

将自定义属性添加到元数据终结点存储的 Dapr sidecar 信息中。



### HTTP 请求



```
PUT http://localhost:<daprPort>/v1.0/metadata/attributeName
```




### URL 参数

| 参数            | 说明                  |
| ------------- | ------------------- |
| daprPort      | Dapr 端口。            |
| attributeName | 自定义属性名称. 这是键值对中的键名。 |




### HTTP 请求正文

在请求中，您需要将自定义属性值作为 RAW 数据传递：



```json
{
  "Content-Type": "text/plain"
}
```


在请求正文中放置要存储的自定义属性值：



```
attributeValue
```




### HTTP 响应码

| 代码  | 说明             |
| --- | -------------- |
| 204 | 自定义属性添加到元数据信息中 |




### 示例

注意：此示例基于适用于 Python</a>的 Dapr SDK 中提供的 Actor 示例。</p> 

将自定义属性添加到元数据终结点：



```shell
curl -X PUT -H "Content-Type: text/plain" --data "myDemoAttributeValue" http://localhost:3500/v1.0/metadata/myDemoAttribute
```


获取元数据信息以确认已添加自定义属性：



```json
{
    "id":"demo-actor",
    "actors":[
        {
            "type":"DemoActor",
            "count":1
        }
    ],
    "extended": {
        "myDemoAttribute": "myDemoAttributeValue",
        "cliPID":"1031040",
        "appCommand":"uvicorn --port 3000 demo_actor_service:app"
    },
    "components":[
        {
            "name":"pubsub",
            "type":"pubsub.redis",
            "version":""
        },
        {
            "name":"statestore",
            "type":"state.redis",
            "version":""
        }
    ]
}
```



