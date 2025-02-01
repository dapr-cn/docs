---
type: docs
title: "错误代码参考指南"
linkTitle: "参考"
description: "Dapr 中 gRPC 和 HTTP 错误代码列表及其描述"
weight: 20
---

以下表格列出了 Dapr 运行时返回的错误代码。
错误代码会在 HTTP 请求的响应体中或 gRPC 状态响应的 `ErrorInfo` 部分返回（如果存在）。
我们正在努力根据 [更丰富的错误模型]({{< ref "grpc-error-codes.md#richer-grpc-error-model" >}}) 来改进所有 gRPC 错误响应。没有对应 gRPC 代码的错误代码表示这些错误尚未更新到此模型。

### 演员 API

| HTTP 代码                          | gRPC 代码 | 描述                                                             |
| ---------------------------------- | --------- | ---------------------------------------------------------------- |
| `ERR_ACTOR_INSTANCE_MISSING`       |           | 缺少演员实例                                                     |
| `ERR_ACTOR_INVOKE_METHOD`          |           | 调用演员方法时发生错误                                           |
| `ERR_ACTOR_RUNTIME_NOT_FOUND`      |           | 找不到演员运行时                                                 |
| `ERR_ACTOR_STATE_GET`              |           | 获取演员状态时发生错误                                           |
| `ERR_ACTOR_STATE_TRANSACTION_SAVE` |           | 保存演员事务时发生错误                                           |
| `ERR_ACTOR_REMINDER_CREATE`        |           | 创建演员提醒时发生错误                                           |
| `ERR_ACTOR_REMINDER_DELETE`        |           | 删除演员提醒时发生错误                                           |
| `ERR_ACTOR_REMINDER_GET`           |           | 获取演员提醒时发生错误                                           |
| `ERR_ACTOR_REMINDER_NON_HOSTED`    |           | 非托管演员类型的提醒操作                                         |
| `ERR_ACTOR_TIMER_CREATE`           |           | 创建演员计时器时发生错误                                         |
| `ERR_ACTOR_NO_APP_CHANNEL`         |           | 应用通道未初始化                                                 |
| `ERR_ACTOR_STACK_DEPTH`            |           | 超过演员调用堆栈的最大深度                                       |
| `ERR_ACTOR_NO_PLACEMENT`           |           | 未配置放置服务                                                   |
| `ERR_ACTOR_RUNTIME_CLOSED`         |           | 演员运行时已关闭                                                 |
| `ERR_ACTOR_NAMESPACE_REQUIRED`     |           | 在 Kubernetes 模式下运行时，演员必须配置命名空间                 |
| `ERR_ACTOR_NO_ADDRESS`             |           | 找不到演员的地址                                                |

### 工作流 API

| HTTP 代码                          | gRPC 代码 | 描述                                                                             |
| ---------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `ERR_GET_WORKFLOW`                 |           | 获取工作流时发生错误                                                              |
| `ERR_START_WORKFLOW`               |           | 启动工作流时发生错误                                                              |
| `ERR_PAUSE_WORKFLOW`               |           | 暂停工作流时发生错误                                                              |
| `ERR_RESUME_WORKFLOW`              |           | 恢复工作流时发生错误                                                              |
| `ERR_TERMINATE_WORKFLOW`           |           | 终止工作流时发生错误                                                              |
| `ERR_PURGE_WORKFLOW`               |           | 清除工作流时发生错误                                                              |
| `ERR_RAISE_EVENT_WORKFLOW`         |           | 在工作流中引发事件时发生错误                                                      |
| `ERR_WORKFLOW_COMPONENT_MISSING`   |           | 缺少工作流组件                                                                   |
| `ERR_WORKFLOW_COMPONENT_NOT_FOUND` |           | 找不到工作流组件                                                                 |
| `ERR_WORKFLOW_EVENT_NAME_MISSING`  |           | 缺少工作流事件名称                                                               |
| `ERR_WORKFLOW_NAME_MISSING`        |           | 未配置工作流名称                                                                 |
| `ERR_INSTANCE_ID_INVALID`          |           | 无效的工作流实例 ID。（仅允许字母数字和下划线字符）                               |
| `ERR_INSTANCE_ID_NOT_FOUND`        |           | 找不到工作流实例 ID                                                              |
| `ERR_INSTANCE_ID_PROVIDED_MISSING` |           | 缺少工作流实例 ID                                                                |
| `ERR_INSTANCE_ID_TOO_LONG`         |           | 工作流实例 ID 过长                                                               |

### 状态管理 API

