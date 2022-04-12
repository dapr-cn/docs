---
type: docs
title: "publish CLI 命令参考"
linkTitle: "publish"
description: "有关 publish CLI 命令的详细信息"
---

## 说明

发布 pub-sub 事件。

## 支持的平台

- [自托管]({{< ref self-hosted >}})

## 用法

```bash
dapr publish [flags]
```

## 参数

| Name                     | 环境变量 | 默认值             | 说明                                                    |
| ------------------------ | ---- | --------------- | ----------------------------------------------------- |
| `--publish-app-id`, `-i` |      | 代表您要发布的应用程序的 ID |                                                       |
| `--pubsub`, `-p`         |      | Pub/sub 组件的名称   |                                                       |
| `--topic`, `-t`          |      |                 | 待发布的 topic                                            |
| `--data`, `-d`           |      |                 | JSON 序列化数据字符串（可选）                                     |
| `--data-file`, `-f`      |      |                 | A file containing the JSON serialized data (optional) |
| `--help`, `-h`           |      |                 | 显示此帮助消息                                               |


## 示例

### Publish to sample topic in target pubsub
```bash
dapr publish --publish-app-id appId --topic sample --pubsub target --data '{"key":"value"}'
```
