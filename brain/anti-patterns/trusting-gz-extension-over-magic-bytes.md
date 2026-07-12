---
name: trusting-gz-extension-over-magic-bytes
description: Client code gunzipping a fetched asset because its URL ends in .gz — dev servers and CDNs disagree on whether the bytes arrive compressed, so the same code double-decompresses on one and works on the other
type: anti-pattern
---

# Trusting the .gz Extension Over Magic Bytes

## The pattern

A product ships a large binary asset pre-compressed (`data.u8.gz`), fetches it in the browser, and decompresses it manually — with the decision to gunzip keyed off the **URL extension**: "ends in `.gz`, so run it through `DecompressionStream('gzip')`."

The hidden assumption is that a `.gz` file always arrives as gzip bytes. It doesn't. What the client receives depends on the **server**, not the filename:

- **vite's preview server (sirv)** sees `foo.gz` and serves it with `Content-Encoding: gzip` — the browser transparently decompresses before your code ever sees the bytes. The manual `DecompressionStream` then double-decompresses plain bytes, and the fetch dies with `ERR_ABORTED`.
- **Vercel** serves the same file raw, no `Content-Encoding` — the manual gunzip is required and works.

Identical code, opposite behavior, decided by which server happens to be in front of the file. And because fire-and-forget asset loads are commonly wrapped in a `.catch(()=>{})`, the failure is **silent**: no console error, just a feature that quietly never renders on one serving stack.

## Why we don't do it

**Incident 2026-07-12 (ThousandWorlds Explorer):** `tw-surface.u8.gz` — a pre-compressed surface-data asset — loaded fine on Vercel but died with `ERR_ABORTED` under `vite preview`, invisibly, behind a `.catch(()=>{})`. The extension-based gunzip double-decompressed the browser-already-decompressed stream. Because the two environments disagreed, whichever one was tested first "proved" the code correct and the other shipped broken.

The pre-compression itself was the right call: CDNs won't compress `application/octet-stream`, so large binary assets ship uncompressed unless you gzip them yourself. The mistake wasn't shipping `.gz` — it was letting a **filename** claim what only the **bytes** can prove, in a channel (`Content-Encoding`) that servers are allowed to consume before your code runs.

## What to do instead

1. **Sniff the gzip magic bytes on the fetched buffer** — decide from evidence, not the URL:

   ```js
   const buf = await (await fetch(url)).arrayBuffer();
   const bytes = new Uint8Array(buf);
   const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
   const raw = isGzip ? await gunzip(buf) : buf; // DecompressionStream only when actually compressed
   ```

   This is correct on every server: raw `.gz` gets gunzipped; transparently-decoded bytes pass through.

2. **Verify pre-compressed asset loading on BOTH serving stacks** — a dev-preview server (`vite preview`) AND prod-like serving (Vercel/production CDN) — before calling it done. Any code path that behaves differently per server must be tested per server; one green environment proves nothing about the other.

3. **Never bury asset-load failures in an empty `.catch`.** At minimum log the URL and error — the ThousandWorlds failure cost extra diagnosis time purely because the fetch died silently.

## When this might not apply

- Server-side/Node code reading `.gz` files straight from disk — no HTTP layer exists to transparently decode, so the bytes are what the filename says (sniffing is still cheap insurance).
- Assets served with an explicit, controlled `Content-Type`/`Content-Encoding` contract you own end-to-end — but a magic-byte check is two comparisons; keep it anyway.

## Related

- Same family as verify-with-the-network-tab thinking: trust observed bytes/requests over what the code or filename claims.
- `claude-touched-secrets-file.md` — same shape of lesson: the failure lives in a layer (harness watcher / HTTP content negotiation) neither the code nor the author was looking at.