| HTTP 代码                               | gRPC 代码                               | 描述                               |
| --------------------------------------- | --------------------------------------- | ---------------------------------- |
| `ERR_STATE_TRANSACTION`                 |                                         | 状态事务出错                       |
| `ERR_STATE_SAVE`                        |                                         | 保存状态时出错                     |
| `ERR_STATE_GET`                         |                                         | 获取状态时出错                     |
| `ERR_STATE_DELETE`                      |                                         | 删除状态时出错                     |
| `ERR_STATE_BULK_DELETE`                 |                                         | 批量删除状态时出错                 |
| `ERR_STATE_BULK_GET`                    |                                         | 批量获取状态时出错                 |
| `ERR_NOT_SUPPORTED_STATE_OPERATION`     |                                         | 事务中不支持的操作                 |
| `ERR_STATE_QUERY`                       | `DAPR_STATE_QUERY_FAILED`               | 查询状态时出错                     |
| `ERR_STATE_STORE_NOT_FOUND`             | `DAPR_STATE_NOT_FOUND`                  | 找不到状态存储                     |
| `ERR_STATE_STORE_NOT_CONFIGURED`        | `DAPR_STATE_NOT_CONFIGURED`             | 未配置状态存储                     |
| `ERR_STATE_STORE_NOT_SUPPORTED`         | `DAPR_STATE_TRANSACTIONS_NOT_SUPPORTED` | 状态存储不支持事务                 |
| `ERR_STATE_STORE_NOT_SUPPORTED`         | `DAPR_STATE_QUERYING_NOT_SUPPORTED`     | 状态存储不支持查询                 |
| `ERR_STATE_STORE_TOO_MANY_TRANSACTIONS` | `DAPR_STATE_TOO_MANY_TRANSACTIONS`      | 每个事务的操作过多                 |
| `ERR_MALFORMED_REQUEST`                 | `DAPR_STATE_ILLEGAL_KEY`                | 无效的键                           |

### 配置 API

| HTTP 代码                                | gRPC 代码 | 描述                            |
| ---------------------------------------- | --------- | ------------------------------- |
| `ERR_CONFIGURATION_GET`                  |           | 获取配置时出错                  |
| `ERR_CONFIGURATION_STORE_NOT_CONFIGURED` |           | 未配置配置存储                  |
| `ERR_CONFIGURATION_STORE_NOT_FOUND`      |           | 找不到配置存储                  |
| `ERR_CONFIGURATION_SUBSCRIBE`            |           | 订阅配置时出错                  |
| `ERR_CONFIGURATION_UNSUBSCRIBE`          |           | 取消订阅配置时出错              |

### 加密 API

| HTTP 代码                             | gRPC 代码 | 描述                     |
| ------------------------------------- | --------- | ------------------------ |
| `ERR_CRYPTO`                          |           | 加密操作出错             |
| `ERR_CRYPTO_KEY`                      |           | 检索加密密钥时出错       |
| `ERR_CRYPTO_PROVIDER_NOT_FOUND`       |           | 找不到加密提供者         |
| `ERR_CRYPTO_PROVIDERS_NOT_CONFIGURED` |           | 未配置加密提供者         |

### 密钥管理 API

| HTTP 代码                          | gRPC 代码 | 描述                 |
| ---------------------------------- | --------- | -------------------- |
| `ERR_SECRET_GET`                   |           | 获取密钥时出错       |
| `ERR_SECRET_STORE_NOT_FOUND`       |           | 找不到密钥存储       |
| `ERR_SECRET_STORES_NOT_CONFIGURED` |           | 未配置密钥存储       |
| `ERR_PERMISSION_DENIED`            |           | 策略拒绝权限         |

### 发布/订阅和消息传递错误

| HTTP 代码                     | gRPC 代码                              | 描述                                |
| ----------------------------- | -------------------------------------- | ----------------------------------- |
| `ERR_PUBSUB_EMPTY`            | `DAPR_PUBSUB_NAME_EMPTY`               | 发布/订阅名称为空                   |
| `ERR_PUBSUB_NOT_FOUND`        | `DAPR_PUBSUB_NOT_FOUND`                | 找不到发布/订阅                     |
| `ERR_PUBSUB_NOT_FOUND`        | `DAPR_PUBSUB_TEST_NOT_FOUND`           | 找不到发布/订阅                     |
| `ERR_PUBSUB_NOT_CONFIGURED`   | `DAPR_PUBSUB_NOT_CONFIGURED`           | 未配置发布/订阅                     |
| `ERR_TOPIC_NAME_EMPTY`        | `DAPR_PUBSUB_TOPIC_NAME_EMPTY`         | 主题名称为空                        |
| `ERR_PUBSUB_FORBIDDEN`        | `DAPR_PUBSUB_FORBIDDEN`                | 禁止访问主题的应用 ID               |
| `ERR_PUBSUB_PUBLISH_MESSAGE`  | `DAPR_PUBSUB_PUBLISH_MESSAGE`          | 发布消息时出错                      |
| `ERR_PUBSUB_REQUEST_METADATA` | `DAPR_PUBSUB_METADATA_DESERIALIZATION` | 反序列化元数据时出错                |
| `ERR_PUBSUB_CLOUD_EVENTS_SER` | `DAPR_PUBSUB_CLOUD_EVENT_CREATION`     | 创建 CloudEvent 时出错              |
| `ERR_PUBSUB_EVENTS_SER`       | `DAPR_PUBSUB_MARSHAL_ENVELOPE`         | 编组 Cloud Event 信封时出错         |
| `ERR_PUBSUB_EVENTS_SER`       | `DAPR_PUBSUB_MARSHAL_EVENTS`           | 将事件编组为字节时出错              |
| `ERR_PUBSUB_EVENTS_SER`       | `DAPR_PUBSUB_UNMARSHAL_EVENTS`         | 解组事件时出错                      |
| `ERR_PUBLISH_OUTBOX`          |                                        | 将消息发布到 outbox 时出错          |

