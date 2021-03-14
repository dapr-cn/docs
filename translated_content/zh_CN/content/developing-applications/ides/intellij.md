---
type: docs
title: "IntelliJ"
linkTitle: "IntelliJ"
weight: 2000
description: "Configuring IntelliJ community edition for debugging with Dapr"
---

开发 Dapr应用程序时，你通常使用 Dapr CLI 来启动你的 Dapr 服务，就像这样：

```bash
dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 app.js
```

这使用了默认的组件yaml文件（在`dapr init`上创建），这样你的服务就可以与本地Redis容器交互。 作为一个入门方法这很好用，但是如果你想要附加一个调试器到你的服务来进行代码调试呢？ 在这里你可以使用dapr cli而不需要调用app。


将调试器附加到服务中的一种方法是首先从命令行运行`dapr run --`，然后运行你的代码并附加调试器。 While this is a perfectly acceptable solution, it does require a few extra steps (like switching between terminal and IDE) and some instruction to developers who might want to clone your repo and hit the "play" button to begin debugging.

This document explains how to use `dapr` directly from IntelliJ. As a pre-requisite, make sure you have initialized the Dapr's dev environment via `dapr init`.

Let's get started!

## Add Dapr as an 'External Tool'

First, quit IntelliJ before modifying the configurations file directly.

### IntelliJ configuration file location
For versions [2020.1](https://www.jetbrains.com/help/idea/2020.1/tuning-the-ide.html#config-directory) and above the configuration files for tools should be located in:

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
~/Library/Application Support/JetBrains/IntelliJIdea2020.1/tools/
```
{{% /codetab %}}


{{< /tabs >}}

> The configuration file location is different for version 2019.3 or prior. See [here](https://www.jetbrains.com/help/idea/2019.3/tuning-the-ide.html#config-directory) for more details. See [here](https://www.jetbrains.com/help/idea/2019.3/tuning-the-ide.html#config-directory) for more details.

Change the version of IntelliJ in the path if needed.

Create or edit the file in `<CONFIG PATH>/tools/External\ Tools.xml` (change IntelliJ version in path if needed). The `<CONFIG PATH>` is OS dependennt as seen above. The `<CONFIG PATH>` is OS dependennt as seen above.

Add a new `<tool></tool>` entry:

```xml
<toolSet name="External Tools">
  ...<!-- 1. <toolSet name="External Tools">
  ...
  <!-- 1. Each tool has its own app-id, so create one per application to be debugged --><tool name="dapr for DemoService in examples" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec>
      <!-- 2. For Linux or MacOS use: /usr/local/bin/dapr -->
      <option name="COMMAND" value="C:\dapr\dapr.exe" />
      <!-- 3. Choose app, http and grpc ports that do not conflict with other daprd command entries (placement address should not change). -->
      <option name="PARAMETERS" value="run -app-id demoservice -app-port 3000 -dapr-http-port 3005 -dapr-grpc-port 52000 />
      <!-- 4. Use the folder where the `components` folder is located -->
      <option name="WORKING_DIRECTORY" value="C:/Code/dapr/java-sdk/examples" />
    </exec>
  </tool>
  ...
</toolSet> For Linux or MacOS use: /usr/local/bin/dapr -->
      <option name="COMMAND" value="C:\dapr\dapr.exe" /><!-- 3. Choose app, http and grpc ports that do not conflict with other daprd command entries (placement address should not change). --><option name="PARAMETERS" value="run -app-id demoservice -app-port 3000 -dapr-http-port 3005 -dapr-grpc-port 52000" /><!-- 4. Use the folder where the `components` folder is located --><option name="WORKING_DIRECTORY" value="C:/Code/dapr/java-sdk/examples" />
    </exec>
  </tool>
  ...
</toolSet>
```

Optionally, you may also create a new entry for a sidecar tool that can be reused accross many projects:

```xml
<toolSet name="External Tools">
  ...<!-- 1. Reusable entry for apps with app port. --><tool name="dapr with app-port" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec><!-- 2. For Linux or MacOS use: /usr/local/bin/dapr --><option name="COMMAND" value="c:\dapr\dapr.exe" /><!-- 3. Prompts user 4 times (in order): app id, app port, Dapr's http port, Dapr's grpc port. --><option name="PARAMETERS" value="run --app-id $Prompt$ --app-port $Prompt$ --dapr-http-port $Prompt$ --dapr-grpc-port $Prompt$" /><!-- 4. Use the folder where the `components` folder is located --><option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
    </exec>
  </tool><!-- 1. Reusable entry for apps without app port. --><tool name="dapr without app-port" description="Dapr sidecar" showInMainMenu="false" showInEditor="false" showInProject="false" showInSearchPopup="false" disabled="false" useConsole="true" showConsoleOnStdOut="true" showConsoleOnStdErr="true" synchronizeAfterRun="true">
    <exec><!-- 2. For Linux or MacOS use: /usr/local/bin/dapr --><option name="COMMAND" value="c:\dapr\dapr.exe" /><!-- 3. Prompts user 3 times (in order): app id, Dapr's http port, Dapr's grpc port. --><option name="PARAMETERS" value="run --app-id $Prompt$ --dapr-http-port $Prompt$ --dapr-grpc-port $Prompt$" /><!-- 4. Use the folder where the `components` folder is located --><option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
    </exec>
  </tool>
  ...
</toolSet>
```

## Create or edit run configuration

Now, create or edit the run configuration for the application to be debugged. It can be found in the menu next to the `main()` function. It can be found in the menu next to the `main()` function.

![Edit run configuration menu](/images/intellij_debug_menu.png)

Now, add the program arguments and environment variables. Now, add the program arguments and environment variables. These need to match the ports defined in the entry in 'External Tool' above.

* Command line arguments for this example: `-p 3000`
* Environment variables for this example: `DAPR_HTTP_PORT=3005;DAPR_GRPC_PORT=52000`

![Edit run configuration](/images/intellij_edit_run_configuration.png)

## Start debugging

Once the one-time config above is done, there are two steps required to debug a Java application with Dapr in IntelliJ:

1. Start `dapr` via `Tools` -> `External Tool` in IntelliJ.

![Run dapr as 'External Tool'](/images/intellij_start_dapr.png)

2. Start your application in debug mode.

![Start application in debug mode](/images/intellij_debug_app.png)

## Wrapping up

After debugging, make sure you stop both `dapr` and your app in IntelliJ.
> Note: Since you launched the service(s) using the **dapr** ***run*** CLI command, the **dapr** ***list*** command will show runs from IntelliJ in the list of apps that are currently running with Dapr.

Happy debugging!

## Related links

- [Change](https://intellij-support.jetbrains.com/hc/en-us/articles/206544519-Directories-used-by-the-IDE-to-store-settings-caches-plugins-and-logs) in IntelliJ configuration directory location
