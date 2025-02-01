---
type: docs
title: "如何检索 Secret"
linkTitle: "如何检索 Secret"
weight: 2000
description: "使用 Secret 存储构建块安全地检索 Secret"
---

在了解了[Dapr Secret 构建块的功能]({{< ref secrets-overview >}})后，接下来学习如何在服务中使用它。本指南将演示如何调用 Secret API，并从配置的 Secret 存储中将 Secret 检索到应用程序代码中。

<img src="/images/howto-secrets/secrets-mgmt-overview.png" width=1000 alt="示例服务的 Secret 管理示意图。">

{{% alert title="提示" color="primary" %}}
如果您还没有尝试过，[请先查看 Secret 管理快速入门]({{< ref secrets-quickstart.md >}})，以快速了解如何使用 Secret API。
{{% /alert %}}

## 配置 Secret 存储

在应用程序代码中检索 Secret 之前，您需要先配置一个 Secret 存储组件。此示例配置了一个使用本地 JSON 文件存储 Secret 的 Secret 存储。

{{% alert title="警告" color="warning" %}}
在生产环境中，不建议使用本地 Secret 存储。[请查看其他安全管理 Secret 的方案]({{< ref supported-secret-stores >}})。
{{% /alert %}}

在项目目录中，创建一个名为 `secrets.json` 的文件，内容如下：

```json
{
   "secret": "Order Processing pass key"
}
```

创建一个名为 `components` 的新目录。进入该目录并创建一个名为 `local-secret-store.yaml` 的组件文件，内容如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: secrets.json  # Secret 文件的路径
  - name: nestedSeparator
    value: ":"
```

{{% alert title="注意" color="warning" %}}
Secret 存储 JSON 的路径是相对于您执行 `dapr run` 命令的位置。
{{% /alert %}}

更多信息：

- 查看如何[配置不同类型的 Secret 存储]({{< ref setup-secret-store >}})。
- 查看[支持的 Secret 存储]({{< ref supported-secret-stores >}})以了解不同 Secret 存储解决方案的具体细节。

## 获取 Secret

通过调用 Dapr sidecar 的 Secret API 来获取 Secret：

```bash
curl http://localhost:3601/v1.0/secrets/localsecretstore/secret
```

查看[完整的 API 参考]({{< ref secrets_api.md >}})。

## 从代码中调用 Secret API

现在您已经设置了本地 Secret 存储，可以通过 Dapr 从应用程序代码中获取 Secret。以下是利用 Dapr SDK 检索 Secret 的代码示例。

{{< tabs ".NET" Java Python Go JavaScript>}}

{{% codetab %}}

```csharp
// 依赖项
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Text.Json;

// 代码
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string SECRET_STORE_NAME = "localsecretstore";
            using var client = new DaprClientBuilder().Build();
            // 使用 Dapr SDK 获取 Secret
            var secret = await client.GetSecretAsync(SECRET_STORE_NAME, "secret");
            Console.WriteLine($"Result: {string.Join(", ", secret)}");
        }
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```java
// 依赖项
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

// 代码
@SpringBootApplication
public class OrderProcessingServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);
    private static final ObjectMapper JSON_SERIALIZER = new ObjectMapper();

    private static final String SECRET_STORE_NAME = "localsecretstore";

    public static void main(String[] args) throws InterruptedException, JsonProcessingException {
        DaprClient client = new DaprClientBuilder().build();
        // 使用 Dapr SDK 获取 Secret
        Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
        log.info("Result: " + JSON_SERIALIZER.writeValueAsString(secret));
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```python
# 依赖项 
import random
from time import sleep    
import requests
import logging
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem
from dapr.clients.grpc._request import TransactionalStateOperation, TransactionOperationType

# 代码
logging.basicConfig(level = logging.INFO)
DAPR_STORE_NAME = "localsecretstore"
key = 'secret'

with DaprClient() as client:
    # 使用 Dapr SDK 获取 Secret
    secret = client.get_secret(store_name=DAPR_STORE_NAME, key=key)
    logging.info('Result: ')
    logging.info(secret.secret)
    # 使用 Dapr SDK 获取批量 Secret
    secret = client.get_bulk_secret(store_name=DAPR_STORE_NAME)
    logging.info('Result for bulk secret: ')
    logging.info(sorted(secret.secrets.items()))
```

{{% /codetab %}}

{{% codetab %}}

```go
// 依赖项 
import (
	"context"
	"log"

	dapr "github.com/dapr/go-sdk/client"
)

// 代码
func main() {
	client, err := dapr.NewClient()
	SECRET_STORE_NAME := "localsecretstore"
	if err != nil {
		panic(err)
	}
	defer client.Close()
	ctx := context.Background()
     // 使用 Dapr SDK 获取 Secret
	secret, err := client.GetSecret(ctx, SECRET_STORE_NAME, "secret", nil)
	if secret != nil {
		log.Println("Result : ")
		log.Println(secret)
	}
    // 使用 Dapr SDK 获取批量 Secret
	secretBulk, err := client.GetBulkSecret(ctx, SECRET_STORE_NAME, nil)

	if secret != nil {
		log.Println("Result for bulk: ")
		log.Println(secretBulk)
	}
}
```

{{% /codetab %}}

{{% codetab %}}

```javascript
// 依赖项 
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr'; 

// 代码
const daprHost = "127.0.0.1"; 

async function main() {
    const client = new DaprClient({
        daprHost,
        daprPort: process.env.DAPR_HTTP_PORT,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
    });
    const SECRET_STORE_NAME = "localsecretstore";
    // 使用 Dapr SDK 获取 Secret
    var secret = await client.secret.get(SECRET_STORE_NAME, "secret");
    console.log("Result: " + secret);
    // 使用 Dapr SDK 获取批量 Secret
    secret = await client.secret.getBulk(SECRET_STORE_NAME);
    console.log("Result for bulk: " + secret);
}

main();
```

{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- 查看[Dapr Secret API 功能]({{< ref secrets-overview >}})。
- 学习如何[使用 Secret 范围]({{< ref secrets-scopes >}})
- 阅读[Secret API 参考]({{< ref secrets_api >}})并查看[支持的 Secret]({{< ref supported-secret-stores >}})。
- 学习如何[设置不同的 Secret 存储组件]({{< ref setup-secret-store >}})以及如何[在组件中引用 Secret]({{< ref component-secrets >}})。
