---
type: docs
title: "健康状态 API 参考"
linkTitle: "健康状况 API"
description: "关于健康状况 API 的详细文档"
weight: 100
---

Dapr 提供可以指示其就绪或存活状况的健康检查探针

## 获取 Dapr 健康状态

获取 Dapr 的健康状态。

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/healthz
```

### HTTP 响应码

| 代码  | 说明        |
| --- | --------- |
| 204 | dapr 运行正常 |
| 500 | dapr 运行异常 |

### URL 参数

| 参数       | 说明       |
| -------- | -------- |
| daprPort | Dapr 端口。 |

### 示例

```shell
curl http://localhost:3500/v1.0/healthz
```

