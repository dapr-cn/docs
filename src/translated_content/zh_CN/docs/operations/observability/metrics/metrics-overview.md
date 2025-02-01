---
type: docs
title: "配置指标"
linkTitle: "概述"
weight: 4000
description: "启用或禁用Dapr指标"
---

默认情况下，每个Dapr系统进程都会发出Go运行时和进程指标，并拥有自己的[Dapr指标](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)。

## Prometheus端点

Dapr sidecar提供了一个与[Prometheus](https://prometheus.io/)兼容的指标端点，您可以通过抓取该端点来更好地了解Dapr的运行状况。

## 使用CLI配置指标

指标应用程序端点默认是启用的。您可以通过传递命令行参数`--enable-metrics=false`来禁用它。

默认的指标端口是`9090`。您可以通过传递命令行参数`--metrics-port`给daprd来更改此设置。

## 在Kubernetes中配置指标

您还可以通过在应用程序部署上设置`dapr.io/enable-metrics: "false"`注解来启用或禁用特定应用程序的指标。禁用指标导出器后，daprd不会打开指标监听端口。

以下Kubernetes部署示例显示了如何显式启用指标，并将端口指定为"9090"。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
  labels:
    app: node
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node
  template:
    metadata:
      labels:
        app: node
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
        dapr.io/enable-metrics: "true"
        dapr.io/metrics-port: "9090"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node:latest
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```

## 使用应用程序配置启用指标

您还可以通过应用程序配置启用指标。要默认禁用Dapr sidecar中的指标收集，请将`spec.metrics.enabled`设置为`false`。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  metrics:
    enabled: false
```

## 为错误代码配置指标

您可以通过设置`spec.metrics.recordErrorCodes`为`true`来为[Dapr API错误代码](https://docs.dapr.io/reference/api/error_codes/)启用额外的指标。Dapr API可能会返回标准化的错误代码。[一个名为`error_code_total`的新指标被记录]({{< ref errors-overview.md >}})，它允许监控由应用程序、代码和类别触发的错误代码。有关特定代码和类别，请参见[`errorcodes`包](https://github.com/dapr/dapr/blob/master/pkg/messages/errorcodes/errorcodes.go)。

示例配置：
```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  metrics:
    enabled: true
    recordErrorCodes: true
```

示例指标：
```json
{
  "app_id": "publisher-app",
  "category": "state",
  "dapr_io_enabled": "true",
  "error_code": "ERR_STATE_STORE_NOT_CONFIGURED",
  "instance": "10.244.1.64:9090",
  "job": "kubernetes-service-endpoints",
  "namespace": "my-app",
  "node": "my-node",
  "service": "publisher-app-dapr"
}
```

## 使用路径匹配优化HTTP指标报告

在使用HTTP调用Dapr时，默认情况下会为每个请求的方法创建指标。这可能导致大量指标，称为高基数，这可能会影响内存使用和CPU。

路径匹配允许您管理和控制Dapr中HTTP指标的基数。通过聚合指标，您可以减少指标事件的数量并报告一个总体数量。[了解更多关于如何在配置中设置基数]({{< ref "configuration-overview.md#metrics" >}})。

此配置是选择加入的，并通过Dapr配置`spec.metrics.http.pathMatching`启用。当定义时，它启用路径匹配，这将标准化指定路径的两个指标路径。这减少了唯一指标路径的数量，使指标更易于管理，并以受控方式减少资源消耗。

当`spec.metrics.http.pathMatching`与`increasedCardinality`标志设置为`false`结合使用时，未匹配的路径会被转换为一个通用桶，以控制和限制基数，防止路径无限增长。相反，当`increasedCardinality`为`true`（默认值）时，未匹配的路径会像通常一样传递，允许潜在的更高基数，但保留原始路径数据。

### HTTP指标中的路径匹配示例

以下示例演示了如何在Dapr中使用路径匹配API来管理HTTP指标。在每个示例中，指标是从5个HTTP请求到`/orders`端点收集的，具有不同的订单ID。通过调整基数和利用路径匹配，您可以微调指标粒度以平衡细节和资源效率。

这些示例说明了指标的基数，强调高基数配置会导致许多条目，这对应于处理指标的更高内存使用。为简单起见，以下示例专注于单个指标：`dapr_http_server_request_count`。

#### 低基数与路径匹配（推荐）

配置：
```yaml
http:
  increasedCardinality: false
  pathMatching:
    - /orders/{orderID}
```

生成的指标：
```
# 匹配的路径
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/{orderID}",status="200"} 5
# 未匹配的路径
dapr_http_server_request_count{app_id="order-service",method="GET",path="",status="200"} 1
```

通过配置低基数和路径匹配，您可以在不影响基数的情况下对重要端点的指标进行分组。这种方法有助于避免高内存使用和潜在的安全问题。

#### 无路径匹配的低基数

配置：

```yaml
http:
  increasedCardinality: false
```
生成的指标：
```
dapr_http_server_request_count{app_id="order-service",method="GET", path="",status="200"} 5
```

在低基数模式下，路径是无限基数的主要来源，被丢弃。这导致的指标主要指示给定HTTP方法的服务请求数量，但没有关于调用路径的信息。

#### 高基数与路径匹配

配置：
```yaml
http:
  increasedCardinality: true
  pathMatching:
    - /orders/{orderID}
```

生成的指标：
```
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/{orderID}",status="200"} 5
```

此示例来自与上例相同的HTTP请求，但为路径`/orders/{orderID}`配置了路径匹配。通过使用路径匹配，您可以通过基于匹配路径分组指标来实现减少基数。

#### 无路径匹配的高基数

配置：
```yaml
http:
  increasedCardinality: true
```

生成的指标：
```
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/1",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/2",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/3",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/4",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders/5",status="200"} 1
```

对于每个请求，都会创建一个带有请求路径的新指标。此过程会继续为每个新订单ID的请求创建新指标，导致基数无限增长，因为ID是不断增长的。

### HTTP指标排除动词

`excludeVerbs`选项允许您从指标中排除特定的HTTP动词。这在内存节省至关重要的高性能应用程序中非常有用。

### 在指标中排除HTTP动词的示例

以下示例演示了如何在Dapr中排除HTTP动词以管理HTTP指标。

#### 默认 - 包含HTTP动词

配置：
```yaml
http:
  excludeVerbs: false
```

生成的指标：
```
dapr_http_server_request_count{app_id="order-service",method="GET",path="/orders",status="200"} 1
dapr_http_server_request_count{app_id="order-service",method="POST",path="/orders",status="200"} 1
```

在此示例中，HTTP方法包含在指标中，导致每个请求到`/orders`端点的单独指标。

#### 排除HTTP动词

配置：
```yaml
http:
  excludeVerbs: true
```

生成的指标：
```
dapr_http_server_request_count{app_id="order-service",method="",path="/orders",status="200"} 2
```

在此示例中，HTTP方法从指标中排除，导致所有请求到`/orders`端点的单个指标。

## 配置自定义延迟直方图桶

Dapr使用累积直方图指标将延迟值分组到桶中，其中每个桶包含：
- 具有该延迟的请求数量
- 所有具有较低延迟的请求

### 使用默认延迟桶配置

默认情况下，Dapr将请求延迟指标分组到以下桶中：

```
1, 2, 3, 4, 5, 6, 8, 10, 13, 16, 20, 25, 30, 40, 50, 65, 80, 100, 130, 160, 200, 250, 300, 400, 500, 650, 800, 1000, 2000, 5000, 10000, 20000, 50000, 100000
```

以累积方式分组延迟值允许根据需要使用或丢弃桶以增加或减少数据的粒度。
例如，如果一个请求需要3ms，它会被计入3ms桶、4ms桶、5ms桶，依此类推。
同样，如果一个请求需要10ms，它会被计入10ms桶、13ms桶、16ms桶，依此类推。
在这两个请求完成后，3ms桶的计数为1，而10ms桶的计数为2，因为这两个请求都包含在这里。

这显示如下：

|1|2|3|4|5|6|8|10|13|16|20|25|30|40|50|65|80|100|130|160| ..... | 100000 |
|-|-|-|-|-|-|-|--|--|--|--|--|--|--|--|--|--|---|---|---|-------|--------|
|0|0|1|1|1|1|1| 2| 2| 2| 2| 2| 2| 2| 2| 2| 2| 2 | 2 | 2 | ..... | 2      |

默认的桶数量适用于大多数用例，但可以根据需要进行调整。每个请求创建34个不同的指标，这个值可能会随着大量应用程序而显著增长。
通过增加桶的数量可以获得更准确的延迟百分位数。然而，更多的桶会增加存储指标所需的内存量，可能会对您的监控系统产生负面影响。

建议将延迟桶的数量设置为默认值，除非您在监控系统中看到不必要的内存压力。配置桶的数量允许您选择应用程序：
- 您希望通过更多的桶看到更多细节
- 通过减少桶来获得更广泛的值

在配置桶的数量之前，请注意您的应用程序产生的默认延迟值。
### 根据您的场景自定义延迟桶

通过修改应用程序的[Dapr配置规范]({{< ref configuration-schema.md >}})中的`spec.metrics.latencyDistributionBuckets`字段，定制延迟桶以满足您的需求。

例如，如果您对极低的延迟值（1-10ms）不感兴趣，可以将它们分组到一个10ms桶中。同样，您可以将高值分组到一个桶中（1000-5000ms），同时在您最感兴趣的中间范围内保持更多细节。

以下配置规范示例用11个桶替换了默认的34个桶，在中间范围内提供了更高的粒度：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: custom-metrics
spec:
    metrics:
        enabled: true
        latencyDistributionBuckets: [10, 25, 40, 50, 70, 100, 150, 200, 500, 1000, 5000]
```

## 使用正则表达式转换指标

您可以为Dapr sidecar公开的每个指标设置正则表达式以“转换”其值。[查看所有Dapr指标的列表](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)。

规则的名称必须与被转换的指标名称匹配。以下示例显示了如何为指标`dapr_runtime_service_invocation_req_sent_total`中的标签`method`应用正则表达式：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
spec:
  metrics:
    enabled: true
    http:
      increasedCardinality: true
    rules:
      - name: dapr_runtime_service_invocation_req_sent_total
        labels:
        - name: method
          regex:
            "orders/": "orders/.+"
```

应用此配置后，记录的带有`method`标签的指标`orders/a746dhsk293972nz`将被替换为`orders/`。

使用正则表达式减少指标基数被认为是遗留的。我们鼓励所有用户将`spec.metrics.http.increasedCardinality`设置为`false`，这更易于配置并提供更好的性能。

## 参考

* [Howto: 本地运行Prometheus]({{< ref prometheus.md >}})
* [Howto: 设置Prometheus和Grafana以获取指标]({{< ref grafana.md >}})
