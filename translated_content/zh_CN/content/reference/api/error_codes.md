---
type: docs
title: "API返回的错误代码"
linkTitle: "Error codes"
description: "Dapr API 错误代码的详细参考"
weight: 1000
---

For http calls made to Dapr runtime, when an error is encountered, an error json is returned in http response body. The json contains an error code and an descriptive error message, e.g. Json 包含错误代码和描述性错误消息，例如 Json 包含错误代码和描述性错误消息，例如
```
{
    "errorCode": "ERR_STATE_GET",
    "message": "Requested state key does not exist in state store."
}
}
}
```

下表列出了 Dapr 运行时返回的错误代码：

| 错误代码                                  | 说明                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ERR_ACTOR_INSTANCE_MISSING          | 获取 actor 实例时出错。 Error getting an actor instance. This means that actor is now hosted in some other service replica. |
| ERR_ACTOR_RUNTIME_NOT_FOUND       | 获取 actor 实例时出错。                                                                                                     |
| ERR_ACTOR_REMINDER_CREATE           | 为 actor 创建 reminders 时出错。                                                                                           |
| ERR_ACTOR_REMINDER_DELETE           | 删除 actor 的 reminders 时出错。                                                                                           |
| ERR_ACTOR_TIMER_CREATE              | 为 actor 创建 timer 时出错。                                                                                               |
| ERR_ACTOR_TIMER_DELETE              | 删除 actor 的 timer 时出错。                                                                                               |
| ERR_ACTOR_REMINDER_GET              | 获取 actor 的 reminders 时出错。                                                                                           |
| ERR_ACTOR_INVOKE_METHOD             | 对 actor 调用方法时出错。                                                                                                    |
| ERR_ACTOR_STATE_DELETE              | 删除 actor 状态时出错。                                                                                                     |
| ERR_ACTOR_STATE_GET                 | 获取 actor 的状态时出错。                                                                                                    |
| ERR_ACTOR_STATE_TRANSACTION_SAVE  | 存储 actor 状态时事务出错。                                                                                                   |
| ERR_PUBSUB_NOT_FOUND                | 引用 Dapr 运行时中的 Pub/Sub 组件时出错。                                                                                        |
| ERR_PUBSUB_PUBLISH_MESSAGE          | 发布消息时出错。                                                                                                            |
| ERR_PUBSUB_FORBIDDEN                | Error message forbidden by access controls.                                                                         |
| ERR_PUBSUB_CLOUD_EVENTS_SER       | Error serializing Pub/Sub event envelope.                                                                           |
| ERR_STATE_STORE_NOT_FOUND         | Error referencing a state store not found.                                                                          |
| ERR_STATE_STORES_NOT_CONFIGURED   | Error no state stores configured.                                                                                   |
| ERR_NOT_SUPPORTED_STATE_OPERATION | Error transaction requested on a state store with no transaction support.                                           |
| ERR_STATE_GET                       | Error getting a state for state store.                                                                              |
| ERR_STATE_DELETE                    | Error deleting a state from state store.                                                                            |
| ERR_STATE_SAVE                      | Error saving a state in state store.                                                                                |
| ERR_INVOKE_OUTPUT_BINDING           | Error invoking an output binding.                                                                                   |
| ERR_MALFORMED_REQUEST               | Error with a malformed request.                                                                                     |
| ERR_DIRECT_INVOKE                   | Error in direct invocation.                                                                                         |
| ERR_DESERIALIZE_HTTP_BODY           | Error deserializing an HTTP request body.                                                                           |
| ERR_SECRET_STORES_NOT_CONFIGURED  | Error that no secret store is configured.                                                                           |
| ERR_SECRET_STORE_NOT_FOUND        | Error that specified secret store is not found.                                                                     |
| ERR_HEALTH_NOT_READY                | Error that Dapr is not ready.                                                                                       |
| ERR_METADATA_GET                    | Error parsing the Metadata information.                                                                             |
