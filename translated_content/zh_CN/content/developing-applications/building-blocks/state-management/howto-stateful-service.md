---
type: docs
title: "指南：创建一个有状态的服务"
linkTitle: "指南：创建一个有状态的服务"
weight: 300
description: "对可伸缩的副本使用状态管理"
---

In this article, you'll learn how to create a stateful service which can be horizontally scaled, using opt-in concurrency and consistency models. Consuming the state management API frees developers from difficult state coordination, conflict resolution, and failure handling.

## Set up a state store

状态存储组件代表Dapr用来与数据库进行通信的资源。 For the purpose of this guide, we'll use the default Redis state store.

### 使用 Dapr CLI

When you run `dapr init` in self-hosted mode, Dapr creates a default Redis `statestore.yaml` and runs a Redis state store on your local machine, located:

- 在Windows上，在 `%UserProfile%\.dapr\components\statestore.yaml`
- 在Linux/MacOS上，在 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松更换底层组件，而无需更改应用程序代码。

See a [list of supported state stores]({{< ref supported-state-stores >}}).

### Kubernetes

See [how to setup different state stores on Kubernetes]({{<ref setup-state-store>}}).

## Strong and eventual consistency

Using strong consistency, Dapr makes sure that the underlying state store:

- Returns the response once the data has been written to all replicas.
- Receives an ACK from a quorum before writing or deleting state.

For get requests, Dapr ensures the store returns the most up-to-date data consistently among replicas. 除非在对状态API的请求中另有指定，否则默认为最终一致性。

The following examples illustrate how to save, get, and delete state using strong consistency. The example is written in Python, but is applicable to any programming language.

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

If the `concurrency` option hasn't been specified, the default is last-write concurrency mode.

## First-write-wins and last-write-wins

Dapr allows developers to opt-in for two common concurrency patterns when working with data stores:

- **First-write-wins**: useful in situations where you have multiple instances of an application, all writing to the same key concurrently.
- **Last-write-wins**: Default mode for Dapr.

Dapr使用版本号来确定一个特定的键是否已经更新。 You can:

1. Retain the version number when reading the data for a key.
1. Use the version number during updates such as writes and deletes.

If the version information has changed since the version number was retrieved, an error is thrown, requiring you to perform another read to get the latest version information and state.

Dapr利用ETags来确定状态的版本号。 ETags标签从状态相关请求中以`ETag`头返回。 Using ETags, your application knows that a resource has been updated since the last time they checked by erroring during an ETag mismatch.

The following example shows how to:

- Get an ETag.
- Use the ETag to save state.
- Delete the state.

The following example is written in Python, but is applicable to any programming language.

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

In the following example, you'll see how to retry a save state operation when the version has changed:

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
