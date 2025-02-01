---
type: docs
title: "JavaScript SDK中的日志记录"
linkTitle: "日志记录"
weight: 4000
description: 配置JavaScript SDK中的日志记录
---

## 介绍

JavaScript SDK自带一个内置的`Console`日志记录器。SDK会生成各种内部日志，帮助用户理解事件流程并排查问题。用户可以自定义日志的详细程度，并提供自己的日志记录器实现。

## 配置日志级别

日志记录有五个级别，按重要性从高到低排列 - `error`、`warn`、`info`、`verbose`和`debug`。设置日志级别意味着日志记录器将记录所有该级别及更高重要性的日志。例如，设置为`verbose`级别意味着SDK不会记录`debug`级别的日志。默认的日志级别是`info`。

### Dapr Client

```js
import { CommunicationProtocolEnum, DaprClient, LogLevel } from "@dapr/dapr";

// 创建一个日志级别设置为verbose的客户端实例。
const client = new DaprClient({
  daprHost,
  daprPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  logger: { level: LogLevel.Verbose },
});
```

> 有关如何使用Client的更多详细信息，请参见[JavaScript Client]({{< ref js-client >}})。

### DaprServer

```ts
import { CommunicationProtocolEnum, DaprServer, LogLevel } from "@dapr/dapr";

// 创建一个日志级别设置为error的服务器实例。
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

> 有关如何使用Server的更多详细信息，请参见[JavaScript Server]({{< ref js-server >}})。

## 自定义LoggerService

JavaScript SDK使用内置的`Console`进行日志记录。要使用自定义日志记录器，如Winston或Pino，可以实现`LoggerService`接口。

### 基于Winston的日志记录：

创建`LoggerService`的新实现。

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

// 创建一个日志级别设置为verbose且日志服务为winston的客户端实例。
const client = new DaprClient({
  daprHost,
  daprPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  logger: { level: LogLevel.Verbose, service: winstonLoggerService },
});