### 对话 API

| HTTP 代码                         | gRPC 代码 | 描述                                   |
| --------------------------------- | --------- | -------------------------------------- |
| `ERR_CONVERSATION_INVALID_PARMS`  |           | 对话组件的参数无效                     |
| `ERR_CONVERSATION_INVOKE`         |           | 调用对话时出错                         |
| `ERR_CONVERSATION_MISSING_INPUTS` |           | 对话缺少输入                           |
| `ERR_CONVERSATION_NOT_FOUND`      |           | 找不到对话                             |

### 服务调用 / 直接消息传递 API

| HTTP 代码           | gRPC 代码 | 描述                  |
| ------------------- | --------- | --------------------- |
| `ERR_DIRECT_INVOKE` |           | 调用服务时出错        |

### 绑定 API

| HTTP 代码                   | gRPC 代码 | 描述                     |
| --------------------------- | --------- | ------------------------ |
| `ERR_INVOKE_OUTPUT_BINDING` |           | 调用输出绑定时出错       |

### 分布式锁 API

| HTTP 代码                       | gRPC 代码 | 描述                     |
| ------------------------------- | --------- | ------------------------ |
| `ERR_LOCK_STORE_NOT_CONFIGURED` |           | 未配置锁存储             |
| `ERR_LOCK_STORE_NOT_FOUND`      |           | 找不到锁存储             |
| `ERR_TRY_LOCK`                  |           | 获取锁时出错             |
| `ERR_UNLOCK`                    |           | 释放锁时出错             |

### 健康检查

| HTTP 代码                       | gRPC 代码 | 描述                     |
| ------------------------------- | --------- | ------------------------ |
| `ERR_HEALTH_NOT_READY`          |           | Dapr 未准备好            |
| `ERR_HEALTH_APPID_NOT_MATCH`    |           | Dapr 应用 ID 不匹配      |
| `ERR_OUTBOUND_HEALTH_NOT_READY` |           | Dapr 出站未准备好        |

### 通用

| HTTP 代码                    | gRPC 代码 | 描述                     |
| ---------------------------- | --------- | ------------------------ |
| `ERR_API_UNIMPLEMENTED`      |           | API 未实现               |
| `ERR_APP_CHANNEL_NIL`        |           | 应用通道为 nil           |
| `ERR_BAD_REQUEST`            |           | 错误请求                 |
| `ERR_BODY_READ`              |           | 读取请求体时出错         |
| `ERR_INTERNAL`               |           | 内部错误                 |
| `ERR_MALFORMED_REQUEST`      |           | 请求格式错误             |
| `ERR_MALFORMED_REQUEST_DATA` |           | 请求数据格式错误         |
| `ERR_MALFORMED_RESPONSE`     |           | 响应格式错误             |

### 调度/作业 API

| HTTP 代码                       | gRPC 代码                       | 描述                                |
| ------------------------------- | ------------------------------- | ----------------------------------- |
| `DAPR_SCHEDULER_SCHEDULE_JOB`   | `DAPR_SCHEDULER_SCHEDULE_JOB`   | 调度作业时出错                      |
| `DAPR_SCHEDULER_JOB_NAME`       | `DAPR_SCHEDULER_JOB_NAME`       | 作业名称应仅在 URL 中设置           |
| `DAPR_SCHEDULER_JOB_NAME_EMPTY` | `DAPR_SCHEDULER_JOB_NAME_EMPTY` | 作业名称为空                        |
| `DAPR_SCHEDULER_GET_JOB`        | `DAPR_SCHEDULER_GET_JOB`        | 获取作业时出错                      |
| `DAPR_SCHEDULER_LIST_JOBS`      | `DAPR_SCHEDULER_LIST_JOBS`      | 列出作业时出错                      |
| `DAPR_SCHEDULER_DELETE_JOB`     | `DAPR_SCHEDULER_DELETE_JOB`     | 删除作业时出错                      |
| `DAPR_SCHEDULER_EMPTY`          | `DAPR_SCHEDULER_EMPTY`          | 必需的参数为空                      |
| `DAPR_SCHEDULER_SCHEDULE_EMPTY` | `DAPR_SCHEDULER_SCHEDULE_EMPTY` | 未提供作业的调度                    |

### 通用

| HTTP 代码 | gRPC 代码 | 描述         |
| --------- | --------- | ------------ |
| `ERROR`   | `ERROR`   | 通用错误     |

## 下一步

- [处理 HTTP 错误代码]({{< ref http-error-codes.md >}})
- [处理 gRPC 错误代码]({{< ref grpc-error-codes.md >}})
`