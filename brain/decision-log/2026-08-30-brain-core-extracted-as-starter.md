# 2026-08-30 — Brain-core extracted to `templates/brain-starter/`, deliberately thinner than Hamzaish's own

**Decision.** Phase 2 of the Company Brain plan (`brain/decision-log/2026-08-29-company-brain-phase-1.md`):
ported `brain/ingest.ts`/`ask.ts`/`freshness.ts`/`schema.sql` into
`templates/brain-starter/` — a copyable "brain" folder any product repo can
drop in to get its own FTS5 search, independent of Hamzaish's. First
intended adopter: Muakkil's founder-brain (each venture's idea, decisions,
build state — currently nowhere searchable).

**What was deliberately dropped, not just copied:**
- **The `entities`/`edges` Phase-C stub tables** — unused stubs tied to
  Hamzaish's own roadmap, not to the pattern itself. A starter shouldn't ship
  dead tables for a phase the adopter hasn't reached.
- **The products-aware corpus walk** (per-slug rules, `decisions/`,
  `learnings/`, etc.) — Hamzaish-specific folder shape. Replaced with a
  single default rule: every `.md` under the repo root, tagged by top-level
  folder. Documented how to replace it with per-folder rules once an adopter
  actually needs them, pointing at Hamzaish's own `corpus.ts` as the worked
  example of outgrowing the default.
- **`--context` mode** (the grouped "Defenses / Learnings & decisions /
  Other" injection block `/work-on` uses) — tied to Hamzaish's own
  anti-patterns/decision-log vocabulary. Not ported; an adopter builds their
  own grouping once they have an equivalent workflow to feed.
- **`check-status-staleness`** was NOT genericized into the starter — it
  reads a `stage`/`status` shape specific to `product.config.json` and is
  git-log based in a way that assumes the product repo *is* the git repo
  being measured. Left as a worked example to port by hand, not auto-included.

**What was deliberately kept, unchanged:** the freshness-refresh-on-query
pattern and the gap-line ("what this search didn't cover") — both are
general and cheap, and shipping them by default means a brand-new adopter
starts past where Hamzaish's own brain began (those landed in Hamzaish only
in the last two days, `brain/decision-log/2026-08-29-company-brain-phase-1.md`
and `brain/decision-log/2026-08-20-recall-refreshes-itself.md`).

**One consistency call worth naming:** the starter indexes its own
`brain/README.md` as a document (source tag `brain`), same as Hamzaish's own
`brain/corpus.ts` indexes Hamzaish's own `brain/README.md`. Considered
excluding a starter's self-documentation as noise, but that would diverge
from the exact pattern being ported for no real reason — the tool's own docs
showing up in its own search is harmless and matches the source behavior.

**Why.** A shared brain-core does not mean a shared brain — each product's
instance is separate data, separate database, never pointed at Hamzaish's
own. The starter's README states this as "the one rule."

**What would prove this wrong.** If Muakkil (or any adopter) copies the
starter and immediately needs the products-aware walk or `--context` mode
back — i.e., the "thinner than Hamzaish's own" cut removed something that
turns out to be load-bearing on day one rather than "add when needed."

**Revisit trigger.** When Muakkil's own team actually adopts this (not yet
done — this ships the capability, not the adoption). Also revisit alongside
Hamzaish's own Phase 3 (vector/RRF) — if that ships and proves out, decide
then whether it belongs in the starter too or stays a Hamzaish-only upgrade
until a second adopter needs it.
