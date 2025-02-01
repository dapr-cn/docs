---
type: docs
title: "作业API参考"
linkTitle: "作业API"
description: "关于作业API的详细文档"
weight: 1300
---

{{% alert title="注意" color="primary" %}}
作业API目前处于测试阶段。
{{% /alert %}}

使用作业API，您可以预定未来的作业和任务。

> HTTP API仅供开发和测试使用。在生产环境中，强烈推荐使用SDK，因为它们实现了gRPC API，提供比HTTP API更高的性能和功能。

## 调度作业

通过名称来调度作业。

```
POST http://localhost:3500/v1.0-alpha1/jobs/<name>
```

### URL参数

{{% alert title="注意" color="primary" %}}
必须提供`schedule`或`dueTime`中的至少一个，也可以同时提供。
{{% /alert %}}

参数 | 描述
--------- | -----------
`name` | 您正在调度的作业的名称
`data` | 一个JSON格式的值或对象。
`schedule` | 作业的可选计划。格式详情如下。
`dueTime` | 作业应激活的时间，或"一次性"时间，如果未提供其他调度类型字段。接受RFC3339格式的时间字符串、Go持续时间字符串（从创建时间计算）或非重复的ISO8601格式。
`repeats` | 作业应触发的次数。如果未设置，作业将无限期运行或直到过期。
`ttl` | 作业的生存时间或过期时间。接受RFC3339格式的时间字符串、Go持续时间字符串（从作业创建时间计算）或非重复的ISO8601格式。

#### schedule
`schedule`接受systemd计时器风格的cron表达式，以及以'@'为前缀的人类可读周期字符串。

systemd计时器风格的cron表达式包含6个字段：
秒 | 分钟 | 小时 | 月中的某天 | 月份        | 星期中的某天
---     | ---     | ---   | ---          | ---          | ---
0-59    | 0-59    | 0-23  | 1-31         | 1-12/jan-dec | 0-6/sun-sat

##### 示例 1
"0 30 * * * *" - 每小时的30分钟

##### 示例 2
"0 15 3 * * *" - 每天03:15

周期字符串表达式：
条目                  | 描述                                | 等同于
-----                  | -----------                                | -------------
@every <duration>      | 每隔<duration>运行一次 (例如 '@every 1h30m') | N/A
@yearly (或 @annually) | 每年运行一次，午夜，1月1日        | 0 0 0 1 1 *
@monthly               | 每月运行一次，午夜，月初 | 0 0 0 1 * *
@weekly                | 每周运行一次，周日午夜        | 0 0 0 * * 0
@daily (或 @midnight)  | 每天运行一次，午夜                   | 0 0 0 * * *
@hourly                | 每小时运行一次，整点        | 0 0 * * * *


### 请求体

```json
{
  "data": "some data",
  "dueTime": "30s"
}
```

### HTTP响应代码

代码 | 描述
---- | -----------
`204`  | 已接受
`400`  | 请求格式错误
`500`  | 请求格式正确，但dapr代码或调度器控制平面服务中出错

### 响应内容

以下示例curl命令创建一个名为`jobforjabba`的作业，并指定`schedule`、`repeats`和`data`。

```bash
$ curl -X POST \
  http://localhost:3500/v1.0-alpha1/jobs/jobforjabba \
  -H "Content-Type: application/json" \
  -d '{
        "data": "{\"value\":\"Running spice\"}",
        "schedule": "@every 1m",
        "repeats": 5
    }'
```

## 获取作业数据

通过名称获取作业。

```
GET http://localhost:3500/v1.0-alpha1/jobs/<name>
```

### URL参数

参数 | 描述
--------- | -----------
`name` | 您正在检索的已调度作业的名称

### HTTP响应代码

代码 | 描述
---- | -----------
`200`  | 已接受
`400`  | 请求格式错误
`500`  | 请求格式正确，但作业不存在或dapr代码或调度器控制平面服务中出错

### 响应内容

运行以下示例curl命令后，返回的响应是包含作业`name`、`dueTime`和`data`的JSON。

```bash
$ curl -X GET http://localhost:3500/v1.0-alpha1/jobs/jobforjabba -H "Content-Type: application/json"
```

```json
{
  "name": "jobforjabba",
  "schedule": "@every 1m",
  "repeats": 5,
  "data": 123
}
```
## 删除作业

删除一个命名的作业。

```
DELETE http://localhost:3500/v1.0-alpha1/jobs/<name>
```

### URL参数

参数 | 描述
--------- | -----------
`name` | 您正在删除的作业的名称

### HTTP响应代码

代码 | 描述
---- | -----------
`204`  | 已接受
`400`  | 请求格式错误
`500`  | 请求格式正确，但dapr代码或调度器控制平面服务中出错

### 响应内容

在以下示例curl命令中，名为`test1`且app-id为`sub`的作业将被删除

```bash
$ curl -X DELETE http://localhost:3500/v1.0-alpha1/jobs/jobforjabba -H "Content-Type: application/json"
```


## 下一步

[作业API概述]({{< ref jobs-overview.md >}})
