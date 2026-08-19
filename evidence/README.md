# evidence/ — what a stranger can open

Every "✅ proven" badge in [BEST-PRACTICES.md](../BEST-PRACTICES.md) is a claim.
This folder is where the claims keep their receipts: the dated output of a real
run, a failing-then-passing test, a screenshot, a scorecard.

**The rule: a badge without an artifact here is a promise, not a proof.**

## Why this exists

The factory could already say a practice was proven. It could not *show* you.
Two repos studied on 2026-08-16 do better, in opposite ways:

- `robiot/fable-os` keeps 26 run artifacts — serial logs, screenshots, and an
  FFT analysis measuring what a model-written audio driver actually produced.
  Its artifact index spends more space on **failures** than successes, and names
  one of them "the most useful failure in this directory."
- `deepseek-ai/deepseek-harness` makes candour mechanical: a lint fails the
  build if a package README lacks a limitations section. That single gate is why
  its docs will tell you its sandbox does not confine network traffic.

Both are more inspectable than a badge. This folder closes that gap.

## What goes in

One folder per claim: `YYYY-MM-DD-<slug>/` containing

| File | What it is |
|---|---|
| `README.md` | what was claimed, what was run, what came back — including what it did NOT prove |
| the raw output | terminal capture, JSON, log, screenshot — unedited |
| `ledger.jsonl` *(when relevant)* | the hash-chained record from `bun run verify` |

**Lead with the failure.** An evidence folder that only holds successes is
marketing. The run where something broke is the one that makes the rest
credible.

## What does NOT go in

- **Anything from a conversation.** Transcripts, drafts, and strategy notes are
  chat-only, permanently — that invariant is absolute and this folder is not an
  exception to it. Artifacts are *program output*, not discussion.
- **Secrets, keys, or `.env` contents** in captured output. Scrub before saving;
  a terminal capture is a file like any other.
- **Absolute local paths** that identify a machine. This repo is permanently
  public.
- **Aspirational artifacts.** A run you intend to do is not evidence.

## Adding evidence

```bash
bun run verify --all          # runs the gates, records real exit codes
bun run verify --show         # the ledger + the rendered Checked line
```

Copy the output into a dated folder with a README that states plainly what it
proves and what it doesn't. The second half is the part that earns trust.

## Index

| Date | Folder | What it shows |
|---|---|---|
| 2026-08-16 | [`2026-08-16-verification-ledger/`](2026-08-16-verification-ledger/) | The first run of the verification ledger — six gates passed, one **failed**, and the failure was a real rule violation the receipt would otherwise have glossed |
