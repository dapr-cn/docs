---
type: docs
title: "指南：获取密钥"
linkTitle: "指南：获取密钥"
weight: 2000
description: "使用密钥存储构建块安全地获取密钥"
---

这篇文章提供了关于如何在你的代码中使用 Dapr 的密钥 API 来充分利用 [密钥仓库构建块]({{<ref secrets-overview>}}) 的指导。 密钥 API 允许您从配置的密钥存储轻松获取应用程序代码中的密钥。

## 建立一个密钥存储

在获取应用程序代码中的密钥之前，您必须配置一个密钥存储组件。 就本指南而言，作为一个示例，您将配置一个本地的密钥存储，该仓库使用本地的 JSON 文件来存储密钥。
> 注意：此示例中使用的组件未被加密且不推荐用于生产部署。 您可以在[这里]({{<ref supported-secret-stores >}})找到其它替代项。

创建一个名为 `secrets.json` 的文件，包含以下内容：

```json
{
   "my-secret" : "I'm Batman"
}
```

将您的组件文件创建一个目录，名为 `components` ，并在其中创建一个名为 `localSecretStore.yaml` 的文件，并包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: my-secrets-store
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: <PATH TO SECRETS FILE>/mysecrets.json
  - name: nestedSeparator
    value: ":"
```

请确保用您刚刚创建的 JSON 文件的路径替换 `<密钥路径>`。

要配置不同类型的密钥存储，请参阅关于 [如何配置密钥存储]({{<ref setup-secret-store>}}) 并审阅 [支持的密钥存储]({{<ref supported-secret-stores >}}) 查看不同密钥存储解决方案所需的具体细节。
## 获取密钥

现在运行 Dapr sidecar (在没有应用程序的情况下)

```bash
dapr run --app-id my-app --port 3500 --components-path ./components
```

现在你可以通过使用密钥 API 调用 Dapr sidecar 来获得密钥：

```bash
curl http://localhost:3500/v1.0/secrets/my-secrets-store/my-secret
```

对于完整的 API 引用，请访问 [这里]({{< ref secrets_api.md >}})。

## 从你的代码调用密钥 API

一旦您设置了一个密钥存储，您可以调用 Dapr 从您的应用程序代码中获取密钥。 以下是不同编程语言的几个示例：

{{< tabs "Go" "Javascript" "Python" "Rust" "C#" "PHP" >}}

{{% codetab %}}
```Go
import (
  "fmt"
  "net/http"
)

func main() {
  url := "http://localhost:3500/v1.0/secrets/my-secrets-store/my-secret"

  res, err := http.Get(url)
  if err != nil {
    panic(err)
  }
  defer res.Body.Close()

  body, _ := ioutil.ReadAll(res.Body)
  fmt.Println(string(body))
}
```

{{% /codetab %}}

{{% codetab %}}

```javascript
require('isomorphic-fetch');
const secretsUrl = `http://localhost:3500/v1.0/secrets`;

fetch(`${secretsUrl}/my-secrets-store/my-secret`)
        .then((response) => {
            if (!response.ok) {
                throw "Could not get secret";
            }
            return response.text();
        }).then((secret) => {
            console.log(secret);
        });
```

{{% /codetab %}}

{{% codetab %}}

```python
import requests as req

resp = req.get("http://localhost:3500/v1.0/secrets/my-secrets-store/my-secret")
print(resp.text)
```

{{% /codetab %}}


{{% codetab %}}

```rust
#![deny(warnings)]
use std::{thread};

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let res = reqwest::get("http://localhost:3500/v1.0/secrets/my-secrets-store/my-secret").await?;
    let body = res.text().await?;
    println!("Secret:{}", body);

    thread::park();

    Ok(())
}
```

{{% /codetab %}}

{{% codetab %}}

```csharp
var client = new HttpClient();
var response = await client.GetAsync("http://localhost:3500/v1.0/secrets/my-secrets-store/my-secret");
response.EnsureSuccessStatusCode();

string secret = await response.Content.ReadAsStringAsync();
Console.WriteLine(secret);
```
{{% /codetab %}}

{{% codetab %}}

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create();
$app->run(function(\Dapr\SecretManager $secretManager, \Psr\Log\LoggerInterface $logger) {
    $secret = $secretManager->retrieve(secret_store: 'my-secret-store', name: 'my-secret');
    $logger->alert('got secret: {secret}', ['secret' => $secret]);
});
```

{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Dapr 密钥概述]({{<ref secrets-overview>}})
- [密钥 API 参考]({{<ref secrets_api>}})
- [配置密钥存储]({{<ref setup-secret-store>}})
- [支持的密钥]({{<ref supported-secret-stores>}})
- [在组件中使用密钥]({{<ref component-secrets>}})
- [密钥存储快速入门](https://github.com/dapr/quickstarts/tree/master/secretstore)
