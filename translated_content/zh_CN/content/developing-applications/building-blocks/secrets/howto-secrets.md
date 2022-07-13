---
type: docs
title: "指南：获取密钥"
linkTitle: "指南：获取密钥"
weight: 2000
description: "使用密钥存储构建块安全地获取密钥"
---

This guide demonstrates how to use Dapr's secrets API in your code to leverage the [secrets store building block]({{< ref secrets-overview >}}). With the secrets API, you easily retrieve secrets in your application code from a configured secret store.

<img src="/images/building-block-secrets-management-example.png" width=1000 alt="显示示例服务的服务调用的图示">

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the secrets management quickstart]({{< ref secrets-quickstart.md >}}) for a quick walk-through on how to use the secrets API.

{{% /alert %}}

## 建立一个密钥存储

Before retrieving secrets in your application's code, you must configure a secret store component. This example configures a local secret store which uses a local JSON file to store secrets.

{{% alert title="Warning" color="warning" %}}
在生产级应用程序中，不建议使用本地机密存储。 [Find alternatives]({{< ref supported-secret-stores >}}) to securely manage your secrets.
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

{{% alert title="Warning" color="warning" %}}
The path to the secret store JSON is relative to where you call `dapr run` from.
{{% /alert %}}

For more information, see how to [configure a different kind of secret store]({{< ref setup-secret-store >}}) and review [supported secret stores]({{< ref supported-secret-stores >}}) to see specific details required for different secret store solutions.

## 获取密钥

通过使用secrets API调用Dapr sidecar获取秘密。

```bash
curl http://localhost:3601/v1.0/secrets/localsecretstore/secret
```

See a [full API reference]({{< ref secrets_api.md >}}).

## 从你的代码调用密钥 API

一旦你有了秘密存储，就可以调用Dapr来从你的应用代码中获取秘密。 下面是利用 Dapr SDK 进行服务调用的代码示例。

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
- [Secret stores tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/secretstore)