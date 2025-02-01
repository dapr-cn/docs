---
type: docs
title: "invoke CLI 命令参考"
linkTitle: "invoke"
description: "关于 invoke CLI 命令的详细信息"
---

### 描述

调用指定 Dapr 应用程序的方法。

### 支持的平台

- [自托管]({{< ref self-hosted >}})（即在本地或私有服务器上运行）

### 用法

```bash
dapr invoke [flags]
```

### 标志

| 名称                | 环境变量             | 默认值 | 描述                                                   |
| ------------------- | -------------------- | ------- | ----------------------------------------------------- |
| `--app-id`, `-a`    | `APP_ID`             |         | 目标应用程序的 ID                                      |
| `--help`, `-h`      |                      |         | 显示帮助信息                                           |
| `--method`, `-m`    |                      |         | 需要调用的方法名称                                     |
| `--data`, `-d`      |                      |         | JSON 格式的数据字符串（可选）                           |
| `--data-file`, `-f` |                      |         | 包含 JSON 格式数据的文件（可选）                        |
| `--verb`, `-v`      |                      | `POST`  | 使用的 HTTP 请求方法                                   |

### 示例

```bash
# 使用 POST 请求方法调用目标应用的一个示例方法
dapr invoke --app-id target --method sample --data '{"key":"value"}'

# 使用 GET 请求方法调用目标应用的一个示例方法
dapr invoke --app-id target --method sample --verb GET
