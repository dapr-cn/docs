---
type: docs
title: "JavaScript SDK"
linkTitle: "JavaScript"
weight: 1000
description: 用于开发Dapr应用的JavaScript SDK
no_list: true
cascade:
  github_repo: https://github.com/dapr/js-sdk
  github_subdir: daprdocs/content/en/js-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/js/
  github_branch: main
---

这是一个用于在JavaScript和TypeScript中构建Dapr应用的开发库。该库对Dapr的常用API进行了抽象，如服务调用、状态管理、发布订阅、密钥管理等，并提供了一个简单直观的API接口来帮助构建应用。

## 安装

要开始使用JavaScript SDK，请从[NPM](https://www.npmjs.com/package/@dapr/dapr)安装Dapr JavaScript SDK：

```bash
npm install --save @dapr/dapr
```

## 结构

Dapr JavaScript SDK包含两个主要组件：

- **DaprServer**：用于管理Dapr sidecar与应用之间的通信。
- **DaprClient**：用于管理应用与Dapr sidecar之间的通信。

这些通信可以配置为使用gRPC或HTTP协议。

<table>
  <tr>
  <td bgcolor="white"> <img src="images/dapr-server.jpg" alt="Dapr Server" width="500px"> </td>
  <td bgcolor="white"> <img src="images/dapr-client.jpg" alt="Dapr Client" width="500px"> </td>
  </tr>
</table>

## 入门

为了帮助您快速上手，请查看以下资源：

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>客户端</b></h5>
      <p class="card-text">创建一个JavaScript客户端，与Dapr sidecar和其他Dapr应用进行交互（例如，发布事件，支持输出绑定等）。</p>
      <a href="{{< ref js-client >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>服务器</b></h5>
      <p class="card-text">创建一个JavaScript服务器，让Dapr sidecar与您的应用进行交互（例如，订阅事件，支持输入绑定等）。</p>
      <a href="{{< ref js-server >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>虚拟演员</b></h5>
      <p class="card-text">创建具有状态、提醒/计时器和方法的虚拟演员。</p>
      <a href="{{< ref js-actors >}}" class="stretched-link"></a>
    </div>
  </div>
</div>
<br />
<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>日志</b></h5>
      <p class="card-text">配置和自定义SDK的日志功能。</p>
      <a href="{{< ref js-logger >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>示例</b></h5>
      <p class="card-text">获取JavaScript SDK的源代码并尝试一些示例以快速入门。</p>
      <a href="{{< ref js-examples >}}" class="stretched-link"></a>
    </div>
  </div>
</div>