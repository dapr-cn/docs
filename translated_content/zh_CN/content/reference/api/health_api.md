---
type: docs
title: "Health API reference"
linkTitle: "Health API"
description: "Detailed documentation on the health API"
weight: 700
---

Dapr provides health checking probes that can be used as readiness or liveness of Dapr.

## Get Dapr health state

Gets the health state for Dapr.

### HTTP Request

```http
GET http://localhost:<daprPort>/v1.0/healthz
```

### HTTP Response Codes

| 代码  | 说明                  |
| --- | ------------------- |
| 204 | dapr is healthy     |
| 500 | dapr is not healthy |

### URL Parameters

| 参数       | 描述       |
| -------- | -------- |
| daprPort | Dapr 端口。 |

### Examples

```shell
curl http://localhost:3500/v1.0/healthz
```

