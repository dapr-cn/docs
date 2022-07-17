---
type: docs
title: "Health API reference"
linkTitle: "健康状况 API"
description: "关于健康状况 API 的详细文档"
weight: 700
---

Dapr 提供可以指示其准备就绪或活跃度状况的健康检查探针

## 获取 Dapr 健康状态

获取 Dapr 的健康状态。

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/healthz
```

### HTTP 响应码

| 响应码 | 描述        |
| --- | --------- |
| 204 | dapr 运行正常 |
| 500 | dapr 运行异常 |

### URL 参数

| 参数       | 描述      |
| -------- | ------- |
| daprPort | Dapr 端口 |

### 示例

```shell
curl http://localhost:3500/v1.0/healthz
```

