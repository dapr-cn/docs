---
type: docs
title: "Metadata API 参考文档"
linkTitle: "Metadata API"
description: "有关元数据 API 的详细文档"
weight: 1100
---

Dapr 有一个 metadata API，它返回有关 sidecar 的信息，从而实现运行时可发现性。 The metadata endpoint returns the following information.
- Runtime version
- List of the loaded resources (`components`, `subscriptions` and `HttpEndpoints`)
- Registered actor types
- Features enabled
- Application connection details
- Custom, ephemeral attributes with information.

## Metadata API

### 组件
每个加载的组件都会提供其名称、类型和版本，并以组件功能的形式提供有关支持功能的信息。 这些功能适用于 [状态存储]({{< ref supported-state-stores.md >}}) 和 [绑定]({{< ref supported-bindings.md >}}) 组件类型。 下表列出了特定版本的组件类型和功能列表。 该列表今后可能会增加，但仅代表已加载组件的功能。

| 类型   | 能力                                  |
| ---- | ----------------------------------- |
| 状态存储 | ETAG, TRANSACTION, ACTOR, QUERY_API |
| 绑定   | INPUT_BINDING, OUTPUT_BINDING     |

### HTTPEndpoints
每个加载的 `HttpEndpoint` 都提供了一个名称，以便轻松识别与运行时相关的 Dapr 资源。

### Subscriptions
The metadata API returns a list of pub/sub subscriptions that the app has registered with the Dapr runtime. This includes the pub/sub name, topic, routes, dead letter topic, and the metadata associated with the subscription.

### Enabled features
A list of features enabled via Configuration spec (including build-time overrides).

### App connection details
The metadata API returns information related to Dapr's connection to the app. This includes the app port, protocol, host, max concurrency, along with health check details.

### 属性

The metadata API allows you to store additional attribute information in the format of key-value pairs. These are ephemeral in-memory and are not persisted if a sidecar is reloaded. This information should be added at the time of a sidecar creation (for example, after the application has started).

## Get the Dapr sidecar information

获取元数据端点提供的 Dapr sidecar 信息。

