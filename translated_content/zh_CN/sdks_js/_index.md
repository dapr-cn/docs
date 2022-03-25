---
type: 文档
title: "JavaScript SDK"
linkTitle: "JavaScript"
weight: 1000
description: 用于开发 Dapr 应用程序的 JavaScript SDK 包
no_list: true
---

Dapr JS SDK 将允许您与 Dapr 进程进行交互，该进程抽象出几个常用功能，如服务到服务调用、状态管理、PubSub 等。


<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>客户端</b></h5>
      <p class="card-text">创建一个 JavaScript 客户端，并与 Dapr sidecar 和其他 Dapr 应用程序进行交互。</p>
      <a href="{{< ref js-client >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Actors</b></h5>
      <p class="card-text">在 JavaScript 中创建具有状态、提醒/计时器和方法的 virtual actor。</p>
      <a href="{{< ref js-actors >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>示例</b></h5>
      <p class="card-text">克隆 JavaScript SDK 仓库并尝试一些示例并快速入门。</p>
      <a href="https://github.com/dapr/js-sdk/blob/master/documentation/examples.md" class="stretched-link"></a>
    </div>
  </div>
</div>

### 可用软件包
- [DaprClient]({{< ref "js-client#installing-and-importing-daprs-js-sdk" >}}) 用于说明您的应用程序如何与 Dapr sidecar 或其他 Dapr 驱动的应用程序进行交互。

- [DaprServer]({{< ref "js-client#installing-and-importing-daprs-js-sdk" >}}) 用于描述 Dapr sidecar 如何与您的应用程序交互、转发事件订阅、调用等。
