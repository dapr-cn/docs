---
type: docs
title: "How-To: Install Dapr CLI"
linkTitle: "Install Dapr CLI"
weight: 10
description: "Install the Dapr CLI to get started with Dapr"
---

## Dapr CLI installation scripts

Begin by downloading and installing the Dapr CLI for v0.11. This is used to initialize your environment on your desired platform.

{{% alert title="Note" color="warning" %}}
This command downloads and install Dapr CLI v0.11. To install the latest preview release, please visit the [v1.0-rc2 version of this page](https://v1-rc2.docs.dapr.io/getting-started/install-dapr-cli/).
{{% /alert %}}

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}
This command installs the latest linux Dapr CLI to `/usr/local/bin`:
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
This command installs the latest windows Dapr cli to `C:\dapr` and add this directory to User PATH environment variable. Run in Command Prompt:
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```
Verify by opening Explorer and entering `C:\dapr` into the address bar. You should see folders for bin, components, and a config file.
{{% /codetab %}}

{{% codetab %}}
This command installs the latest darwin Dapr CLI to `/usr/local/bin`:
```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```

Or you can install via [Homebrew](https://brew.sh):
```bash
brew install dapr/tap/dapr-cli
```
{{% /codetab %}}

{{% codetab %}}
Each release of Dapr CLI includes various OSes and architectures. These binary versions can be manually downloaded and installed.

1. Download the desired Dapr CLI from the latest [Dapr Release](https://github.com/dapr/cli/releases)
2. Unpack it (e.g. dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip)
3. Move it to your desired location.
   - For Linux/MacOS - `/usr/local/bin`
   - For Windows, create a directory and add this to your System PATH. For example create a directory called `c:\dapr` and add this directory to your path, by editing your system environment variable.
{{% /codetab %}}
{{< /tabs >}}

Learn more about the CLI and available commands in the [CLI docs]({{< ref cli >}}).

## Next steps
- [Init Dapr locally]({{< ref install-dapr-selfhost.md >}})
- [Init Dapr on Kubernetes]({{< ref install-dapr-kubernetes.md >}})

