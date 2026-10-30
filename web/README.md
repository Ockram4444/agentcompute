# Public website interface

Public frontend snapshot for the hosted AgentCompute pilot. The website uses the existing dark green identity and separates three landing-page subjects: teams using compute, people providing GPUs, and measured pilot activity.

- `home.html`: hero, audience sections, live totals and daily completion chart.
- `compute.html`: evaluation and integration for teams and developers.
- `providers.html`: Windows preview download, setup, compatibility and release limitations.
- `studio.html`: the unified conversation interface. `markdown.js` escapes raw HTML and accepts HTTP(S) links only; it does not execute generated content.
- `studio-guide.html` and `llms.txt`: data handling, protocol and operational limits.

These files depend on the hosted `/v1/` APIs, routing aliases and download route. This is not a standalone coordinator, GPU worker or self-hostable service. No invitations, private tokens or cloud configuration belong here.

Studio displays processing permission next to Send, with web-provider and image-license details in an expandable notice. Deliberate submission supplies the existing protocol consent field. The server's consent checks, quotas, authentication and idempotency behavior are unchanged.

Illustrations are explicitly labeled. Network counters and bars are fetched from the public adoption API, never generated sample metrics. Public-session totals may contain tests and do not prove distinct customers. Missing data is shown as unavailable.

Run the focused interface/security checks with Node:

```sh
node --test web/check.cjs web/ui.test.cjs
```

Design references: [NN/G homepage principles](https://www.nngroup.com/articles/homepage-design-principles/), [Runpod](https://www.runpod.io/), and [Vast hosting](https://vast.ai/hosting). Used for hierarchy and audience journeys; no competitor claims, metrics, testimonials or artwork are reused.
