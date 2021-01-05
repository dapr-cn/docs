---
type: docs
title: "HTTP binding spec"
linkTitle: "HTTP"
description: "Detailed documentation on the HTTP binding component"
---

## 设置 Dapr 组件

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.http
  version: v1
  metadata:
  - name: url
    value: http://something.com
  - name: method
    value: GET
```

- `url` 是要调用的 HTTP 网址。
- `method` 是用于请求的 HTTP 动作。

## 输出绑定支持的操作

* 创建

## Related links
- [Bindings building block]({{< ref bindings >}})
- [如何处理：触发带输入绑定的应用程序]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})