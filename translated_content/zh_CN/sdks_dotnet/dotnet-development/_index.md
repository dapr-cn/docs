---
type: docs
title: "使用 Dapr .NET SDK 开发应用程序"
linkTitle: "开发集成"
weight: 40000
description: 了解.NET Dapr应用程序的本地开发集成选项
---

## 一次思考多个

使用您最喜欢的 IDE 或编辑器启动应用程序通常假定您只需要运行一件事——您正在调试的应用程序。 然而，开发微服务对你思考本地的开发流程提出了挑战*一次不止一个*。 微服务应用程序包含多个您可能需要同时运行的服务以及依赖于状态存储来管理。

为您的开发进程添加 Dapr 意味着您需要管理以下问题：

- 要运行的每个服务
- 每项服务的 Dapr sidecar
- Dapr 组件和配置清单
- 状态存储等其他依赖项
- 可选：Actors 的 Dapr placement 服务

本文档将假设您正在构建生产应用程序，并希望创建一套可重复且强大的开发实践。 The guidance here is general, and applies to any .NET server application using Dapr (including actors).

## Managing components

You have two primary methods of storing component definitions for local development with Dapr:

- Use the default location (`~/.dapr/components`)
- Use your own location

Creating a folder within your source code repository to store components and configuration will give you a way to version and share these definitions. The guidance provided here will assume you created a folder next to the application source code to store these files.

## Development options

Choose one of these links to learn about tools you can use in local development scenarios. These articles are ordered from lowest investment to highest investment. You may want to read them all to get an overview of your options.
