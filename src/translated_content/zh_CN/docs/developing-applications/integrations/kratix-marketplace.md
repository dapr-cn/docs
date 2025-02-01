---
type: docs
title: "如何：与 Kratix 集成"
linkTitle: "Kratix 市场"
weight: 8000
description: "使用 Dapr promise 与 Kratix 集成"
---

在 [Kratix 市场](https://docs.kratix.io/marketplace) 中，Dapr 可以用于构建满足您需求的定制平台。

{{% alert title="注意" color="warning" %}}
Dapr Helm chart 生成的静态公钥和私钥对会被发布在仓库中。此 promise 仅适用于本地演示。如果您计划将此 promise 用于其他用途，建议手动更新 promise 中的所有 secret，并使用您自己的凭据。
{{% /alert %}}

只需安装 Dapr Promise，即可在所有匹配的集群上安装 Dapr。

{{< button text="安装 Dapr Promise" link="https://github.com/syntasso/kratix-marketplace/tree/main/dapr" >}}