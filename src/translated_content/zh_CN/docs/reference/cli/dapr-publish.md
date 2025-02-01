---
type: docs
title: "发布命令行工具参考"
linkTitle: "发布"
description: "关于发布命令行工具的详细信息"
---

### 描述

发布一个发布-订阅事件。

### 支持的平台

- [自托管]({{< ref self-hosted >}})

### 用法

```bash
dapr publish [flags]
```

### 参数

| 名称                         | 环境变量 | 默认值                                                      | 描述                                           |
| ---------------------------- | -------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `--publish-app-id`, `-i`     |          | 您要发布的应用程序的 ID                                     |
| `--pubsub`, `-p`             |          | 发布-订阅组件的名称                                         |
| `--topic`, `-t`              |          |                                                             | 要发布的主题                                   |
| `--data`, `-d`               |          |                                                             | JSON 序列化的字符串（可选）                    |
| `--data-file`, `-f`          |          |                                                             | 包含 JSON 序列化数据的文件（可选）             |
| `--help`, `-h`               |          |                                                             | 显示帮助信息                                   |
| `--metadata`, `-m`           |          |                                                             | JSON 序列化的发布元数据（可选）                |
| `--unix-domain-socket`, `-u` |          |                                                             | Unix 域套接字的路径（可选）                    |

### 示例

```bash
# 通过应用程序发布到目标发布-订阅系统中的示例主题
dapr publish --publish-app-id appId --topic sample --pubsub target --data '{"key":"value"}'

# 使用 Unix 域套接字通过应用程序发布到目标发布-订阅系统中的示例主题
dapr publish --enable-domain-socket --publish-app-id myapp --pubsub target --topic sample --data '{"key":"value"}'

# 通过应用程序在不使用云事件的情况下发布到目标发布-订阅系统中的示例主题
dapr publish --publish-app-id myapp --pubsub target --topic sample --data '{"key":"value"}' --metadata '{"rawPayload":"true"}'
```
