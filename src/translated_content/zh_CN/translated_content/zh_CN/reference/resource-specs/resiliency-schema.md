---
type: docs
title: "Resiliency spec"
linkTitle: "弹性"
weight: 3000
description: "The basic spec for a Dapr resiliency resource"
---

The `Resiliency` Dapr resource allows you to define and apply fault tolerance resiliency policies. Resiliency specs are applied when the Dapr sidecar starts.

## 格式

```yml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: <REPLACE-WITH-RESOURCE-NAME>
version: v1alpha1
scopes:
  - <REPLACE-WITH-SCOPED-APPIDS>
spec:
  policies: # Required
    timeouts:
      timeoutName: <REPLACE-WITH-TIME-VALUE> # Replace with any unique name
    retries:
      retryName: # Replace with any unique name
        policy: <REPLACE-WITH-VALUE>
        duration: <REPLACE-WITH-VALUE>
        maxInterval: <REPLACE-WITH-VALUE>
        maxRetries: <REPLACE-WITH-VALUE>
    circuitBreakers:
      circuitBreakerName: # Replace with any unique name
        maxRequests: <REPLACE-WITH-VALUE>
        timeout: <REPLACE-WITH-VALUE> 
        trip: <REPLACE-WITH-CONSECUTIVE-FAILURE-VALUE>
targets: # Required
    apps:
      appID: # Replace with scoped app ID
        timeout: <REPLACE-WITH-TIMEOUT-NAME>
        retry: <REPLACE-WITH-RETRY-NAME>
        circuitBreaker: <REPLACE-WITH-CIRCUIT-BREAKER-NAME>
    actors:
      myActorType: 
        timeout: <REPLACE-WITH-TIMEOUT-NAME>
        retry: <REPLACE-WITH-RETRY-NAME>
        circuitBreaker: <REPLACE-WITH-CIRCUIT-BREAKER-NAME>
        circuitBreakerCacheSize: <REPLACE-WITH-VALUE>
    components:
      componentName: # Replace with your component name
        outbound:
          timeout: <REPLACE-WITH-TIMEOUT-NAME>
          retry: <REPLACE-WITH-RETRY-NAME>
          circuitBreaker: <REPLACE-WITH-CIRCUIT-BREAKER-NAME>
```

## Spec fields

| Field    | Required | 详情                                                                                                                                                                                    | 示例                                                                                     |
| -------- |:--------:| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| policies |    是     | The configuration of resiliency policies, including: <br><ul><li>`timeouts`</li><li>`retries`</li><li>`circuitBreakers`</li></ul> <br> [See more examples with all of the built-in policies]({{< ref policies.md >}})     | timeout: `general`<br>retry: `retryForever`<br>circuit breaker: `simpleCB` |
| targets  |    是     | The configuration for the applications, actors, or components that use the resiliency policies. <br>[See more examples in the resiliency targets guide]({{< ref targets.md >}}) | `apps` <br>`components`<br>`actors`                                        |


## 相关链接
[Learn more about resiliency policies and targets]({{< ref resiliency-overview.md >}})
