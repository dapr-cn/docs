---
type: docs
title: "How to: Use the Multi-App Run template file"
linkTitle: "How to: Use the Multi-App Run template"
weight: 2000
description: Unpack the Multi-App Run template file and its properties
---

{{% alert title="Note" color="primary" %}}
 Multi-App Run is currently a preview feature only supported in Linux/MacOS.
{{% /alert %}}

The Multi-App Run template file is a YAML file that you can use to run multiple applications at once. In this guide, you'll learn how to:
- Use the multi-app template
- View started applications
- Stop the multi-app template
- Stucture the multi-app template file

## Use the multi-app template

You can use the multi-app template file in one of the following two ways:

### Execute by providing a directory path

When you provide a directory path, the CLI will try to locate the Multi-App Run template file, named `dapr.yaml` by default in the directory. If the file is not found, the CLI will return an error.

Execute the following CLI command to read the Multi-App Run template file, named `dapr.yaml` by default:

```cmd
# the template file needs to be called `dapr.yaml` by default if a directory path is given

dapr run -f <dir_path>
```

### Execute by providing a file path

If the Multi-App Run template file is named something other than `dapr.yaml`, then you can provide the relative or absolute file path to the command:

```cmd
dapr run -f ./path/to/<your-preferred-file-name>.yaml
```

## View the started applications

Once the multi-app template is running, you can view the started applications with the following command:

```cmd
dapr list
```

## Stop the multi-app template

Stop the multi-app run template anytime with either of the following commands:

```cmd
# the template file needs to be called `dapr.yaml` by default if a directory path is given

dapr stop -f
```
or:

```cmd
dapr stop -f ./path/to/<your-preferred-file-name>.yaml
```

## Template file structure

The Multi-App Run template file can include the following properties. Below is an example template showing two applications that are configured with some of the properties.

```yaml
version: 1
common: # optional section for variables shared across apps
  resourcesPath: ./app/components # any dapr resources to be shared across apps
  env:  # any environment variable shared across apps
    - DEBUG: true
apps:
  - appID: webapp # optional
    appDirPath: .dapr/webapp/ # REQUIRED
    resourcesPath: .dapr/resources # (optional) can be default by convention
    configFilePath: .dapr/config.yaml # (optional) can be default by convention too, ignore if file is not found.
    appProtocol: HTTP
    appPort: 8080
    appHealthCheckPath: "/healthz" 
    command: ["python3" "app.py"]
  - appID: backend # optional 
    appDirPath: .dapr/backend/ # REQUIRED
    appProtocol: GRPC
    appPort: 3000
    unixDomainSocket: "/tmp/test-socket"
    env:
      - DEBUG: false
    command: ["./backend"]
```

{{% alert title="Important" color="warning" %}}
The following rules apply for all the paths present in the template file:
 - If the path is absolute, it is used as is.
 - All relative paths under comman section should be provided relative to the template file path.
 - `appDirPath` under apps section should be provided relative to the template file path.
 - All relative paths under app section should be provided relative to the appDirPath.

{{% /alert %}}

## Template properties

The properties for the Multi-App Run template align with the `dapr run` CLI flags, [listed in the CLI reference documentation]({{< ref "dapr-run.md#flags" >}}).


| Properties               | 必填 | 详情                                                                                                                                                                                                                      | 示例                                        |
| ------------------------ |:--:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `appDirPath`             | 是  | Path to the your application code                                                                                                                                                                                       | `./webapp/`, `./backend/`                 |
| `appID`                  | 否  | Application's app ID. If not provided, will be derived from `appDirPath`                                                                                                                                                | `webapp`, `backend`                       |
| `resourcesPath`          | 否  | Path to your Dapr resources. Can be default by convention; ignore if directory isn't found                                                                                                                              | `./app/components`, `./webapp/components` |
| `configFilePath`         | 否  | Path to your application's configuration file                                                                                                                                                                           | `./webapp/config.yaml`                    |
| `appProtocol`            | 否  | The protocol Dapr uses to talk to the application.                                                                                                                                                                      | `HTTP`, `GRPC`                            |
| `appPort`                | 否  | 应用程序正在监听的端口                                                                                                                                                                                                             | `8080`, `3000`                            |
| `daprHTTPPort`           | 否  | Dapr HTTP port                                                                                                                                                                                                          |                                           |
| `daprGRPCPort`           | 否  | Dapr GRPC port                                                                                                                                                                                                          |                                           |
| `daprInternalGRPCPort`   | 否  | gRPC port for the Dapr Internal API to listen on; used when parsing the value from a local DNS component                                                                                                                |                                           |
| `metricsPort`            | 否  | The port that Dapr sends its metrics information to                                                                                                                                                                     |                                           |
| `unixDomainSocket`       | 否  | Path to a unix domain socket dir mount. If specified, communication with the Dapr sidecar uses unix domain sockets for lower latency and greater throughput when compared to using TCP ports. Not available on Windows. | `/tmp/test-socket`                        |
| `profilePort`            | 否  | The port for the profile server to listen on                                                                                                                                                                            |                                           |
| `enableProfiling`        | 否  | Enable profiling via an HTTP endpoint                                                                                                                                                                                   |                                           |
| `apiListenAddresses`     | 否  | Dapr API listen addresses                                                                                                                                                                                               |                                           |
| `logLevel`               | 否  | The log verbosity.                                                                                                                                                                                                      |                                           |
| `appMaxConcurrency`      | 否  | The concurrency level of the application; default is unlimited                                                                                                                                                          |                                           |
| `placementHostAddress`   | 否  |                                                                                                                                                                                                                         |                                           |
| `appSSL`                 | 否  | 当 Dapr 调用应用程序时启用 https                                                                                                                                                                                                  |                                           |
| `daprHTTPMaxRequestSize` | 否  | Max size of the request body in MB.                                                                                                                                                                                     |                                           |
| `daprHTTPReadBufferSize` | 否  | Max size of the HTTP read buffer in KB. This also limits the maximum size of HTTP headers. The default 4 KB                                                                                                             |                                           |
| `enableAppHealthCheck`   | 否  | Enable the app health check on the application                                                                                                                                                                          | `true`, `false`                           |
| `appHealthCheckPath`     | 否  | Path to the health check file                                                                                                                                                                                           | `/healthz`                                |
| `appHealthProbeInterval` | 否  | Interval to probe for the health of the app in seconds                                                                                                                                                                  |                                           |
|                          |    |                                                                                                                                                                                                                         |                                           |
| `appHealthProbeTimeout`  | 否  | Timeout for app health probes in milliseconds                                                                                                                                                                           |                                           |
| `appHealthThreshold`     | 否  | Number of consecutive failures for the app to be considered unhealthy                                                                                                                                                   |                                           |
| `enableApiLogging`       | 否  | Enable the logging of all API calls from application to Dapr                                                                                                                                                            |                                           |
| `runtimePath`            | 否  | Dapr runtime install path                                                                                                                                                                                               |                                           |
| `env`                    | 否  | Map to environment variable; environment variables applied per application will overwrite environment variables shared across applications                                                                              | `DEBUG`, `DAPR_HOST_ADD`                  |

## 下一步

Watch [this video for an overview on Multi-App Run](https://youtu.be/s1p9MNl4VGo?t=2456):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=2456" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
