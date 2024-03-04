---
type: docs
title: "快速入门指南文章模板"
linkTitle: "Quickstart template"
weight: 20
description: 创建快速入门指南的建议模板和指南
---

## 贡献新的 quickstart 指南

Dapr 快速入门指南由快速指令组成，引导读者完成准备好的快速入门，保存在 [dapr/quickstarts 存储库](https://github.com/dapr/quickstarts)。 这些快速入门将整个功能或构建块打包在一个地方，使读者能够体验其工作方式，而不会影响他们自己的项目。

快速入门说明应该简洁、直接和清晰。 快速入门指南的唯一目的就是简单地指导读者完成准备好的快速入门。 如果您想解释快速入门背后的概念，请将读者引导至一个概念文章以获取更多上下文。

{{% alert title="Note" color="primary" %}}
这个模板只是一个建议。 根据您的文档目的随意更改。
{{% /alert %}}

了解有关[贡献给 Dapr 文档]({{< ref contributing-docs.md >}})的更多信息，如[front-matter]({{< ref "contributing-docs.md#front-matter" >}})和[shortcodes]({{< ref "contributing-docs.md#shortcodes" >}})。

### 模板

```md
---
type: #Required; docs
title: #Required; "Quickstart: Brief, clear title"
linkTitle: #Required; This will display in the docs table of contents
weight: #Required; Use the correct weight based on hierarchy
description: #Required; One-sentence description of what to expect in the article
---

<!--
Remove all the comments in this template before opening a PR.
-->

<!-- 
H1: The title in the Hugo front-matter serves as the article's markdown H1. 
-->

<!-- Introductory paragraph  
Required. Light intro that briefly describes what the quickstart will cover. Link off to the appropriate concept or overview docs to provide context. -->

<!-- 
Include a diagram or image, if possible. 
-->

<!-- 
Make sure the quickstart includes examples for multiple programming languages. 
-->

## Pre-requisites

<!--
Make sure the reader is prepared for a successful quickstart walk through by listing what they may need.
-->

## Step 1: Set up the environment

<!-- 
Link to the quickstart sample for the reader to clone. 
-->

## Step 2: <action or task>

<!-- 
Each H2 step should start with a verb/action word.
-->

<!--
Include code snippets where possible. 
-->

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.gg/22ZtJrNe).

<!-- Since Dapr is an open community of contributors, make sure to provide a link to the discord discussion to welcome feedback.
-->

## Next steps

<!--
Link to related pages and examples. For example, the building block overview, the HTTP version of an SDK quickstart sample, etc.
-->

<!--
Use the button shortcode to direct readers to more in-depth, related scenarios, like the Dapr tutorials.
-->

```