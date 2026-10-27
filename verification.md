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
