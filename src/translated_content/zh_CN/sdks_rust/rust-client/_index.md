---
type: docs
title: "使用 Dapr 客户端 Rust SDK 入门"
linkTitle: "客户端"
weight: 20000
description: 如何使用 Dapr Rust SDK 快速上手
no_list: true
---

Dapr 客户端库使您能够从 Rust 应用程序与其他 Dapr 应用程序进行交互。

{{% alert title="注意" color="primary" %}}
Dapr Rust-SDK 目前处于 Alpha 阶段。我们正在努力将其推向稳定版本，这可能会涉及重大更改。
{{% /alert %}}

## 前提条件

- 已安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 已初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- 已安装 [Rust](https://www.rust-lang.org/tools/install)

## 引入客户端库

在您的 `cargo.toml` 文件中添加 Dapr

```toml
[dependencies]
# 其他依赖项
dapr = "0.13.0"
```

您可以引用 `dapr::Client`，或者将其完整路径绑定到一个新名称，如下所示：
```rust
use dapr::Client as DaprClient
```

## 实例化 Dapr 客户端

```rust
const addr: String = "https://127.0.0.1";
const port: String = "50001";

let mut client = dapr::Client::<dapr::client::TonicClient>::connect(addr,
    port).await?;
```

## 功能模块

Rust SDK 允许您与 [Dapr 功能模块]({{< ref building-blocks >}}) 进行交互。

### 服务调用

要在运行 Dapr sidecar 的另一个服务上调用特定方法，Dapr 客户端 Go SDK 提供了以下选项：

调用服务
```rust
let response = client
    .invoke_service("service-to-invoke", "method-to-invoke", Some(data))
    .await
    .unwrap();
```

有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。

### 状态管理

Dapr 客户端提供对状态管理方法的访问：`save_state`、`get_state`、`delete_state`，可以像这样使用：

```rust
let store_name = "store-name";
let state_key = "state-key";

let states = vec![(state_key, ("state-value").as_bytes().to_vec())];

// 使用键 "state-key" 和值 "state-value" 保存状态
client.save_state(store_name, states).await?;

// 获取键 "state-key" 的状态
let response = client.get_state(store_name, state_key, None).await.unwrap();

// 删除键 "state-key" 的状态
client.delete_state(store_name, state_key, None).await?;
```

> **注意：** `save_state` 方法目前执行的是批量保存，但未来可能会进行重构

有关状态管理的完整指南，请访问 [如何：保存和获取状态]({{< ref howto-get-save-state.md >}})。

### 发布消息

要将数据发布到主题上，Dapr Go 客户端提供了一种简单的方法：

```rust
let pubsub_name = "pubsub-name".to_string();
let pubsub_topic = "topic-name".to_string();
let pubsub_content_type = "text/plain".to_string();

let data = "content".to_string().into_bytes();
client
    .publish_event(pubsub_name, pubsub_topic, pubsub_content_type, data, None)
    .await?;
```

有关发布/订阅的完整指南，请访问 [如何：发布和订阅]({{< ref howto-publish-subscribe.md >}})。

## 相关链接

[Rust SDK 示例](https://github.com/dapr/rust-sdk/tree/master/examples)
