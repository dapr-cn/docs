---
type: docs
title: mtls expiry CLI command reference
linkTitle: mtls expiry
description: Detailed information on the mtls expiry CLI command
weight: 2000
---

### 说明

Checks the expiry of the root Certificate Authority (CA) certificate

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr mtls expiry [flags]
```

### Flags

| Name           | Environment Variable | Default | 说明              |
| -------------- | -------------------- | ------- | --------------- |
| `--help`, `-h` |                      |         | help for expiry |

### 示例

```bash
# Check expiry of Kubernetes certs
dapr mtls expiry
```
