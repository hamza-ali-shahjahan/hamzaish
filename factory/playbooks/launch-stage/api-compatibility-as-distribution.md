# API compatibility as distribution

**The move.** When entering a market whose incumbent has an entrenched API and
SDK ecosystem, ship **compatible with the incumbent's API** instead of asking
users to adopt yours. Every existing SDK, tutorial, integration, and muscle
memory becomes your distribution channel on day one; the switching cost you
must overcome drops to an env-var change.

**The evidence.** AgentENV (kvcache-ai, studied 2026-07-30 — `references/README.md`)
launched 1 week old to 2k+ stars with zero first-party SDKs: it implemented the
E2B sandbox API (`/sandboxes`, `/templates`, envd protocol, header aliases), so
`pip install e2b` / `npm install e2b` work unchanged with `E2B_API_URL` pointed
at it. Their CI runs the incumbent's own SDKs as the compatibility test suite.
The single smartest product decision in that repo. Older proof of the same
pattern: S3-compatible storage (every provider), OpenAI-compatible `/v1/chat/
completions` (the entire local-LLM ecosystem, incl. how litellm/Ollama won
defaults).

**When it applies.**
- The incumbent's API is a de-facto standard with real SDK gravity.
- You compete on runtime qualities (price, speed, locality, privacy, isolation)
  rather than interface novelty.
- You can honestly pass a meaningful subset of their SDK's behavior.

**When it doesn't.**
- Your differentiation IS the interface/model (compat would flatten it).
- The incumbent's API churns fast or is legally encumbered — you inherit their
  breaking changes and their semantics forever (coupling is the price).
- You can only fake a thin subset: a compat layer that half-works burns trust
  faster than no layer (honest-copy principle applies to compat claims — ship a
  compatibility MATRIX, not the word "compatible").

**How (checklist).**
1. Pick the smallest incumbent-API subset that makes their quickstart work
   unchanged. That's the launch bar.
2. CI runs the incumbent's real SDKs against you (AgentENV pattern) — compat is
   a tested contract, not a README claim.
3. Publish the compatibility matrix — supported / partial / absent, versioned.
4. Add your differentiated surface as ADDITIVE endpoints, never by mutating
   compat semantics.
5. Name the escape hatch: what breaks if the incumbent changes v-next, and who
   watches for it.

**Hamzaish application.** Any product entering an API-shaped market (first
candidate: Muakkil's venture-agent distribution — agent/skill runtimes have
emerging de-facto standards worth riding rather than fighting). At naming/GTM
time, ask: *whose ecosystem could this product inherit instead of building?*
