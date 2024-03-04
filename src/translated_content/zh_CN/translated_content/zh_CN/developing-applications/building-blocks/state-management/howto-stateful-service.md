---
type: docs
title: "指南：如何创建一个有状态的服务"
linkTitle: "如何: 构建状态存储服务"
weight: 300
description: "对可伸缩的副本使用状态管理"
---

在这篇文章中，你将了解到如何创建一个可以水平扩展的有状态服务，使用选入并发和一致性模型。 使用状态管理API可以使开发人员摆脱繁琐的状态协调、冲突解决和故障处理。

## 建立一个状态存储

状态存储组件代表 Dapr 用来与数据库进行通信的资源。 在本指南中，我们将使用默认的 Redis 状态存储。

### 使用 Dapr CLI

当你在自托管模式下运行 `dapr init` 时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在你的本地机器上运行一个 Redis 状态存储，它位于:

- 在Windows上，在 `%UserProfile%\.dapr\components\statestore.yaml`
- 在Linux/MacOS上，在 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松更换底层组件，而无需更改应用程序代码。

查看 [支持的状态存储列表]({{< ref supported-state-stores >}}).

### Kubernetes

看 [如何在 Kubernetes 上设置不同的状态存储]({{<ref setup-state-store>}}).

## 强一致性和最终一致性

使用强一致性，Dapr 确保底层状态存储：

- 数据写入所有副本后返回响应。
- 在写入或删除状态之前，从法定人数那里接收到一个 ACK。

对于 get 请求，Dapr 确保存储在副本之间始终返回最新的数据。 除非在对状态 API 的请求中另有指定，否则默认为最终一致性。

下面的例子说明了如何使用强一致性保存、获取和删除状态。 该示例是用 Python 编写的，但适用于任何编程语言。

### 保存状态

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
stateReq = '[{ "key": "k1", "value": "Some Data", "options": { "consistency": "strong" }}]'
response = requests.post(dapr_state_url, json=stateReq)
```

### 获取状态

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.get(dapr_state_url + "/key1", headers={"consistency":"strong"})
print(response.headers['ETag'])
```

### 删除状态

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.delete(dapr_state_url + "/key1", headers={"consistency":"strong"})
```

如果未指定`concurrency`选项，则默认为最后写入并发模式。

## First-write-wins 和 Last-write-wins

Dapr 允许开发人员在处理数据存储时选择两种常见的并发模式：

- **First-write-wins**: 在有多个应用程序实例，同时向同一个键进行写入的情况下，First-Write-Wins 策略非常有用。
- **Last-write-wins**: Dapr 的默认模式。

Dapr 使用版本号来确定一个特定的键是否已经更新。 你可以:

1. 读取密钥数据时保留版本号。
1. 在更新时（例如写入和删除操作）使用版本号。

如果版本信息在检索版本号后发生了变化，就会抛出一个错误，需要您执行另一个读取操作以获取最新的版本信息和状态。

Dapr利用 ETags 来确定状态的版本号。 ETags 标签从状态相关请求中以 `ETag` 头返回。 使用 ETags，您的应用程序知道自上次检查以来资源已经被更新，因为在 ETag 不匹配时出现错误。

以下示例显示如何：

- 获取一个 ETag。
- 使用 ETag 保存状态。
- 删除状态。

该示例是用 Python 编写的，但适用于任何编程语言。

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.get(dapr_state_url + "/key1", headers={"concurrency":"first-write"})
etag = response.headers['ETag']
newState = '[{ "key": "k1", "value": "New Data", "etag": {}, "options": { "concurrency": "first-write" }}]'.format(etag)

requests.post(dapr_state_url, json=newState)
response = requests.delete(dapr_state_url + "/key1", headers={"If-Match": "{}".format(etag)})
```

### 处理版本不匹配引起的失败

在下面的例子中，您将看到在版本发生变化时如何重试保存状态操作:

```python
import requests
import json

# This method saves the state and returns false if failed to save state
def save_state(data):
    try:
        store_name = "redis-store" # name of the state store as specified in state store component yaml file
        dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
        response = requests.post(dapr_state_url, json=data)
        if response.status_code == 200:
            return True
    except:
        return False
    return False

# This method gets the state and returns the response, with the ETag in the header -->
def get_state(key):
    response = requests.get("http://localhost:3500/v1.0/state/<state_store_name>/{}".format(key), headers={"concurrency":"first-write"})
    return response

# Exit when save state is successful. success will be False if there's an ETag mismatch -->
success = False
while success != True:
    response = get_state("key1")
    etag = response.headers['ETag']
    newState = '[{ "key": "key1", "value": "New Data", "etag": {}, "options": { "concurrency": "first-write" }}]'.format(etag)

    success = save_state(newState)
```
