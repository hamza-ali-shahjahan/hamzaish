# 2026-09-22 — License moved AGPL-3.0 → MIT

**Decision.** Hamzaish is MIT from v2.34 on: `LICENSE` (canonical MIT text,
copyright Hamza Ali Shahjahan), `package.json`, the README badge and `## License`
section, `docs/FAQ.md`, `docs/contributing.md`, `AGENTS.md`, `BEST-PRACTICES.md`,
and hamzaish.com. The dual-licensing path retires with it: no more
"commercial license on request", and contributions are plain inbound-MIT instead of
AGPL-plus-a-relicensing-grant. One line in the README now carries what the license
does not: the name and logo aren't part of the grant.

This reverses `meta/changelog.md`'s v1.9 entry (2026-06-02), where three options were
laid out — MIT (max openness, zero protection), AGPL (open + chargeable), BSL (max
protection) — and AGPL was chosen as the balanced middle with a paid-license door.

**Why.** Hamzaish is a kit people copy *into* their own products — the Next.js
starter in `templates/product-starter-nextjs/`, the hooks, the doc templates — not an
app people run. AGPL fits the second shape (the June research was a study of
self-hosted apps: Grafana, Cal.com, Redis). For the first shape it taxes the exact
person Hamzaish is for: on the standard reading of AGPL §13, a founder who scaffolds
from the starter, changes it, and serves it over a network owes their users the
source of their product. The positioning settled in the same week — "the AI cofounder
for solo builders and founders" — made that contradiction load-bearing rather than
theoretical. Against it, the thing AGPL bought was optionality on commercial
licenses: three and a half months and 9 stars in, nobody has asked. The projects
Hamzaish credits and is compared to (agent-skills, gbrain, hermes-agent) are MIT.

Relicensing was clean: all 249 commits are the operator's own (two spellings of one
name, one GitHub identity), no outside contributors, no vendored third-party code —
`references/` holds only a README, the clones are gitignored.

**What would prove this wrong.** A fork shipped under the Hamzaish name, or a paid
product that is Hamzaish with a new coat of paint and takes the oxygen — the two
things AGPL made harder and a README line does not. Or a serious commercial-license
request arriving after the door closed.

**Revisit trigger.** If either of the above happens, the answer is a trademark note
(and possibly registration) plus an open-core split, not a license reversal: MIT is
one-way for everything already published. Otherwise revisit only if a second
maintainer joins and wants a contributor agreement.
