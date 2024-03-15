---
type: docs
title: JavaScript SDK 中的日志记录
linkTitle: 日志
weight: 4000
description: 在 JavaScript SDK 中配置日志记录
---

## 介绍

JavaScript SDK带有一个开箱即用的`Console`日志记录器。 SDK会发出各种内部日志，帮助用户理解事件链并解决问题。 使用此 SDK 的消费者可以自定义日志的详细程度，以及为日志记录器提供自己的实现。

## 配置日志级别

日志的重要性按照降序分为五个级别 - `error`、`warn`、`info`、`verbose`和`debug`。 将日志级别设置为某个级别意味着记录器将输出所有至少与所提及级别一样重要的日志。 例如，将日志设置为`verbose`意味着SDK不会输出`debug`级别的日志。 日志级别的默认值是 `info`。

### Dapr 客户端

```js
import { CommunicationProtocolEnum, DaprClient, LogLevel } from "@dapr/dapr";

// create a client instance with log level set to verbose.
const client = new DaprClient({
  daprHost,
  daprPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  logger: { level: LogLevel.Verbose },
});
```

> 有关如何使用客户端的更多详细信息，请参阅 [JavaScript 客户端]({{< ref js-client >}})。

### Dapr服务器

```ts
import { CommunicationProtocolEnum, DaprServer, LogLevel } from "@dapr/dapr";

// create a server instance with log level set to error.
const server = new DaprServer({
  serverHost,
  serverPort,
  clientOptions: {
    daprHost,
    daprPort,
    logger: { level: LogLevel.Error },
  },
});
```

> 有关如何使用服务器的更多详细信息，请参阅 [JavaScript 服务器]({{< ref js-server >}}).

## 自定义LoggerService

JavaScript SDK使用内置的`Console`进行日志记录。 要使用像Winston或Pino这样的自定义日志记录器，您可以实现`LoggerService`接口。

### 基于Winston的日志记录：

创建一个新的`LoggerService`的实现。

```ts
import { LoggerService } from "@dapr/dapr";
import * as winston from "winston";

export class WinstonLoggerService implements LoggerService {
  private logger;

  constructor() {
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
    });
  }

  error(message: any, ...optionalParams: any[]): void {
    this.logger.error(message, ...optionalParams);
  }
  warn(message: any, ...optionalParams: any[]): void {
    this.logger.warn(message, ...optionalParams);
  }
  info(message: any, ...optionalParams: any[]): void {
    this.logger.info(message, ...optionalParams);
  }
  verbose(message: any, ...optionalParams: any[]): void {
    this.logger.verbose(message, ...optionalParams);
  }
  debug(message: any, ...optionalParams: any[]): void {
    this.logger.debug(message, ...optionalParams);
  }
}
```

将新的实现传递给SDK。

```ts
import { CommunicationProtocolEnum, DaprClient, LogLevel } from "@dapr/dapr";
import { WinstonLoggerService } from "./WinstonLoggerService";

const winstonLoggerService = new WinstonLoggerService();

// create a client instance with log level set to verbose and logger service as winston.
const client = new DaprClient({
  daprHost,
  daprPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  logger: { level: LogLevel.Verbose, service: winstonLoggerService },
});
```
