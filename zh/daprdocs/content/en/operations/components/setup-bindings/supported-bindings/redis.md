---
type: docs
title: "Redis 绑定规范"
linkTitle: "Redis"
description: "Redis 组件绑定详细说明"
---

## 设置 Dapr 组件

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.redis
  version: v1
  metadata:
  - name: redisHost
    value: <address>:6379
  - name: redisPassword
    value: **************
  - name: enableTLS
    value: <bool>
```

- `redisHost` 是 Redis 主机地址。
- `RedisPassword` 是 Redis 密码。
- `enableTLS` - 如果 Redis 实例支持使用公用证书的 TLS ，那么可以将其配置为启用或禁用 TLS。

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [点击这里查看操作方法]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 输出绑定支持的操作

* create

## 相关链接
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [如何使用 Bindings 作为接口连接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 参考]({{< ref bindings_api.md >}})