# 2026-08-26 — A modal, not a page

## The rule

**Default to a modal for any flow the visitor starts from where they already
are.** Buying something, reading the rules, opening a detail view, signing up:
all of it happens over the thing they were looking at.

A separate page earns its existence only when one of these is true:

- The thing is **shareable on its own** — a profile, a job, an article.
- It must **survive a reload** — a payment return, a magic-link landing.

If neither holds, it is a modal.

## Why, and it is not aesthetic

Navigating away loses the thing being decided.

Somebody comparing two rows on a leaderboard and weighing a bid, sent to a
separate page to buy, comes back having lost their place and their train of
thought — and often does not come back at all. Every page transition is a
place to leak, and the leak is largest at exactly the moment somebody was
about to act.

The phrase Hamza used is the one to keep: **reduce friction to value**. The
distance between wanting the thing and having it should be as close to zero as
the flow allows, and a full page load is never zero.

## How it shows up in practice

- Prefer a URL parameter over a route: `?rules=1`, `?join=candidate`. The modal
  is then addressable, shareable and back-button friendly without being a page.
- Server-render the content behind it, so the modal is not a second data path
  that drifts from the first.
- A modal that takes payment still needs a real return URL — the checkout comes
  back to a page, and that page is one of the legitimate exceptions.

## Where this came from

GetHired shipped its sponsor purchase as a route. Reading the rules, opening a
profile and joining were already modals, so the one flow that takes money was
also the one that threw the buyer out of the board to complete it.
