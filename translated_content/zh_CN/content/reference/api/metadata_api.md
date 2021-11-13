---
type: docs
title: "Metadata API reference"
linkTitle: "Metadata API"
description: "Detailed documentation on the Metadata API"
weight: 800
---

Dapr has a metadata API that returns information about the sidecar allowing runtime discoverability. The metadata endpoint returns among other things, a list of the components loaded and the activated actors (if present).

The Dapr metadata API also allows you to store additional information in the format of key-value pairs.

Note: The Dapr metatada endpoint is for instance being used by the Dapr CLI when running dapr in standalone mode to store the PID of the process hosting the sidecar and the command used to run the application.

## Get the Dapr sidecar information

Gets the Dapr sidecar information provided by the Metadata Endpoint.

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/metadata
```

### URL 参数

| 参数       | 说明       |
| -------- | -------- |
| daprPort | Dapr 端口。 |

### HTTP 响应码

| 代码  | 说明                                             |
| --- | ---------------------------------------------- |
| 200 | Metadata information returned                  |
| 500 | Dapr could not return the metadata information |

### HTTP Response Body

**Metadata API Response Object**

| Name                   | 数据类型                                                                  | 说明                                                                             |
| ---------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| id                     | string                                                                | Application ID                                                                 |
| actor                  | [Metadata API Response Registered Actor](#metadataapiresponseactor)[] | A json encoded array of Registered Actors metadata.                            |
| extended.attributeName | string                                                                | List of custom attributes as key-value pairs, where key is the attribute name. |
| 组件                     | [Metadata API Response Component](#metadataapiresponsecomponent)[]    | A json encoded array of loaded components metadata.                            |

<a id="metadataapiresponseactor"></a>**Metadata API Response Registered Actor**

| Name  | 数据类型    | 说明                         |
| ----- | ------- | -------------------------- |
| type  | string  | The registered actor type. |
| count | integer | Number of actors running.  |

<a id="metadataapiresponsecomponent"></a>**Metadata API Response Component**

| Name    | 数据类型   | 说明                     |
| ------- | ------ | ---------------------- |
| name    | string | Name of the component. |
| type    | string | Component type.        |
| version | string | 组件版本.                  |

### 示例

Note: This example is based on the Actor sample provided in the [Dapr SDK for Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor).

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

## Add a custom attribute to the Dapr sidecar information

Adds a custom attribute to the Dapr sidecar information stored by the Metadata Endpoint.

### HTTP 请求

```
PUT http://localhost:<daprPort>/v1.0/metadata/attributeName
```

### URL 参数

| 参数            | 说明                                                                  |
| ------------- | ------------------------------------------------------------------- |
| daprPort      | Dapr 端口。                                                            |
| attributeName | Custom attribute name. This is they key name in the key-value pair. |

### HTTP Request Body

In the request you need to pass the custom attribute value as RAW data:

```json
{
  "Content-Type": "text/plain"
}
```

Within the body of the request place the custom attribute value you want to store:

```
attributeValue
```

### HTTP 响应码

| 代码  | 说明                                                 |
| --- | -------------------------------------------------- |
| 204 | Custom attribute added to the metadata information |

### 示例

Note: This example is based on the Actor sample provided in the [Dapr SDK for Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor).

Add a custom attribute to the metadata endpoint:

```shell
curl -X PUT -H "Content-Type: text/plain" --data "myDemoAttributeValue" http://localhost:3500/v1.0/metadata/myDemoAttribute
```

Get the metadata information to confirm your custom attribute was added:

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



