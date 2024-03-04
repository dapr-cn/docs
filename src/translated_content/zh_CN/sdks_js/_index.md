---
type: docs
title: "Javascript Sdk"
linkTitle: "JavaScript"
weight: 1000
description: 用于开发 Dapr 应用程序的 JavaScript SDK 包
no_list: true
cascade:
  github_repo: https://github.com/dapr/js-sdk
  github_subdir: daprdocs/content/en/js-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/js/
  github_branch: main
---

用于在 JavaScript 和 TypeScript 中构建 Dapr 应用程序的客户端库。 该客户端将公共 Dapr API（如服务调用、状态管理、发布/订阅、密钥等）进行了抽象，并提供了一个简单直观的 API 用于构建应用程序。

## 安装

要开始使用JavaScript SDK，请从[NPM](https://www.npmjs.com/package/@dapr/dapr)安装Dapr JavaScript SDK包：

```bash
npm install --save @dapr/dapr
```

## 结构

Dapr JavaScript SDK 包含两个主要组件:

- **DaprServer**: 管理所有 Dapr sidecar 与应用程序之间的通信。
- **DaprClient**: 用于管理应用程序与 Dapr sidecar 的通信。

上面的述通信可以配置为使用 gRPC 或 HTTP 协议。

<table>
  <tr>
  <td bgcolor="white"> <img src="images/dapr-server.jpg" alt="Dapr Server" width="500px"> </td>
  <td bgcolor="white"> <img src="images/dapr-client.jpg" alt="Dapr Client" width="500px"> </td>
  </tr>
</table>

## 开始使用

为了帮助您快速了解，请查看以下资源：

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>客户端</b></h5>
      <p class="card-text">创建一个 JavaScript 客户端，并与 Dapr sidecar 和其他 Dapr 应用程序进行交互（例如，发布事件，输出绑定支持等）。 </p>
      <a href="{{< ref js-client >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Server</b></h5>
      <p class="card-text">创建一个JavaScript服务器，并让Dapr sidecar与您的应用程序交互（例如，订阅事件、支持输入绑定等）。 </p>
      <a href="{{< ref js-server >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Actors</b></h5>
      <p class="card-text">创建具有状态、提醒/计时器和方法的 virtual actors。</p>
      <a href="{{< ref js-actors >}}" class="stretched-link"></a>
    </div>
  </div>
</div>

<br />
<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>日志</b></h5>
      <p class="card-text">配置和自定义SDK日志记录。</p>
      <a href="{{< ref js-logger >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>示例</b></h5>
      <p class="card-text">克隆 JavaScript SDK 源代码并尝试一些示例以快速入门。</p>
      <a href="{{< ref js-examples >}}" class="stretched-link"></a>
    </div>
  </div>
</div>
