---
type: docs
title: "使用 PHP 实现发布和订阅"
linkTitle: "发布和订阅"
weight: 1000
description: 如何使用
no_list: true
---

通过 Dapr，您可以发布各种类型的内容，包括云事件。SDK 提供了一个简单的云事件实现，您也可以传递符合云事件规范的数组或使用其他库。

```php
<?php
$app->post('/publish', function(\Dapr\Client\DaprClient $daprClient) {
    $daprClient->publishEvent(pubsubName: 'pubsub', topicName: 'my-topic', data: ['something' => 'happened']);
});
```

有关发布/订阅的更多信息，请查看[操作指南]({{< ref howto-publish-subscribe.md >}})。

## 数据的内容类型

PHP SDK 允许您在构建自定义云事件或发布原始数据时设置数据的内容类型。

{{< tabs CloudEvent "原始数据" >}}

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
 * @var \Dapr\Client\DaprClient $daprClient 
 */
$daprClient->publishEvent(pubsubName: 'pubsub', topicName: 'my-topic', data: $raw_data, contentType: 'application/octet-stream');
```

{{% alert title="二进制数据" color="warning" %}}

对于二进制数据，仅支持 `application/octet-stream`。

{{% /alert %}}

{{% /codetab %}}

{{< /tabs >}}

## 接收云事件

在您的订阅处理程序中，您可以让 DI 容器将 `Dapr\PubSub\CloudEvent` 或 `array` 注入到您的控制器中。使用 `Dapr\PubSub\CloudEvent` 时，会进行一些验证以确保事件的正确性。如果您需要直接访问数据，或者事件不符合规范，请使用 `array`。
