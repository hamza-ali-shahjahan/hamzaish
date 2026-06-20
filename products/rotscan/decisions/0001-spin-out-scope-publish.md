# 0001 — Spin rotscan out of Hamzaish, publish to npm under the @hamzaish scope

- **Date**: 2026-06-21
- **Decision**: Extract the in-factory `/tidy` cleanup capability into a standalone, public MIT CLI named **rotscan**, and publish it to npm as **`@hamzaish/rotscan`** (scoped) rather than the unscoped `rotscan`. The brand, GitHub repo, and the CLI command all stay `rotscan`; only the npm install address carries the `@hamzaish/` scope.
- **Why**:
  - The cleanup tool surfaced while *tidying Hamzaish itself* and is useful for any git repo, not just the factory — so it earns its own home (lower barrier to adoption than "clone the whole factory").
  - The `@hamzaish` scope was **forced and welcome**: npm rejected the unscoped name at publish time with `E403 — too similar to existing package 'rot-scan'`. (Lesson: a 404 on the exact name means *available*, not *publishable*; npm's similarity guard only fires at publish.) Scoping both unblocks the publish and bakes the Hamzaish lineage into the package name — the brand attribution we wanted anyway.
  - MIT (not Hamzaish's AGPL-3.0) to maximize tool adoption; AGPL deters CLI uptake.
- **What would prove it wrong**:
  - Nobody runs it — issues/PRs/"it caught X" stay at zero after the launch window (vanity stars only). Then the spin-out wasn't worth the maintenance surface.
  - The `@hamzaish/` scope measurably suppresses installs vs. a memorable unscoped name (hard to know without an A/B, but watch for "couldn't find rotscan on npm" confusion).
- **Revisit trigger**: First real traction signal (or its absence) ~4 weeks post-launch; or if a clearly-better unscoped/renamed distribution becomes available, reconsider the scope. Also revisit if Node-native distribution lands (changes the install story).
