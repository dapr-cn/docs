---
type: docs
title: "使用 Kubernetes 作业运行 Dapr"
linkTitle: "Kubernetes Jobs"
weight: 60000
description: "在 Kubernetes 作业上下文中使用 Dapr API"
---

# Kubernetes Job

Dapr sidecar 被设计为一个长时间运行的进程，在 [Kubernetes Job 的上下文中，](https://kubernetes.io/docs/concepts/workloads/controllers/job/) 这种行为可能会阻止你的作业完成。 为了解决此问题，Dapr sidecar 有一个端点，用于 `Shutdown` sidecar。

在运行基本 [Kubernetes 作业](https://kubernetes.io/docs/concepts/workloads/controllers/job/) 时，您需要调用 `/shutdown` 端点，以便 sidecar 正常停止，并且作业将被视为 `Completed`。

当一个作业在没有调用 `Shutdown` 的情况下完成时，你的作业将处于 `NotReady` 状态，只有 `daprd` 容器在无休止地运行。

在调用关闭 API 时，请确保并使用 *POST* HTTP verb。

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

您还可以从任何 Dapr SDK 调用 `Shutdown`

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
