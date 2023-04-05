---
type: docs
title: "Cron 绑定规范"
linkTitle: "Cron"
description: "Cron 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/cron/"
---

## Component format

To setup cron binding create a component of type `bindings.cron`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 15m" # valid cron schedule
```

## 元数据字段规范

| Field    | 必填 | 绑定支持  | 详情                                                                            | 示例             |
| -------- |:--:| ----- | ----------------------------------------------------------------------------- | -------------- |
| schedule | 是  | Input | The valid cron schedule to use. See [this](#schedule-format) for more details | `"@every 15m"` |

### 计划格式

Dapr cron 绑定支持以下格式：

| Character | 描述器    | 可接受值                |
|:---------:| ------ | ------------------- |
|     1     | Second | 0 to 59, or *       |
|     2     | 分钟     | 0 to 59, or *       |
|     3     | 小时     | 0 to 23, or * (UTC) |
|     4     | 月份中的天  | 1 to 31, or *       |
|     5     | 月      | 1 to 12, or *       |
|     6     | 一周中的一天 | 0-7(0和7代表星期日)，或 *   |

例如:

* `30 * * * * *` - every 30 seconds
* `0 15 * * * *` - every 15 minutes
* `0 30 3-6,20-23 * * *` - every hour on the half hour in the range 3-6am, 8-11pm
* `CRON_TZ=America/New_York 0 30 04 * * *` - every day at 4:30am New York time

> 您可以在[这里](https://en.wikipedia.org/wiki/Cron)了解更多关于cron和支持的格式

为便于使用，Dapr cron 绑定也支持少量快捷方式：

* `@every 15s` where `s` is seconds, `m` minutes, and `h` hours
* `@daily` 或 `@hourly` 它是从绑定初始化之时起运行的

## 监听 cron 绑定

在设置了cron绑定之后，您需要做的就是监听与您的组件名称匹配的 endpoint。 假设 [NAME] 是 `scheduled`。 这将作为一个 HTTP `POST` 请求。 下面的例子展示了一个简单的 Node.js Express 应用程序如何接收 `/scheduled` endpoint 上的调用，并将消息写入控制台。

```js
app.post('/scheduled', async function(req, res){
    console.log("scheduled endpoint called", req.body)
    res.status(200).send()
});
```

在运行这段代码时，请注意 `/scheduled` endpoint 每五分钟被 Dapr sidecar 调用一次。


## 绑定支持

此组件支持 **输入** 绑定接口。

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
