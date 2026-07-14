---
description: Run the full engineering cycle autonomously end-to-end — spec → plan → build → test → review → ship — making reasonable calls without stopping at every gate. Use /full-cycle instead when the user wants to approve each gate; use /goal instead when there's a measurable objective to converge on.
---

Invoke the **auto-orchestrator** skill.

Run the full development cycle autonomously for what the user asked: chain spec → plan → build → test → review → (simplify) → ship, picking the right skill for the current state of the work and advancing on your own judgment. This is the no-gates sibling of `/full-cycle`: keep moving and report progress, but still **pause for genuinely ambiguous decisions or irreversible/outward-facing actions** (deploys, deletes, sending anything external, spending money).
