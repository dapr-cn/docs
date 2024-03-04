---
type: docs
title: "publish CLI 命令参考文档"
linkTitle: "publish"
description: "有关 publish CLI 命令的详细信息"
---

### 说明

发布 pub-sub 事件。

### Supported platforms

- [自托管]({{< ref self-hosted >}})

### Usage

```bash
dapr publish [flags]
```

### Flags

| 名称                           | 环境变量 | 默认值                                                          | 说明                                            |
| ---------------------------- | ---- | ------------------------------------------------------------ | --------------------------------------------- |
| `--publish-app-id`, `-i`     |      | The ID that represents the app from which you are publishing |                                               |
| `--pubsub`, `-p`             |      | Pub/sub 组件的名称                                                |                                               |
| `--topic`, `-t`              |      |                                                              | 待发布的 topic                                    |
| `--data`, `-d`               |      |                                                              | JSON 序列化数据字符串（可选）                             |
| `--data-file`, `-f`          |      |                                                              | 包含 JSON 序列化数据的文件（可选）                          |
| `--help`, `-h`               |      |                                                              | 显示此帮助消息                                       |
| `--metadata`, `-m`           |      |                                                              | A JSON serialized publish metadata (optional) |
| `--unix-domain-socket`, `-u` |      |                                                              | The path to the unix domain socket (optional) |


### 示例

```bash
# Publish to sample topic in target pubsub via a publishing app
dapr publish --publish-app-id appId --topic sample --pubsub target --data '{"key":"value"}'

# Publish to sample topic in target pubsub via a publishing app using Unix domain socket
dapr publish --enable-domain-socket --publish-app-id myapp --pubsub target --topic sample --data '{"key":"value"}'

# Publish to sample topic in target pubsub via a publishing app without cloud event
dapr publish --publish-app-id myapp --pubsub target --topic sample --data '{"key":"value"}' --metadata '{"rawPayload":"true"}'
```
