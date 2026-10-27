# Verification notes

The existing 0.8.0 deployment passed 72 integration assertions and 45 adoption/limit assertions before publication on 2026-10-23.

A live owner-authenticated chat check on 2026-10-23 at 15:25 UTC returned 493 for 17 * 29. Server timings: queue 0.511 seconds, total 16.448 seconds, model load 5.120 seconds, inference 0.121 seconds. Resuming the saved job succeeded without duplicate submission. This was one internal test, excluded from adoption counts, not a speed guarantee.

That live check used the published Python client with an owner Bearer authentication adapter. It did not establish a new public trial session.

On 2026-10-24 Glama displayed the AWS connector as Healthy, with 9 tools and TDQS A (3.9/5). This establishes catalog discovery and protocol inspection, not continuous GPU availability.

The three README recipes have not each been run as new GPU jobs during this publication step. No synthetic adoption, fabricated testimonials or invented image/audio timings are included. Python syntax and CLI help are checked locally before distributing this kit.
