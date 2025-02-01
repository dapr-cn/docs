---
type: docs
title: "日志"
linkTitle: "概述"
weight: 1000
description: "了解 Dapr 日志"
---

Dapr 生成的结构化日志会输出到 stdout，可以选择纯文本或 JSON 格式。默认情况下，所有 Dapr 进程（包括运行时或 sidecar，以及所有控制平面服务）都会以纯文本形式将日志写入控制台（stdout）。若要启用 JSON 格式的日志记录，您需要在运行 Dapr 进程时添加 `--log-as-json` 命令标志。

{{% alert title="注意" color="primary" %}}
如果您希望使用 Elastic Search 或 Azure Monitor 等搜索引擎来搜索日志，强烈建议使用 JSON 格式的日志，因为日志收集器和搜索引擎可以利用内置的 JSON 解析器更好地解析这些日志。
{{% /alert %}}

## 日志模式

Dapr 生成的日志遵循以下模式：

| 字段 | 描述       | 示例 |
|-------|-------------------|---------|
| time  | ISO8601 时间戳 | `2011-10-05T14:48:00.000Z` |
| level | 日志级别 (info/warn/debug/error) | `info` |
| type  | 日志类型 | `log` |
| msg   | 日志消息 | `hello dapr!` |
| scope | 日志范围 | `dapr.runtime` |
| instance | 容器名称 | `dapr-pod-xxxxx` |
| app_id | Dapr 应用 ID | `dapr-app` |
| ver | Dapr 运行时版本 | `1.9.0` |

API 日志可能会添加其他结构化字段，具体请参阅 [API 日志记录文档]({{< ref "api-logs-troubleshooting.md" >}})。

## 纯文本和 JSON 格式的日志

* 纯文本日志示例

```bash
time="2022-11-01T17:08:48.303776-07:00" level=info msg="starting Dapr Runtime -- version 1.9.0 -- commit v1.9.0-g5dfcf2e" instance=dapr-pod-xxxx scope=dapr.runtime type=log ver=1.9.0
time="2022-11-01T17:08:48.303913-07:00" level=info msg="log level set to: info" instance=dapr-pod-xxxx scope=dapr.runtime type=log ver=1.9.0
```

* JSON 格式日志示例

```json
{"instance":"dapr-pod-xxxx","level":"info","msg":"starting Dapr Runtime -- version 1.9.0 -- commit v1.9.0-g5dfcf2e","scope":"dapr.runtime","time":"2022-11-01T17:09:45.788005Z","type":"log","ver":"1.9.0"}
{"instance":"dapr-pod-xxxx","level":"info","msg":"log level set to: info","scope":"dapr.runtime","time":"2022-11-01T17:09:45.788075Z","type":"log","ver":"1.9.0"}
```

## 日志格式

Dapr 支持输出纯文本（默认）或 JSON 格式的日志。

若要使用 JSON 格式的日志，您需要在安装 Dapr 和部署应用时添加额外的配置选项。建议使用 JSON 格式的日志，因为大多数日志收集器和搜索引擎可以更容易地解析 JSON。

## 使用 Dapr CLI 启用 JSON 日志

使用 Dapr CLI 运行应用程序时，传递 `--log-as-json` 选项以启用 JSON 格式的日志，例如：

```sh
dapr run \
  --app-id orderprocessing \
  --resources-path ./components/ \
  --log-as-json \
    -- python3 OrderProcessingService.py
```

## 在 Kubernetes 中启用 JSON 日志

以下步骤描述了如何为 Kubernetes 配置 JSON 格式的日志

### Dapr 控制平面

Dapr 控制平面中的所有服务（如 `operator`、`sentry` 等）支持 `--log-as-json` 选项以启用 JSON 格式的日志记录。

如果您使用 Helm chart 将 Dapr 部署到 Kubernetes，可以通过传递 `--set global.logAsJson=true` 选项为 Dapr 系统服务启用 JSON 格式的日志；例如：

```bash
helm upgrade --install dapr \
  dapr/dapr \
  --namespace dapr-system \
  --set global.logAsJson=true
```

### 为 Dapr sidecar 启用 JSON 格式日志

您可以通过在部署中添加 `dapr.io/log-as-json: "true"` 注释来为 Dapr sidecar 启用 JSON 格式的日志，例如：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pythonapp
  labels:
    app: python
spec:
  selector:
    matchLabels:
      app: python
  template:
    metadata:
      labels:
        app: python
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "pythonapp"
        # 启用 JSON 格式的日志
        dapr.io/log-as-json: "true"
...
```

## API 日志

API 日志使您能够查看应用程序对 Dapr sidecar 的 API 调用，以调试问题或监控应用程序的行为。您可以将 Dapr API 日志与 Dapr 日志事件结合使用。

有关更多信息，请参阅 [配置和查看 Dapr 日志]({{< ref "logs-troubleshooting.md" >}}) 和 [配置和查看 Dapr API 日志]({{< ref "api-logs-troubleshooting.md" >}})。

## 日志收集器

如果您在 Kubernetes 集群中运行 Dapr，[Fluentd](https://www.fluentd.org/) 是一个流行的容器日志收集器。您可以使用带有 [JSON 解析器插件](https://docs.fluentd.org/parser/json) 的 Fluentd 来解析 Dapr JSON 格式的日志。这个 [操作指南]({{< ref fluentd.md >}}) 显示了如何在集群中配置 Fluentd。

如果您使用 Azure Kubernetes Service，您可以使用内置代理通过 Azure Monitor 收集日志，而无需安装 Fluentd。

## 搜索引擎

如果您使用 [Fluentd](https://www.fluentd.org/)，我们建议使用 Elastic Search 和 Kibana。这个 [操作指南]({{< ref fluentd.md >}}) 显示了如何在 Kubernetes 集群中设置 Elastic Search 和 Kibana。

如果您使用 Azure Kubernetes Service，您可以使用 [Azure Monitor for containers](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-overview) 而无需安装任何额外的监控工具。另请阅读 [如何启用 Azure Monitor for containers](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-onboard)

## 参考资料

- [操作指南：设置 Fluentd、Elastic search 和 Kibana]({{< ref fluentd.md >}})
- [操作指南：在 Azure Kubernetes Service 中设置 Azure Monitor]({{< ref azure-monitor.md >}})
- [配置和查看 Dapr 日志]({{< ref "logs-troubleshooting.md" >}})
- [配置和查看 Dapr API 日志]({{< ref "api-logs-troubleshooting.md" >}})
