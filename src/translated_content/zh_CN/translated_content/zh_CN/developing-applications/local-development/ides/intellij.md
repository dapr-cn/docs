---
type: docs
title: "IntelliJ"
linkTitle: "IntelliJ"
weight: 2000
description: "配置 IntelliJ 社区版以使用 Dapr 进行调试"
---

When developing Dapr applications, you typically use the Dapr CLI to start your 'Daprized' service similar to this:

```bash
dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 app.js
```

这使用了默认的组件 yaml 文件（在 `dapr init`上创建），这样你的服务就可以与本地 Redis 容器交互。 作为一个入门方法这很好用，但是如果你想要附加一个调试器到你的服务来进行代码调试呢？ 在这里你可以使用 dapr cli 而不需要调用 app。


将调试器附加到服务中的一种方法是首先从命令行运行 `dapr run --`，然后运行你的代码并附加调试器。 虽然这完全是一个可以接受的解决方案，但它也需要一些额外的步骤（比如在终端和IDE之间进行切换），以及对那些可能想要克隆你的仓库并点击 "play" 按钮开始调试的开发人员进行一些指导。

本文档介绍了如何从 IntelliJ 中直接使用 `dapr`。 作为前提条件，要确保你已经通过 `dapr init` 初始化了 Dapr 的开发环境。

让我们开始吧！

## Add Dapr as an 'External Tool'

首先，退出 IntelliJ 后再修改配置文件。

### IntelliJ 配置文件位置
对于[2020.1](https://www.jetbrains.com/help/idea/2020.1/tuning-the-ide.html#config-directory)及以上版本，工具的配置文件应该位于：

{{< tabs Windows Linux  MacOS >}}

{{% codetab %}}

```powershell
%USERPROFILE%\AppData\Roaming\JetBrains\IntelliJIdea2020.1\tools\
```
{{% /codetab %}}


{{% codetab %}}
 ```shell
 $HOME/.config/JetBrains/IntelliJIdea2020.1/tools/
 ```
{{% /codetab %}}


{{% codetab %}}
```shell
~/Library/Application\ Support/JetBrains/IntelliJIdea2020.1/tools/
```
{{% /codetab %}}


{{< /tabs >}}

> The configuration file location is different for version 2019.3 or prior. See [here](https://www.jetbrains.com/help/idea/2019.3/tuning-the-ide.html#config-directory) for more details.

如有需要，请在路径中更改 IntelliJ 版本。

创建或编辑 `<CONFIG PATH>/tools/External\ Tools.xml` 中的文件（如有需要，请更改路径中的 IntelliJ 版本）。 The `<CONFIG PATH>` is OS dependent as seen above.

添加一个新的 `<tool></tool>` 条目:

```xml
<toolSet name="External Tools">
  ...
  <!-- 1. Each tool has its own app-id, so create one per application to be debugged -->
  <tool name="dapr for DemoService in examples" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec>
      <!-- 2. For Linux or MacOS use: /usr/local/bin/dapr -->
      <option name="COMMAND" value="C:\dapr\dapr.exe" />
      <!-- 3. Choose app, http and grpc ports that do not conflict with other daprd command entries (placement address should not change). -->
      <option name="PARAMETERS" value="run -app-id demoservice -app-port 3000 -dapr-http-port 3005 -dapr-grpc-port 52000" />
      <!-- 4. Use the folder where the `components` folder is located -->
      <option name="WORKING_DIRECTORY" value="C:/Code/dapr/java-sdk/examples" />
    </exec>
  </tool>
  ...
</toolSet>
```

（可选）您还可以为 sidecar 工具创建一个新条目，该条目可在许多项目中重复使用：

```xml
<toolSet name="External Tools">
  ...
  <!-- 1. Reusable entry for apps with app port. -->
  <tool name="dapr with app-port" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec>
      <!-- 2. For Linux or MacOS use: /usr/local/bin/dapr -->
      <option name="COMMAND" value="c:\dapr\dapr.exe" />
      <!-- 3. Prompts user 4 times (in order): app id, app port, Dapr's http port, Dapr's grpc port. -->
      <option name="PARAMETERS" value="run --app-id $Prompt$ --app-port $Prompt$ --dapr-http-port $Prompt$ --dapr-grpc-port $Prompt$" />
      <!-- 4. Use the folder where the `components` folder is located -->
      <option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
    </exec>
  </tool>
  <!-- 1. Reusable entry for apps without app port. -->
  <tool name="dapr without app-port" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec>
      <!-- 2. For Linux or MacOS use: /usr/local/bin/dapr -->
      <option name="COMMAND" value="c:\dapr\dapr.exe" />
      <!-- 3. Prompts user 3 times (in order): app id, Dapr's http port, Dapr's grpc port. -->
      <option name="PARAMETERS" value="run --app-id $Prompt$ --dapr-http-port $Prompt$ --dapr-grpc-port $Prompt$" />
      <!-- 4. Use the folder where the `components` folder is located -->
      <option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
    </exec>
  </tool>
  ...
</toolSet>
```

## 创建或编辑运行配置

现在，为要调试的应用程序创建或编辑运行配置。 它可以在 `main()` 函数旁边的菜单中找到。

![编辑运行的配置菜单](/images/intellij_debug_menu.png)

现在，添加程序参数和环境变量: 这些端口需要与上面 "External Tool" 条目中定义的端口相匹配。

* Command line arguments for this example: `-p 3000`
* Environment variables for this example: `DAPR_HTTP_PORT=3005;DAPR_GRPC_PORT=52000`

![编辑运行配置](/images/intellij_edit_run_configuration.png)

## 开始调试

以上一次性配置完成后，在 IntelliJ 中使用 Dapr 调试 Java 应用程序需要两个步骤：

1. Start `dapr` via `Tools` -> `External Tool` in IntelliJ.

![作为“外部工具”运行 Dapr](/images/intellij_start_dapr.png)

2. 在调试模式下启动你的应用程序。

![在调试模式下启动应用程序](/images/intellij_debug_app.png)

## 收尾

调试之后，你要确保同时停止了 `dapr` 和你在 IntelliJ 中的应用。
> 由于你使用 **dapr** ***run*** CLI 命令启动服务。 **dapr** ***list*** 命令将在当前使用 Dapr 运行的应用程序列表中显示 IntelliJ 的运行情况。

调试愉快!

## 相关链接

<!-- IGNORE_LINKS -->

- https://intellij-support.jetbrains.com/hc/en-us/articles/206544519-Directories-used-by-the-IDE-to-store-settings-caches-plugins-and-logs

<!-- END_IGNORE -->