### Usecase:
The Get Metadata API can be used for discovering different capabilities supported by loaded components. It can help operators in determining which components to provision, for required capabilities.

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/metadata
```

### URL 参数

| Parameter | 说明      |
| --------- | ------- |
| daprPort  | Dapr 端口 |

### HTTP Response Codes

| Code | 说明                                             |
| ---- | ---------------------------------------------- |
| 200  | Metadata information returned                  |
| 500  | Dapr could not return the metadata information |

### HTTP Response Body

**Metadata API Response Object**

| Name                    | 数据类型                                                                                         | 说明                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| id                      | string                                                                                       | Application ID                                                                                                      |
| runtimeVersion          | string                                                                                       | Version of the Dapr runtime                                                                                         |
| enabledFeatures         | string[]                                                                                     | List of features enabled by Dapr Configuration, see https://docs.dapr.io/operations/configuration/preview-features/ |
| actors                  | [Metadata API Response Registered Actor](#metadataapiresponseactor)[]                        | A json encoded array of registered actors metadata.                                                                 |
| extended.attributeName  | string                                                                                       | List of custom attributes as key-value pairs, where key is the attribute name.                                      |
| components              | [Metadata API Response Component](#metadataapiresponsecomponent)[]                           | A json encoded array of loaded components metadata.                                                                 |
| httpEndpoints           | [Metadata API Response HttpEndpoint](#metadataapiresponsehttpendpoint)[]                     | A json encoded array of loaded HttpEndpoints metadata.                                                              |
| subscriptions           | [Metadata API Response Subscription](#metadataapiresponsesubscription)[]                     | A json encoded array of pub/sub subscriptions metadata.                                                             |
| appConnectionProperties | [Metadata API Response AppConnectionProperties](#metadataapiresponseappconnectionproperties) | A json encoded object of app connection properties.                                                                 |

<a id="metadataapiresponseactor"></a>**Metadata API Response Registered Actor**

| Name  | 数据类型    | 说明                         |
| ----- | ------- | -------------------------- |
| type  | string  | The registered actor type. |
| count | integer | Number of actors running.  |

<a id="metadataapiresponsecomponent"></a>**Metadata API Response Component**

| Name         | 数据类型   | 说明                                                          |
| ------------ | ------ | ----------------------------------------------------------- |
| name         | string | Name of the component.                                      |
| type         | string | Component type.                                             |
| version      | string | Component version.                                          |
| capabilities | array  | Supported capabilities for this component type and version. |

<a id="metadataapiresponsehttpendpoint"></a>**Metadata API Response HttpEndpoint**

| Name | 数据类型   | 说明                        |
| ---- | ------ | ------------------------- |
| name | string | Name of the HttpEndpoint. |

<a id="metadataapiresponsesubscription"></a>**Metadata API Response Subscription**

| Name            | 数据类型                                                                                | 说明                                              |
| --------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| pubsubname      | string                                                                              | Name of the pub/sub.                            |
| topic           | string                                                                              | Topic name.                                     |
| metadata        | object                                                                              | Metadata associated with the subscription.      |
| rules           | [Metadata API Response Subscription Rules](#metadataapiresponsesubscriptionrules)[] | List of rules associated with the subscription. |
| deadLetterTopic | string                                                                              | Dead letter topic name.                         |

<a id="metadataapiresponsesubscriptionrules"></a>**Metadata API Response Subscription Rules**

| Name  | 数据类型   | 说明                                                                                                                                                                |
| ----- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| match | string | CEL expression to match the message, see https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-route-messages/#common-expression-language-cel |
| path  | string | Path to route the message if the match expression is true.                                                                                                        |

<a id="metadataapiresponseappconnectionproperties"></a>**Metadata API Response AppConnectionProperties**

| Name           | 数据类型                                                                                                      | 说明                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| port           | integer                                                                                                   | Port on which the app is listening.                       |
| protocol       | string                                                                                                    | Protocol used by the app.                                 |
| channelAddress | string                                                                                                    | Host address on which the app is listening.               |
| maxConcurrency | integer                                                                                                   | Maximum number of concurrent requests the app can handle. |
| health         | [Metadata API Response AppConnectionProperties Health](#metadataapiresponseappconnectionpropertieshealth) | Health check details of the app.                          |

<a id="metadataapiresponseappconnectionpropertieshealth"></a>**Metadata API Response AppConnectionProperties Health**

| Name                | 数据类型    | 说明                                                                         |
| ------------------- | ------- | -------------------------------------------------------------------------- |
| healthCheckPath     | string  | Health check path, applicable for HTTP protocol.                           |
| healthProbeInterval | string  | Time between each health probe, in go duration format.                     |
| healthProbeTimeout  | string  | Timeout for each health probe, in go duration format.                      |
| healthThreshold     | integer | Max number of failed health probes before the app is considered unhealthy. |


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

## Add a custom label to the Dapr sidecar information

Adds a custom label to the Dapr sidecar information stored by the Metadata endpoint.

### Usecase:
The metadata endpoint is, for example, used by the Dapr CLI when running dapr in self hosted mode to store the PID of the process hosting the sidecar and store the command used to run the application.  Applications can also add attributes as keys after startup.

### HTTP Request

```
PUT http://localhost:<daprPort>/v1.0/metadata/attributeName
```

### URL 参数

| Parameter     | 说明                                                                  |
| ------------- | ------------------------------------------------------------------- |
| daprPort      | Dapr 端口                                                             |
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

### HTTP Response Codes

| Code | 说明                                                 |
| ---- | -------------------------------------------------- |
| 204  | Custom attribute added to the metadata information |

### 示例

Add a custom attribute to the metadata endpoint:

```shell
curl -X PUT -H "Content-Type: text/plain" --data "myDemoAttributeValue" http://localhost:3500/v1.0/metadata/myDemoAttribute
```

Get the metadata information to confirm your custom attribute was added:

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



