---
type: docs
title: "操作指南：构建有状态服务"
linkTitle: "操作指南：构建有状态服务"
weight: 300
description: "通过状态管理构建可扩展、可复制的服务"
---

在本文中，您将学习如何创建一个可以水平扩展的有状态服务，选择性使用并发和一致性模型。状态管理API可以帮助开发者简化状态协调、冲突解决和故障处理的复杂性。

## 设置状态存储

状态存储组件是Dapr用来与数据库通信的资源。在本指南中，我们将使用默认的Redis状态存储。

### 使用Dapr CLI

当您在本地模式下运行`dapr init`时，Dapr会创建一个默认的Redis `statestore.yaml`并在您的本地机器上运行一个Redis状态存储，位置如下：

- 在Windows上，位于`%UserProfile%\.dapr\components\statestore.yaml`
- 在Linux/MacOS上，位于`~/.dapr/components/statestore.yaml`

通过`statestore.yaml`组件，您可以轻松替换底层组件而无需更改应用程序代码。

查看[支持的状态存储列表]({{< ref supported-state-stores >}})。

### Kubernetes

查看[如何在Kubernetes上设置不同的状态存储]({{<ref setup-state-store>}})。

## 强一致性和最终一致性

在强一致性模式下，Dapr确保底层状态存储：

- 在数据写入所有副本后才返回响应。
- 在写入或删除状态之前从法定人数接收确认。

对于读取请求，Dapr确保在副本之间一致地返回最新的数据。默认情况下是最终一致性，除非在请求状态API时另有指定。

以下示例展示了如何使用强一致性保存、获取和删除状态。示例用Python编写，但适用于任何编程语言。

### 保存状态

```python
import requests
import json

store_name = "redis-store" # 在状态存储组件yaml文件中指定的状态存储名称
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
stateReq = '[{ "key": "k1", "value": "Some Data", "options": { "consistency": "strong" }}]'
response = requests.post(dapr_state_url, json=stateReq)
```

### 获取状态

```python
import requests
import json

store_name = "redis-store" # 在状态存储组件yaml文件中指定的状态存储名称
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.get(dapr_state_url + "/key1", headers={"consistency":"strong"})
print(response.headers['ETag'])
```

### 删除状态

```python
import requests
import json

store_name = "redis-store" # 在状态存储组件yaml文件中指定的状态存储名称
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.delete(dapr_state_url + "/key1", headers={"consistency":"strong"})
```

如果没有指定`concurrency`选项，默认是后写胜出并发模式。

## 先写胜出和后写胜出

Dapr允许开发者在使用数据存储时选择两种常见的并发模式：

- **先写胜出**：在应用程序的多个实例同时写入同一个键的情况下很有用。
- **后写胜出**：Dapr的默认模式。

Dapr使用版本号来确定特定键是否已更新。您可以：

1. 在读取键的数据时保留版本号。
2. 在更新（如写入和删除）时使用版本号。

如果自从检索版本号以来版本信息已更改，将抛出错误，要求您执行另一次读取以获取最新的版本信息和状态。

Dapr利用ETags来确定状态的版本号。ETags从状态请求中以`ETag`头返回。使用ETags，您的应用程序知道自上次检查以来资源已更新，因为在ETag不匹配时会出错。

以下示例展示了如何：

- 获取ETag。
- 使用ETag保存状态。
- 删除状态。

以下示例用Python编写，但适用于任何编程语言。

```python
import requests
import json

store_name = "redis-store" # 在状态存储组件yaml文件中指定的状态存储名称
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.get(dapr_state_url + "/key1", headers={"concurrency":"first-write"})
etag = response.headers['ETag']
newState = '[{ "key": "k1", "value": "New Data", "etag": {}, "options": { "concurrency": "first-write" }}]'.format(etag)

requests.post(dapr_state_url, json=newState)
response = requests.delete(dapr_state_url + "/key1", headers={"If-Match": "{}".format(etag)})
```

### 处理版本不匹配失败

在以下示例中，您将看到如何在版本已更改时重试保存状态操作：

```python
import requests
import json

# 此方法保存状态，如果保存状态失败则返回false
def save_state(data):
    try:
        store_name = "redis-store" # 在状态存储组件yaml文件中指定的状态存储名称
        dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
        response = requests.post(dapr_state_url, json=data)
        if response.status_code == 200:
            return True
    except:
        return False
    return False

# 此方法获取状态并返回响应，ETag在头中 -->
def get_state(key):
    response = requests.get("http://localhost:3500/v1.0/state/<state_store_name>/{}".format(key), headers={"concurrency":"first-write"})
    return response

# 当保存状态成功时退出。如果存在ETag不匹配，success将为False -->
success = False
while success != True:
    response = get_state("key1")
    etag = response.headers['ETag']
    newState = '[{ "key": "key1", "value": "New Data", "etag": {}, "options": { "concurrency": "first-write" }}]'.format(etag)

    success = save_state(newState)
