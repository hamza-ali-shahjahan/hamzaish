# Anti-pattern: the auto-captured skill landfill

**The failure.** Automated skill capture — "the agent writes a new skill after
each task" — run without governance produces a landfill, not a library: near-
duplicate families, `-enhanced-enhanced-enhanced` mutation chains, empty files,
and a majority of "skills" that encode workarounds for the harness's own tool
defects rather than transferable knowledge. Retrieval then degrades for every
skill, including the good ones: the landfill poisons ranking, listing budgets,
and the model's trust in the library.

**The evidence (control group).** OpenSpace (HKUDS) committed its pipeline's
actual output: `benchmarks/gdpval/skills/` — 203 auto-generated skills from one
benchmark run. Observed 2026-07-30: ten near-identical `document-gen-fallback`
variants, `audio-track-production-enhanced-enhanced-enhanced`, one empty
`SKILL.md`, ~53% of names matching fallback/workaround/retry patterns, ~20
distinct skills about PDF text extraction. No dedup, no merge, no retirement
step exists in the pipeline. This is the experiment we didn't have to run —
see `references/README.md` → OpenSpace.

**The rule.** Skill capture from experience is allowed ONLY through the gates
that already exist for hand-written skills, plus one:

1. **MECE gate first** (skill-authoring playbook): patch the skill in use →
   patch an umbrella → support file → only then a NEW skill, class-level only,
   overlap check recorded.
2. **Dedupe against the existing library BEFORE authoring** — a candidate that
   overlaps an existing skill becomes a patch to it, never a sibling.
3. **Eval named at creation** (feature-slicing rule) — a skill that can't state
   its eval doesn't get created.
4. **Operator ratification** (`/learn-loop`'s gate) — capture proposes,
   the operator promotes.
5. **Retirement exists** — the quarterly curator pass (`/kill-or-keep`) archives
   dormant skills (`bun run skill-report` names them). Archive, never delete.

**Smell test.** If a proposed skill's name wants a suffix (`-v2`, `-enhanced`,
`-fixed`), it's a patch to an existing skill or a harness defect to fix — log
the defect (`bun run defect log`), don't mint a skill.

**Why it matters here.** "Skill creation from experience" has been on our mine
list since the hermes-agent study. The want is still valid — this entry is the
spec for the brakes it must ship with, proven necessary by a 7k-star repo that
shipped without them.
