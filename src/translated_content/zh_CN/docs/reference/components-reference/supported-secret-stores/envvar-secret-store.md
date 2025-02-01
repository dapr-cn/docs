---
type: docs
title: "本地环境变量（用于开发）"
linkTitle: "本地环境变量"
description: 本地环境 secret 存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/envvar-secret-store/"
---

此 Dapr secret 存储组件使用本地定义的环境变量，并且不使用身份验证。

{{% alert title="警告" color="warning" %}}
这种 secret 管理方法不建议用于生产环境。
{{% /alert %}}

## 组件格式

要配置本地环境变量 secret 存储，需要创建一个类型为 `secretstores.local.env` 的组件。在 `./components` 目录中创建一个文件，内容如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: envvar-secret-store
spec:
  type: secretstores.local.env
  version: v1
  metadata:
    # - name: prefix
    #   value: "MYAPP_"
```

## 规格元数据字段

| 字段 | 必需 | 详情 | 示例 |
|-------|:--------:|---------|---------|
| `prefix` | 否  | 如果设置此字段，则仅操作具有指定前缀的环境变量。返回的 secret 名称中将移除该前缀。<br>在 Windows 上匹配时不区分大小写，而在其他操作系统上区分大小写。 | `"MYAPP_"`

## 注意事项

出于安全考虑，此组件无法访问以下环境变量：

- `APP_API_TOKEN`
- 任何以 `DAPR_` 前缀开头的变量

## 相关链接
- [Secrets 构建块]({{< ref secrets >}})
- [操作指南：检索 secret]({{< ref "howto-secrets.md" >}})
- [操作指南：在 Dapr 组件中引用 secret]({{< ref component-secrets.md" >}})
- [Secrets API 参考]({{< ref secrets_api.md >}})
