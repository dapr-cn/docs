---
type: docs
title: 操作方法指南文章模板
linkTitle: 操作方法指南文章模板
weight: 30
description: 创建操作方法指南的建议模板和指南
---

## 贡献新的 How-To 指南

操作方法指南为希望的读者提供逐步实用指导:

- 启用一个功能
- 集成一项技术
- 在特定场景中使用 Dapr

"操作方法"指南可以被视为比快速入门更高级的、自助指导文档。 操作方法场景将需要更长的时间，并且更容易应用于读者的个人项目或环境。

在命名操作方法文档时，文件名中包含子目录名称。 如果您需要创建一个新的子目录，请确保它具有描述性，并包含相关组件或概念名称。 例如，_pubsub-namespaces_。

{{% alert title="注意" color="primary" %}}
这个模板只是一个建议。 根据您的文档目的随意更改。
{{% /alert %}}

了解有关[贡献Dapr文档]({{< ref contributing-docs.md >}})的更多信息，例如[前置内容]({{< ref "contributing-docs.md#front-matter" >}})和[短代码]({{< ref "contributing-docs.md#shortcodes" >}})。

### 模板

```md
---
type: #Required; docs
title: #Required; "How to: Brief, clear title"
linkTitle: #Required; "How to: Shorter than regular title, to show in table of contents"
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
Required. Light intro that briefly describes what the how-to will cover and any default Dapr characteristics. Link off to the appropriate concept or overview docs to provide context. -->

<!-- 
Include a diagram or image, if possible. 
-->

<!--
If applicable, link to the related quickstart in a shortcode note or alert with text like:

 If you haven't already, [try out the <topic> quickstart](link) for a quick walk-through on how to use <topic>.

-->

<!-- 
Make sure the how-to includes examples for multiple programming languages, OS, or deployment targets, if applicable. 
-->

## <Action or task>

<!-- 
Unlike quickstarts, do not use "Step 1", "Step 2", etc.  
-->

## <Action or task>

<!-- 
Each H2 step should start with a verb/action word.
-->

<!--
Include code snippets where possible. 
-->

## Next steps

<!--
Link to related pages and examples. For example, the building block overview, the related tutorial, API reference, etc.
-->

```
