# 2026-08-13 — Serve both arrivals through one engine

**Decision:** Muakkil serves two entry points with a single journey — a founder with an idea and
nothing else, and a founder whose app is already built but has no users. Rather than branching
into two products, the six-stage machine stays as-is and steps a given founder doesn't need
become declinable. The front page names both arrivals explicitly instead of abstracting up to
"founders".

**Why (and what was recommended instead):** A capability audit found Muakkil addressing four
different people across four surfaces — the front page still sold the buildathon assistant
superseded on 2026-07-02, llms.txt and /pricing sold the venture agent to non-technical
founders, the live demand test at /login targeted churned AI-builder founders, and the engine
itself assumed someone with only an idea (the Maker builds their page from scratch). The
recommendation on record was to **narrow to churned builders**: findable (25M Lovable projects,
most going nowhere), pain that is dated and specific, effort already sunk, and a segment Lovable
structurally cannot serve because it is paid per build. That narrowing would have made the
Seeker and Herald the product and demoted the Maker. The operator chose breadth instead. This
entry records the recommendation and the override, so the trade is legible later.

**How breadth was kept from becoming vagueness:** the `skipped` step status has been understood
by `stageComplete` since slice 1 but nothing could ever set it, so every founder was walked
through every stage regardless of fit. `skipStep` exposes it. The brief and the weekly report
stay mandatory — every later muakkal reads the brief, and the report is the only thing that ever
tells the founder the truth about what happened.

**What would prove it wrong:** beta founders skipping so many steps that no coherent product
remains for either arrival; or the two groups needing genuinely different agents rather than the
same agents in a different order; or a conversion gap showing one arrival converting while the
other never finishes. Any of those means the narrowing should have happened.

**Revisit trigger:** the validation gate on 2026-08-16 — the five conversations recruit
specifically from churned builders, so they answer this with evidence rather than reasoning. Or
after 10 beta ventures, if the skip pattern splits cleanly into two populations.

**Open, and larger than this decision:** Muakkil drafts; it does not do. Every outward action
except the welcome email is a draft the founder executes themselves. Until that changes, "we run
the post-build half" describes homework, not a service.
