---
type: docs
title: "使用 PHP 发布和订阅"
linkTitle: "发布与订阅"
weight: 1000
description: 使用方式
no_list: true
---

With Dapr, you can publish anything, including cloud events. The SDK contains a simple cloud event implementation, but you can also just pass an array that conforms to the cloud event spec or use another library.

```php
<?php
$app->post('/publish', function(\Dapr\Client\DaprClient $daprClient) {
    $daprClient->publishEvent(pubsubName: 'pubsub', topicName: 'my-topic', data: ['something' => 'happened']);
});
```

有关发布/订阅的详细信息，请查看[操作方法]({{< ref howto-publish-subscribe.md >}})。

## Data content type

PHP SDK 允许在构建自定义 cloud event 或发布原始数据时设置数据内容类型。

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
 * @var \Dapr\Client\DaprClient $daprClient 
 */
$daprClient->publishEvent(pubsubName: 'pubsub', topicName: 'my-topic', data: $raw_data, contentType: 'application/octet-stream');
```

{{% alert title="Binary data" color="warning" %}}

只有 `application/octet-steam` 支持二进制数据。

{{% /alert %}}

{{% /codetab %}}

{{< /tabs >}}

## 接收 Cloud Event

在订阅处理器中，您可以通过 DI 容器将 `dapr\PubSub\Cloud Event` 或 `array` 注入到控制器中。 前者会进行一些验证，以确保事件是正确的。 如果需要直接访问数据，或者事件不符合规范，请使用 `array`。
