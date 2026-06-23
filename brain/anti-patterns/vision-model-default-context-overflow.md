---
name: vision-model-default-context-overflow
description: Two screenshots + a real prompt overflow a local vision model's default 4096-token context, returning a misleading HTTP 400 — and the swallowed error body, not the image, is what wastes the hour
type: anti-pattern
---

# Local Vision Model: Default Context Overflows on Two Images

## The pattern

You wire a local vision model (qwen2.5-VL / llava via Ollama) into a compare-two-images flow —
"here's a website clone, here's the original, what's visually off?" You send both screenshots to
`POST /api/chat` with `images:[a, b]`. It returns **HTTP 400**. Your handler logs
`str(HTTPError)` → `"HTTP Error 400: Bad Request"`, which says nothing. So you assume the images
are malformed, or the multimodal API shape is wrong, and burn an hour bisecting the wrong thing.

The real cause: each screenshot costs **~1,900 vision tokens**, so two images + a real prompt ≈
**4,168 tokens** — just over Ollama's **default 4,096-token context**. The model never even runs;
the request is rejected up front.

## Why we don't do it

**Local LLM builder — vision-critique clone loop (2026-06-21).** A new `/api/agent/visioncritique`
endpoint screenshotted the clone + target and sent both to `qwen2.5vl:7b`. It 400'd in ~4 s
(before any inference). Two things compounded the misdiagnosis:

1. **The error was swallowed.** The handler returned `str(HTTPError)` = generic "Bad Request".
   Ollama's actual body — `{"error":{"code":400,"message":"request (4168 tokens) exceeds the
   available context size (4096 tokens)","type":"exceed_context_size_error","n_ctx":4096}}` — was
   sitting unread in `e.read()`.
2. **A short-prompt smoke test passed**, so it *looked* like the endpoint was broken, not the
   request size. The manual test used a ~30-token prompt (total < 4,096); the production prompt was
   ~250 tokens and tipped it over. **Same images, opposite result** — the only variable was prompt
   length, i.e. the token budget.

Seen on the way (a related red herring): a **1×1 test PNG** returns `"Failed to load image or
audio file"` — degenerate images are rejected, which reads like an image-pipeline bug but isn't.

## What to do instead

1. **Set `num_ctx` for any multi-image vision call.** Two images already want ~4k tokens before
   the prompt or the reply. Pass `options.num_ctx` well above that — `8192` fits two screenshots +
   prompt + a JSON answer comfortably. **This is the fix; everything else is diagnosis.**
2. **Always read the HTTP error body.** `str(urllib.error.HTTPError)` hides the cause;
   `e.read().decode()` returns Ollama's JSON with the exact token counts and error *type*. Surface
   it in your own API response so the next person sees `exceed_context_size_error`, not "Bad
   Request." A swallowed upstream error body is its own anti-pattern.
3. **Smoke-test with the production prompt and real image dimensions.** A short prompt or a tiny
   image can pass on token budget while the real payload fails. Reproduce the *actual* request, not
   a convenient miniature — otherwise you "prove" the wrong component innocent.
4. **Budget image tokens deliberately.** Capture screenshots at a bounded viewport (e.g.
   1024×1480, not full-page) so each image stays ~1,900 tokens and the context need is predictable.

The fix is one line (`num_ctx`). The cost of not knowing it: an hour chasing image formats and API
shapes because a 400 said "Bad Request" instead of "you're 72 tokens over the context limit."
