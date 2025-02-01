---
type: docs
title: "在 Kubernetes Job 中运行 Dapr"
linkTitle: "Kubernetes Jobs"
weight: 80000
description: "在 Kubernetes Job 环境中使用 Dapr API"
---

Dapr sidecar 被设计为一个长期运行的进程。在 Kubernetes Job 的环境中，这种行为可能会阻碍作业的完成。

为了解决这个问题，Dapr sidecar 提供了一个 `Shutdown` 端点，用于关闭 sidecar。

在运行一个基本的 Kubernetes Job 时，你需要调用 sidecar 的 `/shutdown` 端点，以便优雅地停止 sidecar，并使作业被视为 `Completed`。

如果作业在没有调用 `Shutdown` 的情况下完成，作业会处于 `NotReady` 状态，而 `daprd` 容器会一直运行下去。

停止 Dapr sidecar 会导致容器中的就绪性和存活性探测失败。

为了防止 Kubernetes 尝试重启你的作业，请将作业的 `restartPolicy` 设置为 `Never`。

在调用 shutdown HTTP API 时，请确保使用 *POST* HTTP 动词。例如：

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: job-with-shutdown
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "with-shutdown"
    spec:
      containers:
      - name: job
        image: alpine
        command: ["/bin/sh", "-c", "apk --no-cache add curl && sleep 20 && curl -X POST localhost:3500/v1.0/shutdown"]
      restartPolicy: Never
```

你也可以从任何 Dapr SDK 调用 `Shutdown`。例如，对于 Go SDK：

```go
package main

import (
	"context"
	"log"
	"os"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
  client, err := dapr.NewClient()
  if err != nil {
    log.Panic(err)
  }
  defer client.Close()
  defer client.Shutdown()
  // Job
}
```

## 相关链接

- [在 Kubernetes 上部署 Dapr]({{< ref kubernetes-deploy.md >}})
- [在 Kubernetes 上升级 Dapr]({{< ref kubernetes-upgrade.md >}})
