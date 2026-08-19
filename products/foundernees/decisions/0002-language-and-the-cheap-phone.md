# 0002 — Accessibility is a number, not a value: English-first, translation-ready

- **Date**: 2026-08-16
- **Decision**: v1 of the marketing site ships **English-only**, but every string lives
  in a single content layer written for translation (short sentences, no idioms that do
  not survive Urdu, no text baked into images), and **Urdu ships before the platform
  does**. The accessibility promise is enforced numerically from day one: LCP < 2.5s and
  < 400 KB on a throttled mid-tier Android, Flesch-Kincaid grade ≤ 8 on every core page.
- **Why**: A movement built "for the office boys of the world" that assumes English
  fluency, a fast phone, and a laptop has already excluded the people it names — and that
  exclusion is invisible unless it is measured. Making it a CI number means a future
  session cannot quietly regress it in exchange for a nicer hero animation. English-first
  is the pragmatic start (the early audience reachable in week one — students, campus
  societies, tech-adjacent networks — reads English), but shipping copy that was never
  written for translation is what makes Urdu a rewrite instead of a release. Writing for
  translation now costs nothing; retrofitting costs the launch.
- **Alternatives considered**: (a) **bilingual v1** — rejected as doubling v1 scope
  for an early audience (students, campus societies, tech-adjacent networks) that already
  reads English; (b) **English-only with no translation layer** — rejected because copy
  never written for translation makes Urdu a rewrite instead of a release, which is the
  expensive failure this decision exists to avoid.
- **What would prove it wrong**: signup drop-off concentrated in non-English-medium
  cities, or the first 5 target-user interviews showing English is the barrier rather
  than awareness. Either signal moves Urdu into v1.1, not v2.
- **Revisit trigger**: at 1,000 signups, or at the first partner conversation with an
  institution serving non-English-medium students — whichever comes first.
