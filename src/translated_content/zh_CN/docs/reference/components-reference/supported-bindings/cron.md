---
type: docs
title: "Cron 绑定规范"
linkTitle: "Cron"
description: "关于 cron 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/cron/"
---

## 组件格式

要设置 cron 绑定，需要创建一个类型为 `bindings.cron` 的组件。请参考[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

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
    value: "@every 15m" # 有效的 cron 调度
  - name: direction
    value: "input"
```

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|-------|--------|---------|
| `schedule` | Y | 输入|  使用的有效 cron 调度。详见[此处](#schedule-format) | `"@every 15m"`
| `direction` | N | 输入|  绑定的方向 | `"input"`

### 调度格式

Dapr cron 绑定支持以下格式：

| 字符 |	描述        | 可接受的值                             |
|:---------:|-------------------|-----------------------------------------------|
| 1	        | 秒	          | 0 到 59，或 *                                 |
| 2	        | 分	          | 0 到 59，或 *                                 |
| 3	        | 小时	            | 0 到 23，或 * (UTC)                           |
| 4	        | 月中的某天	| 1 到 31，或 *                                 |
| 5	        | 月	            | 1 到 12，或 *                                 |
| 6	        | 星期几	  | 0 到 7 (其中 0 和 7 代表星期日)，或 *         |

例如：

* `30 * * * * *` - 每 30 秒执行一次
* `0 15 * * * *` - 每 15 分钟执行一次
* `0 30 3-6,20-23 * * *` - 在凌晨 3 点到 6 点和晚上 8 点到 11 点之间，每小时的半点执行一次
* `CRON_TZ=America/New_York 0 30 04 * * *` - 每天纽约时间凌晨 4:30 执行一次

> 您可以在[这里](https://en.wikipedia.org/wiki/Cron)了解更多关于 cron 和支持的格式。

为了便于使用，Dapr cron 绑定还支持一些快捷方式：

* `@every 15s` 其中 `s` 是秒，`m` 是分钟，`h` 是小时
* `@daily` 或 `@hourly` 从绑定初始化时开始按该周期运行

## 监听 cron 绑定

设置 cron 绑定后，您只需监听与组件名称匹配的端点。假设 [NAME] 是 `scheduled`。这将作为一个 HTTP `POST` 请求。下面的示例展示了一个简单的 Node.js Express 应用程序如何在 `/scheduled` 端点接收调用并向控制台写入消息。

```js
app.post('/scheduled', async function(req, res){
    console.log("scheduled endpoint called", req.body)
    res.status(200).send()
});
```

运行此代码时，请注意 `/scheduled` 端点每十五分钟由 Dapr sidecar 调用。

## 绑定支持

此组件支持**输入**绑定接口。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [操作指南：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [操作指南：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
