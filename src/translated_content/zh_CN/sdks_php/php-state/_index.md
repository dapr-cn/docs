---
type: docs
title: "使用 PHP 进行状态管理"
linkTitle: "状态管理"
weight: 1000
description: 如何使用
no_list: true
---

Dapr 提供了一种模块化的状态管理方法，适用于您的应用程序。要学习基础知识，请访问
[如何操作]({{< ref howto-get-save-state.md >}})。

## 元数据

许多状态组件允许您传递元数据给组件，以控制组件行为的特定方面。PHP SDK 允许您通过以下方式传递这些元数据：

```php
<?php
// 使用状态管理器
$app->run(
    fn(\Dapr\State\StateManager $stateManager) => 
        $stateManager->save_state('statestore', new \Dapr\State\StateItem('key', 'value', metadata: ['port' => '112'])));

// 使用 DaprClient
$app->run(fn(\Dapr\Client\DaprClient $daprClient) => $daprClient->saveState(storeName: 'statestore', key: 'key', value: 'value', metadata: ['port' => '112']))
```

这是一个将端口元数据传递给 [Cassandra]({{< ref setup-cassandra.md >}}) 的示例。

每个状态操作都允许传递元数据。

## 一致性与并发性

在 PHP SDK 中，有四个类代表 Dapr 中的四种不同类型的一致性和并发性：

```php
<?php
[
    \Dapr\consistency\StrongLastWrite::class, 
    \Dapr\consistency\StrongFirstWrite::class,
    \Dapr\consistency\EventualLastWrite::class,
    \Dapr\consistency\EventualFirstWrite::class,
] 
```

将其中一个传递给 `StateManager` 方法或使用 `StateStore()` 属性可以让您定义状态存储应如何处理冲突。

## 并行性

进行批量读取或开始事务时，您可以指定并行度。如果必须一次读取一个键，Dapr 将从底层存储中“最多”读取这么多键。这有助于在性能的代价下控制状态存储的负载。默认值是 `10`。

## 前缀

硬编码的键名很有用，但让状态对象更具可重用性会更好。在提交事务或将对象保存到状态时，您可以传递一个前缀，该前缀应用于对象中的每个键。

{{< tabs "事务前缀" "StateManager 前缀" >}}

{{% codetab %}}

```php
<?php
class TransactionObject extends \Dapr\State\TransactionalState {
    public string $key;
}

$app->run(function (TransactionObject $object ) {
    $object->begin(prefix: 'my-prefix-');
    $object->key = 'value';
    // 提交到键 `my-prefix-key`
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
    // 原始值来自 `my-prefix-key`
    $obj->key = 'value';
    // 保存到 `my-prefix-key`
    $stateManager->save_object($obj, prefix: 'my-prefix-');
});
```

{{% /codetab %}}

{{< /tabs >}}