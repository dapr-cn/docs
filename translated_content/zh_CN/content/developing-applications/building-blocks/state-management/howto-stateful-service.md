---
type: docs
title: "指南：如何创建一个有状态的服务"
linkTitle: "如何: 构建状态存储服务"
weight: 300
description: "对可伸缩的副本使用状态管理"
---

在这篇文章中，你将了解到如何使用选入(opt-in) 并发和一致性模型来创建一个可以水平扩展的有状态服务。

这可以把开发人员从困难的状态协调、冲突解决和失败处理中解放出来，允许他们以Dapr的API形式使用这些功能。

## 设置状态存储

状态存储组件代表Dapr用来与数据库进行通信的资源。 在本指南中，我们将使用Redis作为状态存储引擎。

[在此]({{< ref supported-state-stores >}})查看那受支持的状态存储列表。

### 使用 Dapr CLI

当使用`dapr run`运行你的应用程序时，Dapr CLI会自动提供一个状态存储（Redis）并创建相关的YAML。 如果需要切换使用的状态存储引擎，用你选择的文件替换/components下的YAML文件``。

### Kubernetes

在Kubernetes中配置不同的状态存储，请查阅[这里]({{<ref setup-state-store>}})。

## 强一致性和最终一致性

使用强一致性时，Dapr将确保底层状态存储在写入或删除状态之前，一旦数据被写入到所有副本或收到来自quorum的ack，就会返回响应。

对于GET类型的请求，Dapr将确保存储引擎在副本间一致地返回最新的数据。 除非在对状态API的请求中另有指定，否则默认为最终一致性。

下面的例子使用了强一致性:

### 保存状态

*下面的例子是用Python编写的，但适用于任何编程语言。*

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
stateReq = '[{ "key": "k1", "value": "Some Data", "options": { "consistency": "strong" }}]'
response = requests.post(dapr_state_url, json=stateReq)
```

### 获取状态

*下面的例子是用Python编写的，但适用于任何编程语言。*

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.get(dapr_state_url + "/key1", headers={"consistency":"strong"})
print(response.headers['ETag'])
```

### 删除状态

*下面的例子是用Python编写的，但适用于任何编程语言。*

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.delete(dapr_state_url + "/key1", headers={"consistency":"strong"})
```

如果没有指定`concurrency`选项，last-write 是默认的并发模式。

## First-write-wins 和 Last-write-wins

Dapr允许开发人员在处理数据存储时选择两种常见的并发模式：First-write-wins 和 Last-write-wins。 在有多个应用程序实例，同时向同一个键进行写入的情况下，First-Write-Wins策略非常有用。

Dapr的默认模式是Last-write-wins。

Dapr使用版本号来确定一个特定的键是否已经更新。 客户端在读取键对应的值时保留版本号，然后在写入和删除等更新过程中使用版本号。 如果版本信息在客户端检索后发生了变化，就会抛出一个错误，这时就需要客户端再次执行读取，以获取最新的版本信息和状态。

Dapr利用ETags来确定状态的版本号。 ETags标签从状态相关请求中以`ETag`头返回。

使用ETags，当出现ETag不匹配时，客户可以通过异常知道资源在上次检查后已经被更新。

下面的例子展示了如何获得一个ETag，然后使用它来保存状态，然后删除状态：

*下面的例子是用Python编写的，但适用于任何编程语言。*

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

在这个例子中，我们将看到如何在版本发生变化时重试保存状态操作:

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
