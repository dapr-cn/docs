---
type: docs
title: "加密 API 参考"
linkTitle: "加密 API"
description: "关于加密 API 的详细文档"
weight: 1300
---

Dapr 通过加密模块提供跨平台和跨语言的加密和解密支持。除了[特定语言的 SDK]({{<ref sdks>}})之外，开发者还可以使用下面的 HTTP API 端点来调用这些功能。

> HTTP API 仅用于开发和测试。在生产环境中，强烈推荐使用 SDK，因为它们实现了 gRPC API，提供比 HTTP API 更高的性能和功能。

## 加密数据

此端点允许您使用指定的密钥和加密组件加密以字节数组形式提供的值。

### HTTP 请求

```
PUT http://localhost:<daprPort>/v1.0-alpha1/crypto/<crypto-store-name>/encrypt
```

#### URL 参数
| 参数               | 描述                                                         |
|-------------------|-------------------------------------------------------------|
| daprPort          | Dapr 端口                                                   |
| crypto-store-name | 用于获取加密密钥的加密存储名称                               |

> 注意，所有 URL 参数区分大小写。

#### 请求头
通过设置请求头来配置其他加密参数。下表详细说明了每个加密请求需要设置的必需和可选请求头。

| 请求头键                    | 描述                                                                                                                                                                                         | 允许值                                                                            | 必需性                                                 |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------|
| dapr-key-name              | 用于加密操作的密钥名称                                                                                                                                                                       |                                                                                   | 是                                                      |
| dapr-key-wrap-algorithm    | 使用的密钥包装算法                                                                                                                                                                           | `A256KW`, `A128CBC`, `A192CBC`, `RSA-OAEP-256`                                    | 是                                                      |
| dapr-omit-decryption-key-name | 如果为 true，则在输出中省略请求头 `dapr-decryption-key-name` 中的解密密钥名称。                                                                                                             | 以下值将被接受为 true：`y`, `yes`, `true`, `t`, `on`, `1`                         | 否                                                      |
| dapr-decryption-key-name   | 如果 `dapr-omit-decryption-key-name` 为 true，则包含要在输出中包含的预期解密密钥的名称。                                                                                                     |                                                                                   | 仅当 `dapr-omit-decryption-key-name` 为 true 时必需     |
| dapr-data-encryption-cipher| 用于加密操作的密码                                                                                                                                                                           | `aes-gcm` 或 `chacha20-poly1305`                                                  | 否                                                      |

### HTTP 响应

#### 响应体
加密请求的响应将其内容类型请求头设置为 `application/octet-stream`，因为它返回一个包含加密数据的字节数组。

#### 响应代码
| 代码 | 描述                                                             |
|------|-----------------------------------------------------------------|
| 200  | OK                                                              |
| 400  | 找不到加密提供者                                                |
| 500  | 请求格式正确，但 Dapr 代码或底层组件出错                         |

### 示例
```shell
curl http://localhost:3500/v1.0-alpha1/crypto/myAzureKeyVault/encrypt \
    -X PUT \
    -H "dapr-key-name: myCryptoKey" \
    -H "dapr-key-wrap-algorithm: aes-gcm" \ 
    -H "Content-Type: application/octet-stream" \ 
    --data-binary "\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64"
```

> 上述命令发送一个表示“hello world”的 UTF-8 编码字节数组，并将在响应中返回一个类似于以下内容的 8 位值流，包含加密数据：

```bash
gAAAAABhZfZ0Ywz4dQX8y9J0Zl5v7w6Z7xq4jV3cW9o2l4pQ0YD1LdR0Zk7zIYi4n2Ll7t6f0Z4X7r8x9o6a8GyL0X1m9Q0Z0A==
```

## 解密数据

此端点允许您使用指定的密钥和加密组件解密以字节数组形式提供的值。

#### HTTP 请求

```
PUT curl http://localhost:3500/v1.0-alpha1/crypto/<crypto-store-name>/decrypt
```

#### URL 参数

| 参数               | 描述                                                         |
|-------------------|-------------------------------------------------------------|
| daprPort          | Dapr 端口                                                   |
| crypto-store-name | 用于获取解密密钥的加密存储名称                               |

> 注意，所有参数区分大小写。

#### 请求头
通过设置请求头来配置其他解密参数。下表详细说明了每个解密请求需要设置的必需和可选请求头。

| 请求头键    | 描述                                              | 必需性 |
|------------|--------------------------------------------------|--------|
| dapr-key-name | 用于解密操作的密钥名称。                        | 是      |

### HTTP 响应

#### 响应体
解密请求的响应将其内容类型请求头设置为 `application/octet-stream`，因为它返回一个表示解密数据的字节数组。

#### 响应代码
| 代码 | 描述                                                             |
|------|-----------------------------------------------------------------|
| 200  | OK                                                              |
| 400  | 找不到加密提供者                                                |
| 500  | 请求格式正确，但 Dapr 代码或底层组件出错                         |

### 示例
```bash
curl http://localhost:3500/v1.0-alpha1/crypto/myAzureKeyVault/decrypt \
    -X PUT \
    -H "dapr-key-name: myCryptoKey" \
    -H "Content-Type: application/octet-stream" \
    --data-binary "gAAAAABhZfZ0Ywz4dQX8y9J0Zl5v7w6Z7xq4jV3cW9o2l4pQ0YD1LdR0Zk7zIYi4n2Ll7t6f0Z4X7r8x9o6a8GyL0X1m9Q0Z0A=="
```

> 上述命令发送一个加密消息负载的 base-64 编码字符串，并将返回一个响应，内容类型请求头设置为 `application/octet-stream`，返回响应体 `hello world`。

```bash
hello world
```