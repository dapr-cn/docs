---
type: docs
title: "使用PHP的状态管理"
linkTitle: "状态管理"
weight: 1000
description: 使用方式
no_list: true
---

Dapr 提供了一个很好的模块化方法来管理您的应用程序中的状态。 学习基础知识的最佳方法是访问 [howto]({{< ref howto-get-save-state.md >}})。

## 元数据

许多状态组件允许您将元数据传递给组件，以控制组件的特定行为。 PHP SDK 允许您通过以下方式传递该元数据：

```php
<?php
$app->run(
    fn(\Dapr\State\StateManager $stateManager) => 
        $stateManager->save_state('statestore', new \Dapr\State\StateItem('key', 'value', metadata: ['port' => '112'])));
```

这是如何将端口元数据传递给 [cassandra]({{< ref setup-cassandra.md >}}) 的示例。

每个状态操作都允许传递元数据。

## 一致性/并发性

在PHP SDK中，有四种不同类型的Dapr中的一致性和并发性：

```php
<?php
[
    \Dapr\consistency\StrongLastWrite::class, 
    \Dapr\consistency\StrongFirstWrite::class,
    \Dapr\consistency\EventualLastWrite::class,
    \Dapr\consistency\EventualFirstWrite::class,
] 
```

将其中之一传递给 `StateManager` 方法或使用 `StateStore()` 属性允许您定义state store来处理冲突。

## 并行

进行批量读取或开始事务时，可以指定并行的数量。 Dapr 一次可以从store中读取更多的key 这是以牺牲性能为代价控制状态存储的负载。 这是以牺牲性能为代价控制状态存储的负载。 该属性的默认值是 `10`。

## 前缀

硬编码的键名很有用，但是为什么不让状态对象可复用性更高呢？ 当提交交易或保存 对象状态时，您可以传递一个应用于对象中每个键的前缀。

{{< tabs "Transaction prefix" "StateManager prefix" >}}

{{% codetab %}}

```php
<?php
class TransactionObject extends \Dapr\State\TransactionalState {
    public string $key;
}

$app->run(function (TransactionObject $object ) {
    $object->begin(prefix: 'my-prefix-');
    $object->key = 'value';
    // commit to key `my-prefix-key`
    $object->commit();
});
```

{{% /codetab %}}
{{% codetab %}}

```php
<?php
class StateObject {
    public string $key;
}

$app->run(function(\Dapr\State\StateManager $stateManager) {
    $stateManager->load_object($obj = new StateObject(), prefix: 'my-prefix-');
    // original value is from `my-prefix-key`
    $obj->key = 'value';
    // save to `my-prefix-key`
    $stateManager->save_object($obj, prefix: 'my-prefix-');
});
```

{{% /codetab %}}

{{< /tabs >}}
