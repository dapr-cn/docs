---
type: docs
title: "Cron 绑定规范"
linkTitle: "Cron"
description: "Cron 绑定组件的详细文档"
---

## 配置

要设置 cron 绑定，请创建一个类型为 `bindings.cron` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 15m" # valid cron schedule  
```

## 元数据字段规范

| 字段       | 必填 | 绑定支持         | 详情                                                | 示例             |
| -------- |:--:| ------------ | ------------------------------------------------- | -------------- |
| schedule | Y  | Input/Output | 要用的有效的 cron 时间表。 请参阅[这里](#schedule-format)了解更多详情。 | `"@every 15m"` |

### 计划格式

Dapr cron 绑定支持以下格式：

| 字符 | 描述器    | 可接受值                |
|:--:| ------ | ------------------- |
| 1  | 秒      | 0 to 59, or *       |
| 2  | 分钟     | 0 to 59, or *       |
| 3  | 小时     | 0 to 23, or * (UTC) |
| 4  | 月份中的天  | 1 to 31, or *       |
| 5  | 月      | 1 to 12, or *       |
| 6  | 一周中的一天 | 0-7(0和7代表星期日)，或 *   |

例如:

* `30 * * * * *` - 每 30 秒
* `0 15 * * *` - 每 15 分钟
* `0 30 3-6, 20-23 * *` - 每半小时在上午3-6点，晚上8-11点范围内
* `CRON_TZ=America/New_York 0 0 30 04 * * *` - 每天早上4:30纽约时间

> 您可以在[这里](https://en.wikipedia.org/wiki/Cron)了解更多关于cron和支持的格式

为便于使用，Dapr cron 绑定也支持少量快捷方式：

* `@every 15 s` 的`s` 就是秒， `m` 为分钟， `g` 就是小时
* `@daily` 或 `@hourly` 它是从绑定初始化之时起运行的

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

字段名为 `ttlInSeconds`。

- `delete`

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
