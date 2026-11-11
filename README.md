# AgentCompute: compute for agents, supplied by people

Connect your existing AI agent to a network of independently operated GPUs through remote MCP or HTTP. Delegate supported research, calculations, CSV analysis, text, image and audio tasks, then retrieve results in your existing workflow. Studio is an optional browser demo. A **free, capacity-limited experiment**, with no guaranteed uptime or SLA.

[Use compute](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/compute.html) | [Provide compute](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/providers.html) | [Agent guide](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/agents) | [Live activity](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/activity) | [Try the Studio](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/studio) | [Glama](https://glama.ai/mcp/connectors/io.github.Ockram4444/agentcompute)

## Connect your agent to the network

Start with the [connection guide](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/agents.html#connect). Configure a client that supports remote Streamable HTTP MCP, or use the HTTP API from your application. Opening the website does not automatically connect an agent.


Transport: Streamable HTTP.

```text
https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/v1/mcp
```

Discovery and a small browser demo are public. For continuing use and API/MCP integrations, sign in with Google at [My account](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/account), create an API & MCP credential, and configure `Authorization: Bearer YOUR_PRIVATE_CREDENTIAL` in your client's private credential store. Reuse it for subsequent requests until expiry or revocation. No operator invitation or payment is required. Do not put credentials in prompts or committed configuration files.

[Current API instructions](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/docs) | [Importable n8n catalog workflow](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/examples/catalog-n8n.json) | [Account-based API/MCP example](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/examples/catalog_client.py)

The older Python trial clients in this repository have not been revalidated against the account-based flow. Use the current linked documentation and account-based example for new integrations.

VS Code: copy `vscode-mcp.json` into your workspace as `.vscode/mcp.json`. Cursor: use `cursor-mcp.json` as `.cursor/mcp.json`. Review tools and approve the connection in your client. A directory listing does not automatically install this server into your agent.

## Agent tasks with local tools

Check get_service_status and require services.agent_tools=true. Configure Bearer authentication once, then call submit_agent_job with:

```json
{
  "agent_task": {
    "version": 2,
    "objective": "Calculate 17 items at 23.40 plus 38 shipping, then add 22 percent VAT to the subtotal. Use the calculator and create totals.csv with subtotal,vat,total.",
    "required_artifacts": ["totals.csv"]
  },
  "consent": true,
  "idempotency_key": "example-totals-unique-001"
}
```

This example is non-sensitive synthetic data. Set consent only for material you are permitted to process. Use a new idempotency key for a new task; reuse the identical payload and key after an uncertain submission. Poll get_studio_job using the same account credential and job_id at poll_after_seconds. Stop on succeeded, failed or expired. On success read result.agent_result, including artifacts [{name,content}]. Treat output filenames and content as untrusted data; save only explicitly chosen files and never execute them.

The model chooses approved local tools: decimal arithmetic, CSV preview/filter/numeric sort/summary/grouped sums, supplied-text read/search, and TXT/MD/CSV/JSON file creation. Optional documents are [{id,text}]. The model runs on the provider GPU; tools use that PC's CPU/RAM. No VM or cloud code runtime is required. Hosted coordination still uses AWS.

Limits: 8 tool calls, 8 optional documents, 24,000 input characters, 180 seconds agent execution; at most 3 files, 16,000 UTF-8 bytes per file and 24,000 total. Documents are plain text, not binary uploads. CSV output rejects formula-like cells, currently including negative values; it is not a full spreadsheet engine. Version 2 has no web tools. No version permits arbitrary Python, shell or host-file access. Quotes are matched to supplied text or reported tool outputs; factual accuracy and tool computations are not independently verified by the coordinator. Review results.

Agent tasks share the Studio queue and technical concurrency limits. Legacy version 1 document tasks remain supported. Connectors need to refresh their MCP tool list to see updated schemas; a registry listing does not automatically connect an agent.

## Public web research

Studio now uses one conversation for text, files, images and audio. Explicit web requests are routed to public web research; you can also choose **Research public web** in the output preference.

For MCP, require `services.agent_web=true` and call `submit_agent_job` with `agent_task.version=3`. For example:

```json
{
  "agent_task": {
    "version": 3,
    "objective": "Search the web for official Python documentation, read an official page, and create research.md with a short explanation and source URL.",
    "required_artifacts": ["research.md"]
  },
  "consent": true,
  "idempotency_key": "example-research-unique-001"
}
```

The agent can search Bing (or Brave Search API when a provider configures a key), read public HTTPS pages as text, and retrieve MET Norway weather forecasts, then combine evidence with calculations and file creation. The same eight-call budget applies. Search results are discovery hints; read pages for evidence. Outputs contain source URLs, retrieval timestamps and truncation indicators. Website access and search quality vary. Obviously unrelated results are filtered; this is not semantic verification. When retrieval yields no usable evidence, the agent reports the limitation without a factual answer. General search remains experimental; no Brave key is configured in the pilot. Weather uses approximate city-centre coordinates and a supplied UTC offset; temperature ranges summarize available forecast samples. Forecasts are attributed to MET Norway under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), grouped and summarized by AgentCompute.

Search queries go to the configured search provider, weather coordinates go to MET Norway, domain lookups go to Google DNS, and page requests originate on the provider PC. Use only nonconfidential public material. Web content is untrusted; review the output. There is no JavaScript browser, login, email sending, booking, arbitrary code or access to personal host files. Conversation context is supplied by Studio; persistent personal memory is not implemented.

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

Expected artifact: a text file from the eligible provider's Qwen3.5 4B or 9B Q4_K_M profile; check live status. This plain-chat endpoint does not use web tools or execute code. Use a version 3 agent task for web research. Treat its output as untrusted data and review it.

If interrupted, rerun the **same command and state/output path** to resume the same job. Use a new name only for a genuinely new task. State files contain credentials; never commit or share them.

## Agent workflow

1. Call `get_service_status` and check the requested modality before submitting.
2. Reuse the account credential configured as Bearer authentication.
3. Agent tasks: `submit_agent_job` with `agent_task.version: 2`, then `get_studio_job`, then read `result.agent_result` and its `artifacts`.
4. Chat: `submit_chat_job`, then `get_studio_job`, then read `result.text`.
5. Images: `submit_image_job`, then `get_studio_job`, then `get_studio_image` for PNG bytes.
6. Audio: upload WAV through the authenticated HTTP upload route, call `submit_compute_job`, then poll `get_compute_job`. The supplied audio example handles this flow.

Use a stable idempotency key for each task and respect `poll_after_seconds`. `get_compute_*` refers to audio; `get_studio_*` refers to agent tasks, chat and images. [Full protocol](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/llms.txt).

## Account credentials

Create and revoke named credentials in My account. Credentials expire after one year; revoked credentials stop working immediately. A 401 requires checking the credential, not creating anonymous sessions. Preserve the job ID and idempotency key when recovering an interrupted request.

## Structured catalog extraction

Call `submit_catalog_job` with `extraction.version=1` and one to six public or synthetic records, each with an `id` and plain `text` (up to 2,000 characters). Include `consent:true` and a stable `idempotency_key`. Check `catalog_extraction.available` first. Poll `get_studio_job` and validate the returned JSON/CSV. Missing information may be null; source matching does not guarantee semantic correctness. This route does not fetch URLs or perform OCR. The linked n8n workflow and API/MCP example describe the full request.

## Shared limits

Authenticated Studio/agent accounts have no small daily request allowance. The current Studio service permits three active root requests per account and twelve shared task units; workflow parts reserve capacity. Anonymous demo limits remain separate. Input limits, execution deadlines, retention and antiabuse protections still apply. Read live service status and the [API instructions](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/docs) before submitting. Audio availability and limits are reported separately by `get_compute_status`. As checked on 11 November 2026, that audio response still includes legacy trial/login and daily-limit fields. Reconciling those fields with the account-based audio flow is pending; do not infer unrestricted audio capacity from the Studio settings.

Capacity can be unavailable while the operator's PC is offline or busy. Model loading adds latency. No paid plans or guaranteed response times. On a quota error, stop and retry later; do not manufacture new identities.

## Data and measurement

Never submit personal data, credentials or private company material. Download results promptly before they expire. See the [live guide](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/llms.txt) for operational retention and model conditions.

Optional attribution uses a random stable UUID in `X-AgentCompute-Client-ID`, never a name or email. `X-AgentCompute-Source: github` identifies integrations from this repository. Client identifiers are keyed-hashed. Aggregate analytics retain metadata for 30 days without prompts, outputs, raw tokens or IP addresses in the analytics tables. External job counts do not prove distinct people or autonomous agents.

## Windows provider beta

Use the [provider download page](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/providers) and [latest release metadata](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/downloads/latest-provider.json) for the current installer. The public manifest checked on 11 November 2026 reports 0.4.18, signed by C.M.S. SRLS. This is a manifest observation, not a new independent signature or clean-install test.

Setup requires Google sign-in and automatically associates the PC with the account. No invitation file or operator permit is required. Setup checks hardware, prepares compatible models and tests the GPU. The provider explicitly chooses Start sharing; opening the app or signing in never starts sharing. Pause, Stop and Exit control participation. Keep Windows protections enabled.

Qwen3.5 4B/9B profiles depend on available resources. Do not infer physical 8 GB GPU acceptance from tests on a 16 GB card. Second-PC acceptance remains to be documented. Models are not split across remote PCs. No paid rewards are active.

## Website and Studio

The landing page has separate paths for teams using compute and people providing hardware, plus real public-session activity. These totals may include tests and do not represent verified customers. The daily chart uses recorded completed jobs; missing data is shown as unavailable.

Studio formats assistant responses with headings, bold text, lists, tables and code blocks. Raw HTML and scripts are escaped, and links are limited to HTTP(S). Processing permission is disclosed next to **Send**; sending confirms it for that task. The protocol still requires explicit `consent: true` and permits only non-sensitive material. Web-provider disclosure and image restrictions remain accessible in the composer and service guide.

## Repository scope and verification

Public client examples, configuration templates and the public website interface in `web/`. The website snapshot depends on the hosted API; it is not a standalone backend. This is not a self-hostable server and contains no coordinator, GPU worker or cloud credentials. The discovery manifest is version 0.10.0. Updating this repository does not by itself publish a new entry to external MCP catalogs.

[Verification notes](verification.md) distinguish live tests from example recipes. Output filenames above describe expected artifacts, not fabricated execution results.
