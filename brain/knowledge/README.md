# brain/knowledge/

Ingested external knowledge — notes, papers, talks, links, transcripts. The gbrain-inspired part of `brain/`, kept as markdown until we add the graph layer in Phase C.

## What goes here

- Articles, blog posts, talks, podcasts that informed how we work (with citation + date)
- Distilled summaries of long-form sources (the Founder's Playbook, growth-loops essays, etc.)
- Tweets/threads worth keeping (capture text, not just a link — links rot)
- Personal notes that aren't tied to a single product

## What doesn't go here

- **Product-specific knowledge** → `products/<slug>/`
- **Reusable how-tos** → `factory/playbooks/` (they're for *acting on*, not just knowing)
- **Strategic decisions** → `brain/decision-log/`
- **Things I'd never re-read** → don't save it

## Filename convention

`YYYY-MM-DD-<short-slug>.md` for time-anchored sources. `<topic-slug>.md` for evergreen notes.

## Phase C upgrade

Once we add the entity-extraction + graph layer (gbrain-inspired), every file here gets parsed on write. Entities and typed edges go into `brain/graph/`. Until then, this is greppable markdown.

## Seed entries

_(none yet — populate as we ingest)_
