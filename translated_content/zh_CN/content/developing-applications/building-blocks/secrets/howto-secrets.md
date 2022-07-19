---
type: docs
title: "操作方式：获取密钥"
linkTitle: "操作方式：获取密钥"
weight: 2000
description: "使用密钥存储构建块安全地获取密钥"
---

这篇文章提供了关于如何在你的代码中使用 Dapr 的密钥 API 来充分利用 [密钥仓库构建块]({{<ref secrets-overview>}}) 的指导。 密钥 API 允许您从配置的密钥存储轻松获取应用程序代码中的密钥。

## 示例

以下的示例简述了一个订单处理程序。 在这个例子中，有一个订单处理服务，它有一个 Dapr sidecar。 订单处理服务使用 Dapr 将一个秘密存储在本地秘密存储中。

<img src="/images/building-block-secrets-management-example.png" width=1000 alt="显示示例服务的服务调用的图示">

## 建立一个密钥存储

在获取应用程序代码中的密钥之前，您必须配置一个密钥存储组件。 就本指南而言，作为一个示例，您将配置一个本地的密钥存储，该仓库使用本地的 JSON 文件来存储密钥。

{{% alert title="Warning" color="warning" %}}
在生产级应用程序中，不建议使用本地机密存储。 你可以在这里找到其他替代品 []({{<ref supported-secret-stores >}}) 来安全地管理你的秘密。
{{% /alert %}}

创建一个名为 `secrets.json` 的文件，包含以下内容：

```json
{
   "secret": "Order Processing pass key"
}
```

将您的组件文件创建一个目录，名为 `components` ，并在其中创建一个名为 `localSecretStore.yaml` 的文件，并包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: secrets.json  #path to secrets file
  - name: nestedSeparator
    value: ":"
```
> 注意：秘密存储JSON的路径是相对于你调用 `dapr run ` 的地方。

要配置不同类型的密钥存储，请参阅关于 [如何配置密钥存储]({{<ref setup-secret-store>}}) 并审阅 [支持的密钥存储]({{<ref supported-secret-stores >}}) 查看不同密钥存储解决方案所需的具体细节。
## 获取密钥

与应用程序一起运行 Dapr sidecar。

{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}
```bash
dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ./components dotnet run
```
{{% /codetab %}}


{{% codetab %}}
```bash
dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ./components mvn spring-boot:run
```
{{% /codetab %}}


{{% codetab %}}
```bash
dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ./components python3 OrderProcessingService.py
```
{{% /codetab %}}


{{% codetab %}}
```bash
dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ./components go run OrderProcessingService.go
```
{{% /codetab %}}


{{% codetab %}}
```bash
dapr run --app-id orderprocessingservice --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ./components npm start
```
{{% /codetab %}}

{{< /tabs >}}

通过使用secrets API调用Dapr sidecar获取秘密。

```bash
curl http://localhost:3601/v1.0/secrets/localsecretstore/secret
```

对于完整的 API 引用，请访问 [这里]({{< ref secrets_api.md >}})。

## 从你的代码调用密钥 API

一旦你有了秘密存储，就可以调用 Dapr 来从你的应用代码中获取秘密。 下面是利用 Dapr SDK 进行服务调用的代码示例。

{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}
```csharp
//dependencies
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Text.Json;

//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string SECRET_STORE_NAME = "localsecretstore";
            using var client = new DaprClientBuilder().Build();
            //Using Dapr SDK to get a secret
            var secret = await client.GetSecretAsync(SECRET_STORE_NAME, "secret");
            Console.WriteLine($"Result: {string.Join(", ", secret)}");
        }
    }
}
```
{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;


//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);
    private static final ObjectMapper JSON_SERIALIZER = new ObjectMapper();

    private static final String SECRET_STORE_NAME = "localsecretstore";

    public static void main(String[] args) throws InterruptedException, JsonProcessingException {
        DaprClient client = new DaprClientBuilder().build();
        //Using Dapr SDK to get a secret
        Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
        log.info("Result: " + JSON_SERIALIZER.writeValueAsString(secret));
    }
}
```
{{% /codetab %}}

{{% codetab %}}

```python
#dependencies 
import random
from time import sleep    
import requests
import logging
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem
from dapr.clients.grpc._request import TransactionalStateOperation, TransactionOperationType

#code
logging.basicConfig(level = logging.INFO)
DAPR_STORE_NAME = "localsecretstore"
key = 'secret'

with DaprClient() as client:
    #Using Dapr SDK to get a secret
    secret = client.get_secret(store_name=DAPR_STORE_NAME, key=key)
    logging.info('Result: ')
    logging.info(secret.secret)
    #Using Dapr SDK to get bulk secrets
    secret = client.get_bulk_secret(store_name=DAPR_STORE_NAME)
    logging.info('Result for bulk secret: ')
    logging.info(sorted(secret.secrets.items()))
```
{{% /codetab %}}

{{% codetab %}}

```go
//dependencies 
import (
    "context"
    "log"

    dapr "github.com/dapr/go-sdk/client"
)

//code
func main() {
    client, err := dapr.NewClient()
    SECRET_STORE_NAME := "localsecretstore"
    if err != nil {
        panic(err)
    }
    defer client.Close()
    ctx := context.Background()
     //Using Dapr SDK to get a secret
    secret, err := client.GetSecret(ctx, SECRET_STORE_NAME, "secret", nil)
    if secret != nil {
        log.Println("Result : ")
        log.Println(secret)
    }
    //Using Dapr SDK to get bulk secrets
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
//dependencies 
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 

async function main() {
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const SECRET_STORE_NAME = "localsecretstore";
    //Using Dapr SDK to get a secret
    var secret = await client.secret.get(SECRET_STORE_NAME, "secret");
    console.log("Result: " + secret);
    //Using Dapr SDK to get bulk secrets
    secret = await client.secret.getBulk(SECRET_STORE_NAME);
    console.log("Result for bulk: " + secret);
}

main();
```
{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Dapr 密钥概述]({{<ref secrets-overview>}})
- [密钥 API 参考]({{<ref secrets_api>}})
- [配置密钥存储]({{<ref setup-secret-store>}})
- [支持的密钥]({{<ref supported-secret-stores>}})
- [在组件中使用密钥]({{<ref component-secrets>}})
- [密钥存储快速入门](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore)
