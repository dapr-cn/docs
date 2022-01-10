---
type: docs
title: "配置概览"
linkTitle: "概述"
weight: 1000
description: "Overview of the configuration API building block"
---

## 介绍

在编写应用程序时，使用应用程序配置是一项常见任务，并且经常使用配置存储来管理此配置数据。 配置项目通常具有动态性质，并且与消费它的应用程序的需求紧密耦合。 For example, common uses for application configuration include names of secrets, different identifiers, partition or consumer IDs, names of databases to connect to etc. These configuration items are typically stored as key/value items in a state store or database. Application configuration can be changed by either developers or operators at runtime and the developer needs to be notified of these changes in order to take the required action and load the new configuration. Also configuration data is typically read only from the application API perspective, with updates to the configuration store made through operator tooling. Dapr's configuration API allows developers to consume configuration items that are returned as read only key/value pairs and subscribe to changes whenever a configuration item changes.

<img src="/images/configuration-api-overview.png" width=900>

It is worth noting that this configuration API should not be confused with the [Dapr sidecar and control plane configuration]({{<ref "configuration-overview">}}) which is used to set policies and settings on instances of Dapr sidecars or the installed Dapr control plane.

## 特性

*This API is currently in `Alpha` state and only available on gRPC. An HTTP1.1 supported version with this URL syntax `/v1.0/configuration` will be available before the API is certified into `Stable` state.*

## 下一步
遵循这些指南：
- [How-To: Read application configuration from a configuration store]({{< ref howto-manage-configuration.md >}})

