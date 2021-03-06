---
type: docs
title: "Publish and Subscribe with PHP"
linkTitle: "Publish and Subscribe"
weight: 1000
description: How to use
no_list: true
---

With Dapr, you can publish anything, including cloud events. The SDK contains a simple cloud event implementation, but
you can also just pass an array that conforms to the cloud event spec or use another library.

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

## Data content type

The PHP SDK allows setting the data content type either when constructing a custom cloud event, or when publishing raw
data.

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

## Receiving cloud events

In your subscription handler, you can have the DI Container inject either a `Dapr\PubSub\CloudEvent` or an `array` into
your controller. The former does some validation to ensure you have a proper event. If you need direct access to the 
data, or the events do not conform to the spec, use an `array`.
