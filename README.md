# AgentCompute: GPU tools for AI agents

Generate a concept image, turn a short recording into subtitles, or delegate a small text task through one hosted MCP endpoint. A **free, capacity-limited experiment**, with no guaranteed uptime or SLA.

[Agent guide](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/agents) | [Live activity](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/activity) | [Try the Studio](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/studio) | [Glama](https://glama.ai/mcp/connectors/io.github.Ockram4444/agentcompute)

## Connect

Transport: Streamable HTTP.

```text
https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/v1/mcp
```

No account or credit card is required for the trial. Discovery is public. Agents call `create_trial_access` for temporary credentials, retain them privately, and reuse that session. Do not rotate sessions to evade limits.

VS Code: copy `vscode-mcp.json` into your workspace as `.vscode/mcp.json`. Cursor: use `cursor-mcp.json` as `.cursor/mcp.json`. Review tools and approve the connection in your client. A directory listing does not automatically install this server into your agent.

## Three small tasks to try

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

Expected artifact: a text file from Qwen3.5-9B Q4_K_M. The model does not browse or execute code. Treat its output as untrusted data and review it.

If interrupted, rerun the **same command and state/output path** to resume the same job. Use a new name only for a genuinely new task. State files contain credentials; never commit or share them.

## Agent workflow

1. Call `get_service_status` and check the requested modality before submitting.
2. Reuse your trial token, or call `create_trial_access` once if none exists.
3. Chat: `submit_chat_job`, then `get_studio_job`, then read `result.text`.
4. Images: `submit_image_job`, then `get_studio_job`, then `get_studio_image` for PNG bytes.
5. Audio: upload WAV through the authenticated HTTP upload route, call `submit_compute_job`, then poll `get_compute_job`. The supplied audio example handles this flow.

Use a stable idempotency key for each task and respect `poll_after_seconds`. `get_compute_*` refers to audio; `get_studio_*` refers to chat/images. [Full protocol](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/llms.txt).

## Shared limits

Chat/images: 24 submissions across the entire service per rolling 24 hours, including owner tests; 10 per session and optional reported client; one active task per session; shared Studio queue of three. Maximum execution is five minutes per task. Audio has separate caps including 10 attempts per 24 hours, with a three-minute execution limit per attempt. Five-minute audio refers to input duration, not execution time.

Capacity can be unavailable while the operator's PC is offline or busy. Model loading adds latency. No paid plans or guaranteed response times. On a quota error, stop and retry later; do not manufacture new identities.

## Data and measurement

Never submit personal data, credentials or private company material. Download results promptly before they expire. See the [live guide](https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/llms.txt) for operational retention and model conditions.

Optional attribution uses a random stable UUID in `X-AgentCompute-Client-ID`, never a name or email. `X-AgentCompute-Source: github` identifies integrations from this repository. Client identifiers are keyed-hashed. Aggregate analytics retain metadata for 30 days without prompts, outputs, raw tokens or IP addresses in the analytics tables. External job counts do not prove distinct people or autonomous agents.

## Repository scope and verification

Public client examples and configuration templates for the hosted service. This is not a self-hostable server and contains no coordinator, GPU worker or cloud credentials. The registry manifest identifies remote release 0.8.0.

[Verification notes](verification.md) distinguish live tests from example recipes. Output filenames above describe expected artifacts, not fabricated execution results.
