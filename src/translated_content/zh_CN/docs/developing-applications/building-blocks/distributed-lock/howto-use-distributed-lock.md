---
type: docs
title: "操作指南：使用锁"
linkTitle: "操作指南：使用锁"
weight: 2000
description: "学习如何使用分布式锁来提供对资源的独占访问"
---

了解了Dapr分布式锁API构建块的功能后，学习如何在服务中使用它。在本指南中，我们将通过一个示例应用程序演示如何使用Redis锁组件获取锁。有关支持的锁存储类型，请参阅[此参考页面](/reference/components-reference/supported-locks/)。

下图展示了相同应用程序的两个实例尝试获取锁，其中一个成功，另一个被拒绝。

<img src="/images/building-block-lock-example.png" width=1000 alt="下图显示了相同应用程序的两个实例获取锁，其中一个实例成功，另一个被拒绝">

下图展示了相同应用程序的两个实例，其中一个实例释放锁，另一个实例随后成功获取锁。

<img src="/images/building-block-lock-unlock-example.png" width=1000 alt="图示显示了从相同应用程序的多个实例中释放锁">

下图展示了不同应用程序的两个实例在同一资源上获取不同的锁。

<img src="/images/building-block-lock-multiple-example.png" width=1000 alt="下图显示了不同应用程序的两个实例，在同一资源上获取不同的锁">

### 配置锁组件

将以下组件文件保存到您机器上的[默认组件文件夹]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: lockstore
spec:
  type: lock.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: <PASSWORD>
```

### 获取锁

{{< tabs HTTP ".NET" Go >}}

{{% codetab %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/lock/lockstore
   -H 'Content-Type: application/json'
   -d '{"resourceId":"my_file_name", "lockOwner":"random_id_abc123", "expiryInSeconds": 60}'
```

{{% /codetab %}}

{{% codetab %}}

```csharp
using System;
using Dapr.Client;

namespace LockService
{
    class Program
    {
        [Obsolete("Distributed Lock API is in Alpha, this can be removed once it is stable.")]
        static async Task Main(string[] args)
        {
            string DAPR_LOCK_NAME = "lockstore";
            string fileName = "my_file_name";
            var client = new DaprClientBuilder().Build();
    
            await using (var fileLock = await client.Lock(DAPR_LOCK_NAME, fileName, "random_id_abc123", 60))
            {
                if (fileLock.Success)
                {
                    Console.WriteLine("Success");
                }
                else
                {
                    Console.WriteLine($"Failed to lock {fileName}.");
                }
            }
        }
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
    "fmt"

    dapr "github.com/dapr/go-sdk/client"
)

func main() {
    client, err := dapr.NewClient()
    if err != nil {
        panic(err)
    }
    defer client.Close()
    
    resp, err := client.TryLockAlpha1(ctx, "lockstore", &dapr.LockRequest{
			LockOwner:         "random_id_abc123",
			ResourceID:      "my_file_name",
			ExpiryInSeconds: 60,
		})

    fmt.Println(resp.Success)
}
```

{{% /codetab %}}

{{< /tabs >}}

### 解锁现有锁

{{< tabs HTTP ".NET" Go >}}

{{% codetab %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/unlock/lockstore
   -H 'Content-Type: application/json'
   -d '{"resourceId":"my_file_name", "lockOwner":"random_id_abc123"}'
```

{{% /codetab %}}

{{% codetab %}}

```csharp
using System;
using Dapr.Client;

namespace LockService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string DAPR_LOCK_NAME = "lockstore";
            var client = new DaprClientBuilder().Build();

            var response = await client.Unlock(DAPR_LOCK_NAME, "my_file_name", "random_id_abc123"));
            Console.WriteLine(response.status);
        }
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
    "fmt"

    dapr "github.com/dapr/go-sdk/client"
)

func main() {
    client, err := dapr.NewClient()
    if err != nil {
        panic(err)
    }
    defer client.Close()
    
    resp, err := client.UnlockAlpha1(ctx, "lockstore", &UnlockRequest{
			LockOwner:    "random_id_abc123",
			ResourceID: "my_file_name",
		})

    fmt.Println(resp.Status)
}
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

阅读[分布式锁API概述]({{< ref distributed-lock-api-overview.md >}})以了解更多信息。