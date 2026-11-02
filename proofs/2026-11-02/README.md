# AgentCompute: two live task demonstrations

On 2 November 2026, AgentCompute's public MCP interface accepted an objective, ran the configured worker agent with approved tools, and returned downloadable files for two example workflows.

| Workflow | Input | Delivered output | Server-reported elapsed time |
| --- | --- | --- | ---: |
| Supplier spend aggregation | 120 generated invoice rows, six suppliers | Supplier totals CSV and a short Markdown note | 17.999 s |
| Public web research | Two official pricing pages, two GPU models | A sourced comparison report | 64.614 s |

**Inspect the evidence:** [invoice input](inputs/invoices.csv), [supplier totals](outputs/supplier_totals.csv), [spend execution record](runs/spend-02.json), [reviewed research report](outputs/research-reviewed.md), [research execution record](runs/research-01.json).

The invoice totals were independently recomputed using Python's decimal arithmetic; all six returned values matched. The six requested web-pricing values were cross-checked against the official pages. The research output required citation-validation retries and included qualitative prose that was not verified; the public report is explicitly a reviewed extract, with the original artifact identified by its SHA-256.

## Full attempt sequence

| Run | Objective | Result | Server-reported time |
| --- | --- | --- | ---: |
| spend-01 | Group 120 invoices, sort, calculate concentration and deliver three files | Failed; no artifact returned | 29.906 s |
| research-01 | Read two websites and deliver a sourced price comparison | Succeeded; validation retries shown in trace | 64.614 s |
| spend-02 | Group the same 120 invoices and deliver a CSV plus a brief note | Succeeded; six totals independently checked | 17.999 s |

The second spend request used a narrower objective. These are all three attempts commissioned for this demonstration package. They are selected owner-run demonstrations, not customer adoption, a reliability study or a representative latency benchmark. The public service reports queue and server timing; elapsed times include queue delay and are not just model inference. Hardware was not independently attested. The configured model was `unsloth/Qwen3.5-9B-GGUF`, revision `3885219b6810b007914f3a7950a8d1b469d598a5`. Approved data tools use provider CPU/RAM; the model runs on the configured worker's GPU according to the service design.

## Verify and reproduce

Python 3.10 or later, standard library only:

```sh
python verify.py
python run_demo.py inputs/spend-02.json --run my-spend-demo --licensed-nonconfidential
python run_demo.py inputs/research-01.json --run my-research-demo --licensed-nonconfidential
```

The first command checks the public bundle hashes, 120 input rows, six supplier totals and recorded timing fields locally. The next two commands submit fresh tasks to the live public service, subject to availability and its trial limits. They do not guarantee the same latency or wording. Reuse the same run name to resume a job. The client reuses one trial session and respects the service quotas. Private session credentials stay in `.private/`; do not commit or share that directory. Generated outputs go to `results/`.

Inputs contain only synthetic invoices and public, nonconfidential URLs. Original third-party webpage text is not redistributed. Only selected, reviewed research values and source/output hashes are published. No billing was activated for these runs.

Public service: [Agent integration guide](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/agents.html).
