---
type: docs
title: "Health API reference"
linkTitle: "健康状况 API"
description: "Detailed documentation on the health API"
weight: 700
---

Dapr provides health checking probes that can be used as readiness or liveness of Dapr.

## Get Dapr health state

Gets the health state for Dapr.

### HTTP 请求

```http
GET http://localhost:<daprPort>/v1.0/healthz
```

### HTTP 响应码

| 代码  | 说明                  |
| --- | ------------------- |
| 204 | dapr is healthy     |
| 500 | dapr is not healthy |

### URL 参数

| 参数       | 说明       |
| -------- | -------- |
| daprPort | Dapr 端口。 |

### 示例

```shell
curl http://localhost:3500/v1.0/healthz
```

