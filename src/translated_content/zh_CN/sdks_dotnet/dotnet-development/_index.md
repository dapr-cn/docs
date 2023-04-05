---
type: docs
title: "使用 Dapr .NET SDK 开发应用程序"
linkTitle: "开发集成"
weight: 40000
description: 了解.NET Dapr 应用程序的本地开发集成选项
---

## Thinking more than one at a time

Using your favorite IDE or editor to launch an application typically assumes that you only need to run one thing: the application you're debugging. However, developing microservices challenges you to think about your local development process for *more than one at a time*. A microservices application has multiple services that you might need running simultaneously, and dependencies (like state stores) to manage.

为您的开发进程添加 Dapr 意味着您需要管理以下问题：

- Each service you want to run
- A Dapr sidecar for each service
- Dapr component and configuration manifests
- Additional dependencies such as state stores
- optional: the Dapr placement service for actors

This document assumes that you're building a production application, and want to create a repeatable and robust set of development practices. 这里的指导是一般性的，适用于任何使用 Dapr 的 .NET服务器应用程序（包括Actors）。

## 管理组件

您可以使用 Dapr 存储组件定义以进行本地开发，主要有两种方法：

- Use the default location (`~/.dapr/components`)
- 使用您自己的位置

在源代码仓库库中创建一个文件夹来存储组件和配置，将为您提供一种对这些定义进行版本控制和共享的方法。 这里提供的指导将假设你在应用程序源代码旁边创建了一个文件夹来存储这些文件。

## 开发选项

选择其中一个链接，了解可在本地开发方案中使用的工具。 这些文章按从最低投入到最高投入的顺序排列。 您可能需要阅读所有这些内容，以便全面了解您的选择。
