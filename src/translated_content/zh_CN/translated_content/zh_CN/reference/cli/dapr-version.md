---
type: docs
title: "version CLI command reference"
linkTitle: "version"
description: "Print Dapr runtime and CLI version."
---

### 说明

Print the version for `dapr` CLI and `daprd` executables either in normal or JSON formats.

### Supported platforms

- [自托管]({{< ref self-hosted >}})

### Usage

```bash
dapr version [flags]
```

### Flags

| 名称               | 环境变量 | 默认值 | 说明                            |
| ---------------- | ---- | --- | ----------------------------- |
| `--help`, `-h`   |      |     | 显示此帮助消息                       |
| `--output`, `-o` |      |     | Output format (options: json) |

### 示例

```bash
# Version for Dapr CLI and runtime
dapr version --output json
```

### Related facts

You can get `daprd` version directly by invoking `daprd --version` command.


You can also get the normal version output by running `dapr --version` flag.
