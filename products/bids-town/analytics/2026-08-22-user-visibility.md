# bids.town — user visibility (2026-08-22)

Owners ARE shops here (no accounts): the per-user dashboard is the per-shop
table in /admin — spend, tier, clicks/views/likes, moon hours, owner edits —
all first-party. Activation ladder: claimed ($1 paid) → customized (saved in
/manage) → earning (first real click-through received).

Instant path: webhook → founder alert per claim (+ notification_skipped
events when email config gaps). Safety net: daily 9:00 digest cron, 26h
window, idempotent by shape. Interactions: /api/track with an ALLOWLIST as
the taxonomy — tour_stop{key}, moon_open, launch_watched, claim_submitted —
DNT respected, bots silently dropped, unknown names discarded.

Surface-level ad attribution rides /r/<slug>?s=<surface> into clicks.surface.
