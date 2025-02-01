---
type: docs
title: "操作指南：使用 conversation API 与 LLM 对话"
linkTitle: "操作指南：对话"
weight: 2000
description: "学习如何简化与大型语言模型交互的复杂性"
---

{{% alert title="Alpha" color="primary" %}}
conversation API 目前处于 [alpha]({{< ref "certification-lifecycle.md#certification-levels" >}}) 阶段。
{{% /alert %}}

让我们开始使用 [conversation API]({{< ref conversation-overview.md >}})。在本指南中，您将学习如何：

- 配置一个可用的 Dapr 组件（echo），以便与 conversation API 搭配使用。
- 将 conversation 客户端集成到您的应用程序中。
- 使用 `dapr run` 启动连接。

## 配置 conversation 组件

创建一个名为 `conversation.yaml` 的新配置文件，并将其保存到应用程序目录中的组件或配置子文件夹中。

为您的 `conversation.yaml` 文件选择 [合适的 conversation 组件规范]({{< ref supported-conversation >}})。

在这个场景中，我们使用一个简单的 echo 组件。

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: echo
spec:
  type: conversation.echo
  version: v1
```

## 集成 conversation 客户端

以下示例使用 HTTP 客户端向 Dapr 的 sidecar HTTP 端点发送 POST 请求。您也可以使用 [Dapr SDK 客户端]({{< ref "#related-links" >}})。

{{< tabs ".NET" "Go" "Rust" >}}

 <!-- .NET -->
{{% codetab %}}

```csharp
using Dapr.AI.Conversation;
using Dapr.AI.Conversation.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprConversationClient();

var app = builder.Build();

var conversationClient = app.Services.GetRequiredService<DaprConversationClient>();
var response = await conversationClient.ConverseAsync("conversation",
    new List<DaprConversationInput>
    {
        new DaprConversationInput(
            "Please write a witty haiku about the Dapr distributed programming framework at dapr.io",
            DaprConversationRole.Generic)
    });

Console.WriteLine("Received the following from the LLM:");
foreach (var resp in response.Outputs)
{
    Console.WriteLine($"\t{resp.Result}");
}
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

```go
package main

import (
	"context"
	"fmt"
	dapr "github.com/dapr/go-sdk/client"
	"log"
)

func main() {
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}

	input := dapr.ConversationInput{
		Message: "Please write a witty haiku about the Dapr distributed programming framework at dapr.io",
		// Role:     nil, // Optional
		// ScrubPII: nil, // Optional
	}

	fmt.Printf("conversation input: %s\n", input.Message)

	var conversationComponent = "echo"

	request := dapr.NewConversationRequest(conversationComponent, []dapr.ConversationInput{input})

	resp, err := client.ConverseAlpha1(context.Background(), request)
	if err != nil {
		log.Fatalf("err: %v", err)
	}

	fmt.Printf("conversation output: %s\n", resp.Outputs[0].Result)
}
```

{{% /codetab %}}

 <!-- Rust -->
{{% codetab %}}

```rust
use dapr::client::{ConversationInputBuilder, ConversationRequestBuilder};
use std::thread;
use std::time::Duration;

type DaprClient = dapr::Client<dapr::client::TonicClient>;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Sleep to allow for the server to become available
    thread::sleep(Duration::from_secs(5));

    // Set the Dapr address
    let address = "https://127.0.0.1".to_string();

    let mut client = DaprClient::connect(address).await?;

    let input = ConversationInputBuilder::new("Please write a witty haiku about the Dapr distributed programming framework at dapr.io").build();

    let conversation_component = "echo";

    let request =
        ConversationRequestBuilder::new(conversation_component, vec![input.clone()]).build();

    println!("conversation input: {:?}", input.message);

    let response = client.converse_alpha1(request).await?;

    println!("conversation output: {:?}", response.outputs[0].result);
    Ok(())
}
```

{{% /codetab %}}

{{< /tabs >}}

## 启动 conversation 连接

使用 `dapr run` 命令启动连接。例如，在这个场景中，我们在一个应用程序上运行 `dapr run`，其应用程序 ID 为 `conversation`，并指向 `./config` 目录中的 conversation YAML 文件。

{{< tabs ".NET" "Go" "Rust" >}}

 <!-- .NET -->
{{% codetab %}}

```bash
dapr run --app-id conversation --dapr-grpc-port 50001 --log-level debug --resources-path ./config -- dotnet run
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

```bash
dapr run --app-id conversation --dapr-grpc-port 50001 --log-level debug --resources-path ./config -- go run ./main.go
```

**预期输出**

```
  - '== APP == conversation output: Please write a witty haiku about the Dapr distributed programming framework at dapr.io'
```

{{% /codetab %}}

 <!-- Rust -->
{{% codetab %}}

```bash
dapr run --app-id=conversation --resources-path ./config --dapr-grpc-port 3500 -- cargo run --example conversation
```

**预期输出**

```
  - 'conversation input: hello world'
  - 'conversation output: hello world'
```

{{% /codetab %}}

{{< /tabs >}}

## 相关链接

尝试使用支持的 SDK 仓库中提供的完整示例来体验 conversation API。

{{< tabs ".NET" "Go" "Rust" >}}

 <!-- .NET -->
{{% codetab %}}

[Dapr conversation 示例与 .NET SDK](https://github.com/dapr/dotnet-sdk/tree/master/examples/AI/ConversationalAI)

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

[Dapr conversation 示例与 Go SDK](https://github.com/dapr/go-sdk/tree/main/examples/conversation)

{{% /codetab %}}

 <!-- Rust -->
{{% codetab %}}

[Dapr conversation 示例与 Rust SDK](https://github.com/dapr/rust-sdk/tree/main/examples/src/conversation)

{{% /codetab %}}

{{< /tabs >}}

## 下一步

- [conversation API 参考指南]({{< ref conversation_api.md >}})
- [可用的 conversation 组件]({{< ref supported-conversation >}})
