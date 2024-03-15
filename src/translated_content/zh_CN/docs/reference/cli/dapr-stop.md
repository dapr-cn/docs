---
type: docs
title: stop CLI command reference
linkTitle: stop
description: Detailed information on the stop CLI command
---

### 说明

Stop Dapr instances and their associated apps.

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})

### Usage

```bash
dapr stop [flags]
```

### Flags

| Name               | Environment Variable | Default | 说明                                                                                                                                                                                                                                                       |
| ------------------ | -------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--app-id`, `-a`   | `APP_ID`             |         | The application id to be stopped                                                                                                                                                                                                                         |
| `--help`, `-h`     |                      |         | Print this help message                                                                                                                                                                                                                                  |
| `--run-file`, `-f` |                      |         | Stop running multiple applications at once using a Multi-App Run template file. Currently in [alpha]({{< ref "support-preview-features.md" >}}) and only available in Linux/MacOS |

### 示例

```bash
# Stop Dapr application
dapr stop --app-id <ID>
```
