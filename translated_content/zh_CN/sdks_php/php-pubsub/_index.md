---
type: docs
title: "使用 PHP 发布和订阅"
linkTitle: "发布与订阅"
weight: 1000
description: 使用方式
no_list: true
---

有了 Dapr，您可以发布包括云事件的任何内容， 有了 Dapr，您可以发布包括云事件的任何内容， SDK包含一个简单的云事件实现，但是 您也可以只传递一个符合云事件规范的数组，或者使用另一个库。

```php
<?php
$app->post('/publish', function(\DI\FactoryInterface $factory) {
    // create a new publisher that publishes to my-pub-sub component
    $publisher = $factory->make(\Dapr\PubSub\Publish::class, ['pubsub' => 'my-pubsub']);

    // publish that something happened to my-topic
    $publisher->topic('my-topic')->publish(['something' => 'happened']);
});
```

For more information about publish/subscribe, check out [the howto]({{< ref howto-publish-subscribe.md >}}).

## 数据内容类型

PHP SDK 允许在构建自定义云端事件或发布原始 数据时设置数据内容类型。

{{< tabs CloudEvent "Raw" >}}

{{% codetab %}}

```php
<?php
$event = new \Dapr\PubSub\CloudEvent();
$event->data = $xml;
$event->data_content_type = 'application/xml';
```

{{% /codetab %}}
{{% codetab %}}

```php
<?php
/**
 * @var \Dapr\PubSub\Publish $publisher 
 */
$publisher->topic('my-topic')->publish($raw_data, content_type: 'application/octet-stream');
```

{{% alert title="Binary data" color="warning" %}}

Only `application/octet-steam` is supported for binary data.

{{% /alert %}}

{{% /codetab %}}

{{< /tabs >}}

## 接收云事件

在订阅处理器中，您可以通过 DI 容器将 dapr\PubSub\Cloud Event</code> `或 <code>array` 注入到控制器中。 之前进行了一些验证以确保您有一个适当的事件。 如果您需要直接访问数据或者事件，请使用 array </ code>。</p>
