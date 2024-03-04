---
type: docs
title: "API 返回的错误代码"
linkTitle: "Error codes"
description: "Dapr API 错误代码的详细参考"
weight: 1300
---

For http calls made to Dapr runtime, when an error is encountered, an error json is returned in http response body. The json contains an error code and an descriptive error message, e.g.
```
{
    "errorCode": "ERR_STATE_GET",
    "message": "Requested state key does not exist in state store."
}
```

下表列出了 Dapr 运行时返回的错误代码：

| Error Code                            | 说明                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| ERR_ACTOR_INSTANCE_MISSING          | Error getting an actor instance. This means that actor is now hosted in some other service replica. |
| ERR_ACTOR_RUNTIME_NOT_FOUND       | 获取 actor 实例时出错。                                                                                     |
| ERR_ACTOR_REMINDER_CREATE           | 为 actor 创建 reminder 时出错。                                                                            |
| ERR_ACTOR_REMINDER_DELETE           | 删除 actor 的 reminder 时出错。                                                                            |
| ERR_ACTOR_TIMER_CREATE              | 为 actor 创建 timer 时出错。                                                                               |
| ERR_ACTOR_TIMER_DELETE              | 删除 actor 的 timer 时出错。                                                                               |
| ERR_ACTOR_REMINDER_GET              | 获取 actor 的 reminder 时出错。                                                                            |
| ERR_ACTOR_INVOKE_METHOD             | 对 actor 调用方法时出错。                                                                                    |
| ERR_ACTOR_STATE_DELETE              | 删除 actor 状态时出错。                                                                                     |
| ERR_ACTOR_STATE_GET                 | 获取 actor 的状态时出错。                                                                                    |
| ERR_ACTOR_STATE_TRANSACTION_SAVE  | 存储 actor 状态时事务出错。                                                                                   |
| ERR_PUBSUB_NOT_FOUND                | 引用 Dapr 运行时中的 Pub/Sub 组件时出错。                                                                        |
| ERR_PUBSUB_PUBLISH_MESSAGE          | 发布消息时出错。                                                                                            |
| ERR_PUBSUB_FORBIDDEN                | 访问控制禁止的错误消息。                                                                                        |
| ERR_PUBSUB_CLOUD_EVENTS_SER       | 序列化 Pub/Sub 事件信封是出错。                                                                                |
| ERR_STATE_STORE_NOT_FOUND         | 未找到引用状态存储的错误。                                                                                       |
| ERR_STATE_STORES_NOT_CONFIGURED   | 未配置状态存储的错误。                                                                                         |
| ERR_NOT_SUPPORTED_STATE_OPERATION | 在没有事务支持的状态存储上进行事务请求的错误。                                                                             |
| ERR_STATE_GET                       | 获取状态存储的状态时出错。                                                                                       |
| ERR_STATE_DELETE                    | 从状态存储中删除状态时出错。                                                                                      |
| ERR_STATE_SAVE                      | 在状态存储中保存状态时出错。                                                                                      |
| ERR_INVOKE_OUTPUT_BINDING           | 调用输出绑定时出错。                                                                                          |
| ERR_MALFORMED_REQUEST               | 格式错误的请求。                                                                                            |
| ERR_DIRECT_INVOKE                   | 直接调用错误。                                                                                             |
| ERR_DESERIALIZE_HTTP_BODY           | 反序列化 HTTP 请求正文时出错。                                                                                  |
| ERR_SECRET_STORES_NOT_CONFIGURED  | 未配置密钥存储的错误。                                                                                         |
| ERR_SECRET_STORE_NOT_FOUND        | 未找到指定密钥存储的错误。                                                                                       |
| ERR_HEALTH_NOT_READY                | Dapr 未就绪的错误。                                                                                        |
| ERR_METADATA_GET                    | 解析元数据信息时出错。                                                                                         |
