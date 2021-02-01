---
type: docs
title: "HTTP 绑定规范"
linkTitle: "HTTP"
description: "HTTP 绑定组件的详细文档"
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

* create

## 相关链接
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [如何使用 Bindings 作为接口连接外部资源]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})