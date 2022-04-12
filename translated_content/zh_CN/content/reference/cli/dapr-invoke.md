---
type: docs
title: "invoke CLI 命令参考"
linkTitle: "invoke"
description: "有关 invoke CLI 命令的详细信息"
---

## 说明

调用给定 Dapr 应用程序上的方法。

## 支持的平台

- [自托管]({{< ref self-hosted >}})

## 用法
```bash
dapr invoke [flags]
```

## 参数

| Name             | 环境变量 | 默认值    | 说明                |
| ---------------- | ---- | ------ | ----------------- |
| `--app-id`, `-a` |      |        | 要调用的应用程序 Id       |
| `--help`, `-h`   |      |        | 显示此帮助消息           |
| `--method`, `-m` |      |        | 调用的方法             |
| `--data`, `-d`   |      |        | JSON 序列化数据字符串（可选） |
| `--verb`, `-v`   |      | `POST` | 要使用的 HTTP 谓词      |

## 示例

### 使用 POST 谓词在目标应用上调用示例方法
```bash
dapr invoke --app-id target --method sample --data '{"key":"value"}'
```

### 使用 GET 谓词在目标应用上调用示例方法
```bash
dapr invoke --app-id target --method sample --verb GET
```
