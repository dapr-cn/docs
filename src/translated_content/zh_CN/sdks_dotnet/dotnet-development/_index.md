---
type: docs
title: 使用 Dapr .NET SDK 开发应用程序
linkTitle: 开发集成
weight: 50000
description: 了解.NET Dapr 应用程序的本地开发集成选项
---

## 一次思考多个

使用您最喜欢的 IDE 或编辑器启动应用程序通常假定您只需要运行一件事：您正在调试的应用程序。 但是，开发微服务挑战您同时考虑多个微服务的本地开发过程。 一个微服务应用程序有多个服务，您可能需要同时运行，并且有依赖项（如状态存储）需要管理。

为您的开发进程添加 Dapr 意味着您需要管理以下问题：

- 要运行的每个服务
- 每项服务的 Dapr sidecar
- Dapr 组件和配置清单
- 状态存储等其他依赖项
- 可选：Actors 的 Dapr placement 服务

本文档假设您正在构建生产应用程序，并希望创建一套可重复且强大的开发实践。 这里的指导是一般性的，适用于任何使用 Dapr 的 .NET服务器应用程序（包括Actors）。

## 管理组件

您可以使用 Dapr 存储组件定义以进行本地开发，主要有两种方法：

- 使用默认位置(`~/.dapr/components`)
- 使用您自己的位置

在源代码仓库库中创建一个文件夹来存储组件和配置，将为您提供一种对这些定义进行版本控制和共享的方法。 这里提供的指导将假设你在应用程序源代码旁边创建了一个文件夹来存储这些文件。

## 开发选项

选择其中一个链接，了解可在本地开发方案中使用的工具。 这些文章按从最低投入到最高投入的顺序排列。 您可能需要阅读所有这些内容，以便全面了解您的选择。