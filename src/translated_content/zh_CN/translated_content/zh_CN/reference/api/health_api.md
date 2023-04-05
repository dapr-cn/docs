---
type: docs
title: "健康状态 API 参考"
linkTitle: "健康状况 API"
description: "关于健康状况 API 的详细文档"
weight: 1000
---

Dapr provides health checking probes that can be used as readiness or liveness of Dapr.

## 获取 Dapr 健康状态

获取 Dapr 的健康状态。

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/healthz
```

### HTTP Response Codes

| Code | 说明                  |
| ---- | ------------------- |
| 204  | dapr is healthy     |
| 500  | dapr is not healthy |

### URL 参数

| Parameter | 说明      |
| --------- | ------- |
| daprPort  | Dapr 端口 |

### Examples

```shell
curl -i http://localhost:3500/v1.0/healthz
```

