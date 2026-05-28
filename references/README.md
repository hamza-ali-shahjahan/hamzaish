# references/

Third-party repos cloned for **study**, not runtime use. Do not `import` from these. Do not symlink their code into `factory/`. Mine ideas, copy patterns, port small pieces with attribution.

If you need to update a clone:
```
cd references/<name> && git fetch --depth=1 && git reset --hard origin/HEAD
```

---

## The big realization

These three projects **compose by design**. Garry Tan built gbrain as the brain layer for his own openclaw + hermes-agent deployment.

| Layer | What it does | Project |
|---|---|---|
| **Channels** | Where users talk to the agent (WhatsApp, Telegram, Slack, iMessage, voice, …) | openclaw |
| **Agent runtime** | The thing that thinks, acts, learns, self-improves | hermes-agent |
| **Brain / memory** | Knowledge graph + hybrid retrieval + synthesis with citations | gbrain |

For Hamzaish:
- **Phase A–B**: Claude Code is our agent runtime + channel (terminal). We don't need hermes or openclaw yet.
- **Phase C**: mine gbrain's patterns to build our own brain layer (or wrap gbrain directly if it fits).
- **Phase E**: revisit openclaw when we need cross-channel GTM (Slack/Discord outreach, voice charges, etc.).
- **Hermes**: read its self-improvement loop pattern for our `meta/` layer. Stay Claude-Code-native; don't port the Python.

---

## gbrain — github.com/garrytan/gbrain

**What it is**: A personal/team brain that ingests notes, meetings, emails, tweets, and ideas; auto-extracts entities and typed edges (`works_at`, `attended`, `invested_in`, …); answers questions with synthesized prose + citations and explicit gap analysis. TypeScript, Bun, PGLite by default. **+31.4 P@5 over BM25+vector-only** on its own bench.

**What to mine**:
1. **Graph wiring**: entity extraction + typed-edge creation on every write, zero LLM calls. → `src/`, `docs/`.
2. **Hybrid retrieval**: vector + BM25 + reciprocal-rank fusion (RRF), optional reranking. Steal the RRF formula directly.
3. **Synthesis with citations + gap analysis**: the answer always includes "what the brain doesn't know yet." Apply this to our `/brain ask` skill.
4. **Skill format**: `gbrain/skills/` mirrors Claude Code skill conventions. Lift any skill that matches our needs.
5. **AGENTS.md / CLAUDE.md / llms.txt patterns**: read these — Garry's a careful prompt engineer.
6. **Eval methodology**: `gbrain/evals/` shows how to bench retrieval quality. Adopt for our `meta/evals/`.

**Verdict for Hamzaish**: study deeply in Phase C. Strong candidate to **wrap directly** (we run gbrain as the brain process; Claude Code agents query it via MCP or HTTP) instead of re-implementing.

**Note**: gbrain has `openclaw.plugin.json` — it ships as an openclaw plugin out of the box.

---

## hermes-agent — github.com/nousresearch/hermes-agent

**What it is**: Nous Research's self-improving autonomous agent. Python. Closed learning loop (creates skills from experience, improves them in use, persists knowledge, searches its own past). Model-agnostic (200+ models). Multi-channel gateway. Runs on a $5 VPS or GPU cluster.

**What to mine**:
1. **Self-improvement cycle**: how it decides what to remember, when to extract a new skill, how it nudges itself to persist. → Read `agent/`, `skills/`, `RELEASE_v0.14.0.md`.
2. **Skill creation from experience**: after a complex task, hermes can generate a new skill. We want this in `meta/`.
3. **Session search with FTS5 + LLM summarization**: how it does cross-session recall. → mirror in our `brain/learnings/`.
4. **Trajectory compression**: how it shrinks long sessions for training data. Useful pattern for `meta/retros/`.
5. **AGENTS.md and `hermes-already-has-routines.md`**: read for prompt-engineering conventions.

**Verdict for Hamzaish**: reference-only. Stay Claude-Code-native; we don't run hermes. Adopt the **concepts** (self-improving skills, dialectic user modeling, learning-loop nudges) inside our `meta/` and `brain/` layers.

---

## openclaw — github.com/openclaw/openclaw

**What it is**: Personal AI assistant gateway. Routes between channels (WhatsApp, Telegram, Slack, Discord, iMessage, voice, 20+ more) and your agent runtime. TypeScript monorepo. Has companion apps for macOS/iOS/Android and a Canvas visual workspace.

**What to mine**:
1. **Channel adapter pattern**: how it abstracts 20+ messaging platforms behind a single interface. → `packages/`, `apps/`.
2. **Gateway control plane**: sessions, channels, tools, event routing. → `src/`.
3. **Voice Wake + Talk Mode**: voice-first agent interaction. Relevant to Muakkil's Scribe.
4. **Skills marketplace shape**: `skills/` is structured for distribution. Useful when our factory has shareable skills.

**Verdict for Hamzaish**: parking lot. Don't touch in Phases A–D. Revisit in Phase E when we need cross-channel GTM/outbound (cold outreach via Slack/Discord/Telegram, customer support across channels).

---

## Discipline

- **Never `import` from `references/`** into anything in `factory/`, `brain/`, or `products/`.
- **Never symlink** their internal modules into our tree.
- If a pattern is worth porting, **port the idea, not the file**. Write our own in `factory/` and link back here in a comment.
- If we end up running gbrain as a process (Phase C), it goes alongside Hamzaish as a sibling system, not inside it. References stays read-only.
