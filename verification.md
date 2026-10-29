# Verification notes

The existing 0.8.0 deployment passed 72 integration assertions and 45 adoption/limit assertions before publication on 2026-10-23.

A live owner-authenticated chat check on 2026-10-23 at 15:25 UTC returned 493 for 17 * 29. Server timings: queue 0.511 seconds, total 16.448 seconds, model load 5.120 seconds, inference 0.121 seconds. Resuming the saved job succeeded without duplicate submission. This was one internal test, excluded from adoption counts, not a speed guarantee.

That live check used the published Python client with an owner Bearer authentication adapter. It did not establish a new public trial session.

On 2026-10-24 Glama displayed the AWS connector as Healthy, with 9 tools and TDQS A (3.9/5). This establishes catalog discovery and protocol inspection, not continuous GPU availability.

The original three chat/image/audio README recipes were not each run as new GPU jobs during the 0.8.0 publication step. No synthetic adoption, fabricated testimonials or invented image/audio timings are included. Python syntax and CLI help are checked locally before distributing this kit.


## Approved local tools: 27 October 2026

Two owner-authenticated MCP jobs completed on the live RTX 5080 worker. They are internal synthetic checks, not external adoption or a comprehensive benchmark.

- Decimal/VAT task: 17 x 23.40 + 38 = 435.80; 22% VAT = 95.88; total = 531.68. Delivered totals.csv with these values. Server total: 20.036 seconds.
- Grouped CSV task: Alpha 120.50 + 79.50 = 200.00; Beta 90 + 10 = 100.00. Delivered suppliers.csv. Server total: 17.023 seconds.

Elapsed server times include queue and model loading. These are two observations, not a latency guarantee. The model used GPU inference, and predefined tools used local CPU/RAM. No VM or cloud code execution was used. Backend quote matching is not independent factual or arithmetic verification.

## Public web tools: 27 October 2026

One owner-authenticated MCP version 3 job completed on the live RTX 5080 worker: studio_7e9c4b1d630343c18f09304e4a01d1e9. The trace contained two web_search calls, two read_web calls and one write_file call. It answered in Italian with an exact quote from python.org, a source URL and retrieval date, and delivered research.md. Server total: 22.703 seconds, including queue/model loading. This is one internal functional test, not external demand or a latency/reliability guarantee.

Nine Python web/security tests and 44 interface/routing tests passed. The new PostgreSQL integration fixture passed 14 assertions, including rejecting version-3 claims from workers that only support version 2; legacy version-2 and version-1 integration checks also passed. Browser inspection confirmed public web availability, automatic Italian request routing and the manual research option. Web requests execute on the provider CPU/network, with inference on its GPU, without a VM. Arbitrary code and account actions remain unavailable.

## Web-agent reliability correction

After a reported failed job, the suggested Italian Python-guide request was reproduced locally. Failures included repeated searches exhausting the model context and repeated rejection of non-verbatim quotations. Changes bound web searches to two, reduce search evidence, validate the echoed search query, use an explicit search market, normalize HTML punctuation spacing, remove rejected model answers from context and provide precise citation-repair feedback. Exact quote matching remains enforced. Context/output budgets were raised to 8192/2048 tokens. Worker task errors now retain the engine reason in a local diagnostic report without recording the task input.

The corrected local GPU test completed in 19.438 seconds with two searches, two page reads and guida_python.md. This was an offline development test of the suggested example, not a retry of the user's exact job or an end-to-end Studio test. The original prompt/error was not retained. A public MCP retry was rejected by the existing 24-submission shared daily allowance; no quota or identity was changed.

## Shared capacity: 28 October 2026

At the owner's request, the shared rolling 24-hour Studio submission cap increased from 24 to 72. The 10-per-session/reported-client limit, one active task per session and shared queue of three remain unchanged. Isolated PostgreSQL quota tests passed 47 assertions, including acceptance of submission 72 and rejection at the full cap.

## Session recovery: 29 October 2026

The correction renews expired trial access under the same credential and principal, with a seven-day recovery window after expiry. It rejects unknown, revoked, too-old and non-trial credentials. The Studio retries an authentication failure once, preserving the original payload and idempotency key; concurrent history requests share one recovery call.

Isolated PostgreSQL recovery tests passed 29 assertions, including ownership isolation, quota preservation and idempotent recovery. The existing quota suite passed 47 assertions. All 15 UI tests passed, including expired submissions, existing-job polling and bounded retries. These tests used fixtures, not new GPU jobs or external adoption.

## Implicit web routing: 29 October 2026

Studio now routes common implicit live-information requests, including weather, to the version 3 agent in Automatic mode, and retains web routing for common follow-ups. Research objectives include the request's UTC timestamp and source-verification instructions. Explicit Text reply remains text-only. All 48 routing tests passed, including the reported mixed capabilities/Shanghai weather request.

The live owner test studio_7903c586f55c479a8bce17d32b588f85 failed validation after 13.381 seconds because the model did not supply the required citation. A subsequent local GPU reproduction made web searches but received irrelevant or general results, and a page read exceeded the download limit. It returned an explicit inability to verify the forecast, not a weather prediction. This verifies web invocation, not useful weather retrieval or reliable general research. Search relevance and graceful handling of unavailable evidence remain limitations.

## Weather and evidence handling: 29 October 2026

Added a predefined MET Norway forecast tool for version 3, verified HTTPS using available certifi roots, public-page truncation support, filtering of obviously unrelated search results, and an explicit no-evidence response. Conversation context and search snippets are not treated as retrieved factual evidence by the worker. Verbatim quotation checks remain enabled. The coordinator now accepts the weather tool output and a narrowly defined unavailable-evidence response without citations.

Validation: 23 Python tests; 19 PostgreSQL integration assertions for weather acceptance, unsupported uncited-answer rejection and unavailable-evidence handling; the existing web and local-tool suites each passed 14 assertions. These used fixtures. Deployment completed successfully; the published provider archive and two updated public pages matched their prepared bytes.

Two owner-authenticated live MCP tests then succeeded on the RTX 5080 worker:

- studio_c4d8623381894bc594a69fbe4e72d018: the reported mixed capabilities/Shanghai weather request invoked get_weather and returned a forecast for the following local date, with an exact source citation, MET Norway URL and CC BY 4.0 attribution. Server total 20.407 seconds, including queue/model loading. One citation-repair turn was required.
- studio_2856984fbef5492898bc32872c031df5: reading the supplied official Python tutorial URL invoked read_web and returned an explanation with matching source evidence. Server total 4.543 seconds. This was a direct-URL test, not a general search benchmark.

The first live attempt with the new tool failed because the coordinator's tool-output allowlist had not yet included get_weather; that was corrected before the successful tests above. These are internal functional checks, not external adoption, proof of cost savings or a broad reliability guarantee. The combined weather request prioritized the forecast; it did not produce a full capability overview.

General discovery still uses Bing RSS and can return poor or empty results. An optional Brave Search API adapter is implemented and mock-tested, but no API key is configured and it has not been live-tested. Forecasts use approximate city-centre coordinates and a model-supplied UTC offset; daily ranges summarize forecast samples, not certified extremes. Sources can remain unavailable.
