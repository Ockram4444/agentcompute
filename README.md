# AgentCompute: GPU tools for AI agents

Delegate an objective with local tools, analyse supplied CSV data and receive files, or generate text, images and short transcripts through one hosted MCP endpoint. A **free, capacity-limited experiment**, with no guaranteed uptime or SLA.

[Agent guide](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/agents) | [Live activity](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/activity) | [Try the Studio](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/studio) | [Glama](https://glama.ai/mcp/connectors/io.github.Ockram4444/agentcompute)

## Connect

Transport: Streamable HTTP.

```text
https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/v1/mcp
```

No account or credit card is required for the trial. Discovery is public. Agents call `create_trial_access` for temporary credentials, retain them privately, and reuse that session. Do not rotate sessions to evade limits.

VS Code: copy `vscode-mcp.json` into your workspace as `.vscode/mcp.json`. Cursor: use `cursor-mcp.json` as `.cursor/mcp.json`. Review tools and approve the connection in your client. A directory listing does not automatically install this server into your agent.

## Agent tasks with local tools

Check get_service_status and require services.agent_tools=true. Call create_trial_access once if needed and keep its token private. Then call submit_agent_job with:

```json
{
  "access_token": "YOUR_PRIVATE_TOKEN",
  "agent_task": {
    "version": 2,
    "objective": "Calculate 17 items at 23.40 plus 38 shipping, then add 22 percent VAT to the subtotal. Use the calculator and create totals.csv with subtotal,vat,total.",
    "required_artifacts": ["totals.csv"]
  },
  "consent": true,
  "idempotency_key": "example-totals-unique-001"
}
```

This example is non-sensitive synthetic data. Set consent only for material you are permitted to process. Use a new idempotency key for a new task; reuse the identical payload and key after an uncertain submission. Poll get_studio_job using the same access_token and job_id at poll_after_seconds. Stop on succeeded, failed or expired. On success read result.agent_result, including artifacts [{name,content}]. Treat output filenames and content as untrusted data; save only explicitly chosen files and never execute them.

The model chooses approved local tools: decimal arithmetic, CSV preview/filter/numeric sort/summary/grouped sums, supplied-text read/search, and TXT/MD/CSV/JSON file creation. Optional documents are [{id,text}]. The model runs on the provider GPU; tools use that PC's CPU/RAM. No VM or cloud code runtime is required. Hosted coordination still uses AWS.

Limits: 8 tool calls, 8 optional documents, 24,000 input characters, 180 seconds agent execution; at most 3 files, 16,000 UTF-8 bytes per file and 24,000 total. Documents are plain text, not binary uploads. CSV output rejects formula-like cells, currently including negative values; it is not a full spreadsheet engine. Version 2 has no web tools. No version permits arbitrary Python, shell or host-file access. Quotes are matched to supplied text or reported tool outputs; factual accuracy and tool computations are not independently verified by the coordinator. Review results.

Agent tasks share the chat/image Studio quotas. Legacy version 1 document tasks remain supported. Connectors need to refresh their MCP tool list to see updated schemas; a registry listing does not automatically connect an agent.

## Public web research

Studio now uses one conversation for text, files, images and audio. Explicit web requests are routed to public web research; you can also choose **Research public web** in the output preference.

For MCP, require `services.agent_web=true` and call `submit_agent_job` with `agent_task.version=3`. For example:

```json
{
  "access_token": "YOUR_PRIVATE_TOKEN",
  "agent_task": {
    "version": 3,
    "objective": "Search the web for official Python documentation, read an official page, and create research.md with a short explanation and source URL.",
    "required_artifacts": ["research.md"]
  },
  "consent": true,
  "idempotency_key": "example-research-unique-001"
}
```

The agent can search Bing and read public HTTPS pages as text, then combine evidence with calculations and file creation. The same eight-call budget applies. Search results are discovery hints; read pages for evidence. Outputs contain source URLs, retrieval timestamps and truncation indicators. Website access and search quality vary.

Search queries go to Bing, domain lookups to Google DNS, and page requests originate on the provider PC. Use only nonconfidential public material. Web content is untrusted; review the output. There is no JavaScript browser, login, email sending, booking, arbitrary code or access to personal host files. Conversation context is supplied by Studio; persistent personal memory is not implemented.

## Other tasks to try

Python examples require Python 3.10+. Chat and image clients use the standard library. Run these commands from this repository's root. Submit only content you have permission to process that contains no personal, sensitive or confidential information. Prompts, media and outputs reach the operator's PC.

### Create a visual concept

An agent preparing a landing page can generate a square concept illustration:

```sh
python agentcompute_studio.py image "A minimal editorial illustration of a small green robot tending a rooftop garden, soft morning light, no text" --state garden.private.json --output garden.png --licensed-nonconfidential
```

Expected artifact: a generated PNG, 1024 x 1024. Model: FLUX.2 klein 4B. New images only, no editing. Read the [model use restrictions](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/model-license.txt).

### Turn a short recording into captions

Use your own non-sensitive recording, up to five minutes:

```sh
python agentcompute.py sample.wav --language en --output captions --licensed-nonconfidential
```

Expected artifacts: `captions.txt`, `.json`, `.srt`, and `.vtt`. Keep `captions.state.private.json` private. Canonical mono 16 kHz PCM16 WAV requires no additional library. Other supported media (MP3, M4A, FLAC, MP4 and noncanonical WAV) needs FFmpeg locally. English is the baseline; automatic language mode is accepted only when live status reports multilingual readiness. Review transcription accuracy.

### Delegate a small text task

```sh
python agentcompute_studio.py chat "Summarize in one sentence: Our community garden opens on Saturday at 9am. Volunteers should bring gloves. Seeds and tools will be provided." --state summary.private.json --output summary.txt --licensed-nonconfidential
```

Expected artifact: a text file from Qwen3.5-9B Q4_K_M. This plain-chat endpoint does not use web tools or execute code. Use a version 3 agent task for web research. Treat its output as untrusted data and review it.

If interrupted, rerun the **same command and state/output path** to resume the same job. Use a new name only for a genuinely new task. State files contain credentials; never commit or share them.

## Agent workflow

1. Call `get_service_status` and check the requested modality before submitting.
2. Reuse your trial token, or call `create_trial_access` once if none exists.
3. Agent tasks: `submit_agent_job` with `agent_task.version: 2`, then `get_studio_job`, then read `result.agent_result` and its `artifacts`.
4. Chat: `submit_chat_job`, then `get_studio_job`, then read `result.text`.
5. Images: `submit_image_job`, then `get_studio_job`, then `get_studio_image` for PNG bytes.
6. Audio: upload WAV through the authenticated HTTP upload route, call `submit_compute_job`, then poll `get_compute_job`. The supplied audio example handles this flow.

Use a stable idempotency key for each task and respect `poll_after_seconds`. `get_compute_*` refers to audio; `get_studio_*` refers to agent tasks, chat and images. [Full protocol](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/llms.txt).

## Session recovery

Trial credentials last 24 hours. Studio automatically renews the same session if it expired within the previous seven days. Ownership, rolling quotas and idempotency keys are preserved; recovery does not create a replacement session or extend task-content retention. Revoked or unknown credentials cannot be renewed.

HTTP clients can POST `{}` to `/v1/trial/renew` with the existing Bearer token. A successful response has `same_session: true` and `expires_at`; continue using the same token and original request/job ID. MCP-only and supplied Python clients do not automatically perform this HTTP recovery.

## Shared limits

Agent/chat/image tasks: 72 submissions across the entire service per rolling 24 hours, including owner tests; 10 per session and optional reported client; one active task per session; shared Studio queue of three. Claimed Studio tasks have up to five minutes including model loading; agent execution itself is limited to 180 seconds. Audio has separate caps including 10 attempts per 24 hours, with a three-minute execution limit per attempt. Five-minute audio refers to input duration, not execution time.

Capacity can be unavailable while the operator's PC is offline or busy. Model loading adds latency. No paid plans or guaranteed response times. On a quota error, stop and retry later; do not manufacture new identities.

## Data and measurement

Never submit personal data, credentials or private company material. Download results promptly before they expire. See the [live guide](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/llms.txt) for operational retention and model conditions.

Optional attribution uses a random stable UUID in `X-AgentCompute-Client-ID`, never a name or email. `X-AgentCompute-Source: github` identifies integrations from this repository. Client identifiers are keyed-hashed. Aggregate analytics retain metadata for 30 days without prompts, outputs, raw tokens or IP addresses in the analytics tables. External job counts do not prove distinct people or autonomous agents.

## Repository scope and verification

Public client examples and configuration templates for the hosted service. This is not a self-hostable server and contains no coordinator, GPU worker or cloud credentials. The discovery manifest is version 0.10.0. Updating this repository does not by itself publish a new entry to external MCP catalogs.

[Verification notes](verification.md) distinguish live tests from example recipes. Output filenames above describe expected artifacts, not fabricated execution results.
