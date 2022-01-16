---
type: docs
title: "日志"
linkTitle: "日志"
weight: 3000
description: "了解 Dapr 日志记录"
---

Dapr以纯文本形式或JSON格式生成结构化日志到标准输出。 默认情况下，所有 Dapr 进程 (运行时和系统服务) 都以纯文本写入控制台输出。 要启用 JSON 格式的日志，您需要在运行 Dapr 进程时添加 `--log-as-json` 命令标志。

如果要使用搜索引擎 ( 例如 Elastic Search 或 Azure Monitor ) 来搜索日志，那么建议使用 JSON 格式的日志，日志收集器和搜索引擎可以使用内置 JSON 解析器进行解析。

## 日志架构

Dapr 基于以下架构生成日志。

| 字段       | 说明                           | 示例                         |
| -------- | ---------------------------- | -------------------------- |
| time     | ISO8601 时间戳                  | `2011-10-05T14:48:00.000Z` |
| level    | 日志级别 (info/warn/debug/error) | `info`                     |
| type     | 日志类型                         | `log`                      |
| msg      | 日志消息                         | `hello dapr!`              |
| 作用域      | 日志记录范围                       | `dapr.runtime`             |
| instance | 容器名称                         | `dapr-pod-xxxxx`           |
| app_id   | Dapr 应用 ID                   | `dapr-app`                 |
| ver      | Dapr 运行时版本                   | `0.5.0`                    |

## 纯文本和 JSON 格式的日志

* 纯文本日志示例
```bash
time="2020-03-11T17:08:48.303776-07:00" level=info msg="starting Dapr Runtime -- version 0.5.0-rc.3 -- commit v0.3.0-rc.0-155-g5dfcf2e" instance=dapr-pod-xxxx scope=dapr.runtime type=log ver=0.5.0-rc.3
time="2020-03-11T17:08:48.303913-07:00" level=info msg="log level set to: info" instance=dapr-pod-xxxx scope=dapr.runtime type=log ver=0.5.0-rc.3
```

* JSON 格式的日志示例
```json
{"instance":"dapr-pod-xxxx","level":"info","msg":"starting Dapr Runtime -- version 0.5.0-rc.3 -- commit v0.3.0-rc.0-155-g5dfcf2e","scope":"dapr.runtime","time":"2020-03-11T17:09:45.788005Z","type":"log","ver":"0.5.0-rc.3"}
{"instance":"dapr-pod-xxxx","level":"info","msg":"log level set to: info","scope":"dapr.runtime","time":"2020-03-11T17:09:45.788075Z","type":"log","ver":"0.5.0-rc.3"}
```

## 配置纯文本或 JSON 格式的日志

Dapr 支持纯文本和 JSON 格式的日志。 默认格式为纯文本。 如果要将纯文本与搜索引擎配合使用，那么将不需要更改任何配置选项。

要使用 JSON 格式的日志，您需要在安装 Dapr 和部署应用程序时添加额外的配置。 建议使用 JSONformatted 日志，因为大多数日志收集器和搜索引擎可以使用内置解析器更容易解析 JSON 。

## 在 Kubernetes 中配置日志格式
以下步骤描述如何为 Kubernetes 配置 JSON 格式的日志

### 使用 Helm chart将 dapr 安装到集群

通过向 Helm 命令添加 `--set global.logAsJson=true` 选项，可以为 Dapr 系统服务启用 JSON 格式的日志。

```bash
helm install dapr dapr/dapr --namespace dapr-system --set global.logAsJson=true
```

### 为 Dapr sidecars 启用 JSON 格式的日志

通过将 `dapr.io/log-as-json: "true"` 注释添加到部署，可以在 Dapr sidecar-injector服务激活的 Dapr sidecars 中启用 JSON 格式的日志。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pythonapp
  namespace: default
  labels:
    app: python
spec:
  replicas: 1
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
        dapr.io/log-as-json: "true"
...
```

## 日志收集器

如果您在 Kubernetes 集群中运行 Dapr ，那么 [Fluentd](https://www.fluentd.org/) 是一个受欢迎的容器日志收集器。 您可以将 Fluentd 与 [json 解析器插件](https://docs.fluentd.org/parser/json) 一起使用，以解析 Dapr JSON 格式的日志。 This [how-to]({{< ref fluentd.md >}}) shows how to configure the Fluentd in your cluster.

如果您使用 Azure Kubernetes 服务 您可以使用默认OMS Agent和 Azure Monitor收集日志，而不需要安装 Fluentd。

## 搜索引擎

如果使用 [Fluentd](https://www.fluentd.org/)，我们建议使用 Elastic Search 和 Kibana。 This [how-to]({{< ref fluentd.md >}}) shows how to set up Elastic Search and Kibana in your Kubernetes cluster.

如果您正在使用 Azure Kubernetes 服务，您可以使用 [针对容器的Azure monitor](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-overview) 而不会安装任何额外的监视工具。 也可以阅读 [如何为容器启用 Azure Monitor](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-onboard)

## 参考资料

- [How-to : 设置 Fleuntd, Elastic search 和 Kibana]({{< ref fluentd.md >}})
- [How-to：在 Azure Kubernetes 服务中设置Azure Monitor。]({{< ref azure-monitor.md >}})
