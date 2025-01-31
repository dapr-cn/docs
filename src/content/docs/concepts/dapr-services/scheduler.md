---
type: docs
title: "Dapr Scheduler control plane service overview"
linkTitle: "Scheduler"
description: "Overview of the Dapr scheduler service"
---

The Dapr Scheduler service is used to schedule jobs, running in [self-hosted mode]({{< ref self-hosted >}}) or on [Kubernetes]({{< ref kubernetes >}}).  

The diagram below shows how the Scheduler service is used via the jobs API when called from your application. All the jobs that are tracked by the Scheduler service are stored in an embedded Etcd database. 

<img src="/images/scheduler/scheduler-architecture.png" alt="Diagram showing the Scheduler control plane service and the jobs API">

## Actor reminders

Prior to Dapr v1.15, [actor reminders]({{< ref "actors-timers-reminders.md#actor-reminders" >}}) were run using the Placement service. Now, by default, the [`SchedulerReminders` feature flag]({{< ref "support-preview-features.md#current-preview-features" >}}) is set to `true`, and all new actor reminders you create are run using the Scheduler service to make them more scalable.

When you deploy Dapr v1.15, any _existing_ actor reminders are migrated from the Placement service to the Scheduler service as a one time operation for each actor type. You can prevent this migration by setting the `SchedulerReminders` flag to `false` in application configuration file for the actor type.

## Self-hosted mode

The Scheduler service Docker container is started automatically as part of `dapr init`. It can also be run manually as a process if you are running in [slim-init mode]({{< ref self-hosted-no-docker.md >}}).

## Kubernetes mode

The Scheduler service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. You can run Scheduler in high availability (HA) mode. [Learn more about setting HA mode in your Kubernetes service.]({{< ref "kubernetes-production.md#individual-service-ha-helm-configuration" >}})

For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).

## Related links

[Learn more about the Jobs API.]({{< ref jobs_api.md >}})