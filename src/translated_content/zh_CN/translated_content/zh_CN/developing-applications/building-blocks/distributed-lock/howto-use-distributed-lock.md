---
type: docs
title: 方法：使用锁
linkTitle: 方法：使用锁
weight: 2000
description: 学习如何使用分布式锁来提供对资源的独占访问权限
---

现在，你已了解 Dapr 分布式锁 构建块提供的功能，请了解它如何在你的服务中工作。 在本指南中，一个示例应用程序将使用 Redis 锁组件获取一个锁，以演示如何锁定资源。 有关支持的锁存储的列表，请参阅[此参考页面](/reference/components-reference/supported-locks/)。

在下图中，同一应用程序的两个实例获取了一个锁，其中一个实例成功，另一个实例被拒绝。

<img src="/images/building-block-lock-example.png" width=1000 alt="The diagram below shows two instances of the same application acquiring a lock, where one instance is successful and the other is denied">

下图显示的是同一个应用程序的两个实例，其中一个实例释放了锁，另一个实例就能获取锁。

<img src="/images/building-block-lock-unlock-example.png" width=1000 alt="Diagram showing releasing a lock from multiple instances of same application">

下图显示了不同应用程序的两个实例，它们在同一资源上获取了不同的锁。

<img src="/images/building-block-lock-multiple-example.png" width=1000 alt="The diagram below shows two instances of different applications, acquiring different locks on the same resource">

### 配置锁组件

将以下组件文件保存到您的机器上的[默认组件文件夹]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}})中。

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



{{% codetab %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/lock/lockstore
   -H 'Content-Type: application/json'
   -d '{"resourceId":"my_file_name", "lockOwner":"random_id_abc123", "expiryInSeconds": 60}'
```



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



{{< /tabs >}}

### 释放现有锁



{{% codetab %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/unlock/lockstore
   -H 'Content-Type: application/json'
   -d '{"resourceId":"my_file_name", "lockOwner":"random_id_abc123"}'
```



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



{{< /tabs >}}

## 下一步

阅读 [分布式锁 API 概述]({{< ref distributed-lock-api-overview\.md >}}) 了解更多信息。
