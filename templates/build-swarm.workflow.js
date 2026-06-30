export const meta = {
  name: 'build-swarm',
  description: 'Fan out one build phase across slices: each slice runs build -> verify in parallel.',
  phases: [
    { title: 'Build' },
    { title: 'Verify' },
  ],
}

// Copied into a product repo by /swarm. An autonomy session invokes it per phase:
//   Workflow({ scriptPath: 'scripts/build-swarm.workflow.js',
//              args: { slug: '<slug>', phase: 'Phase 1 — engine',
//                      slices: [ {key, prompt}, ... ] } })
//
// A "slice" is an independent unit of work named in docs/PLAN.md (a page, a component,
// a pipeline stage, a worker). Each is built by one agent, then adversarially verified
// by another as soon as its build finishes (pipeline, not barrier) — so a fast slice's
// verifier isn't blocked waiting on a slow slice's build.

const slug = (args && args.slug) || 'product'
const phase = (args && args.phase) || 'build'
const slices = (args && args.slices) || []

if (!slices.length) {
  log('No slices passed — nothing to fan out. Pass args.slices = [{key, prompt}].')
  return { built: [], note: 'no-op' }
}

const BUILD_SCHEMA = {
  type: 'object',
  required: ['key', 'summary', 'files_changed', 'self_check'],
  properties: {
    key: { type: 'string' },
    summary: { type: 'string' },
    files_changed: { type: 'array', items: { type: 'string' } },
    self_check: { type: 'string', description: 'command(s) run + result' },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['key', 'passes', 'reason'],
  properties: {
    key: { type: 'string' },
    passes: { type: 'boolean' },
    reason: { type: 'string' },
    fixes_needed: { type: 'array', items: { type: 'string' } },
  },
}

const results = await pipeline(
  slices,
  (slice) =>
    agent(
      [
        `You are building ONE slice of ${slug} (${phase}). Read START-HERE.local.md, CLAUDE.md, docs/PLAN.md (and docs/MOCK-MODE.md if present) first.`,
        `Slice "${slice.key}": ${slice.prompt}`,
        `Constraints: branch-only, no push/deploy/secrets, mock-mode must stay verifiable with zero secrets, extend tests (don't strip).`,
        `Implement it, run the relevant check (typecheck/test/e2e/route boot) yourself, and report.`,
      ].join('\n'),
      { label: `build:${slice.key}`, phase: 'Build', schema: BUILD_SCHEMA },
    ),
  (build, slice) =>
    agent(
      [
        `Adversarially verify the ${slug} slice "${slice.key}". Assume it is NOT done until proven.`,
        `Original intent: ${slice.prompt}`,
        `Builder claims: ${build ? build.summary : '(build failed/null)'} — files: ${build ? (build.files_changed || []).join(', ') : 'none'}.`,
        `Re-run the check yourself (build/typecheck/test/e2e or boot the route). Confirm it still passes with zero secrets.`,
        `Return passes=true ONLY if you re-verified it. List concrete fixes_needed otherwise.`,
      ].join('\n'),
      { label: `verify:${slice.key}`, phase: 'Verify', schema: VERDICT_SCHEMA },
    ).then((v) => ({ slice: slice.key, build, verdict: v })),
)

const clean = results.filter(Boolean)
const passing = clean.filter((r) => r.verdict && r.verdict.passes)
const failing = clean.filter((r) => !r.verdict || !r.verdict.passes)
log(`${phase}: ${passing.length}/${clean.length} slices verified passing.`)

return {
  phase,
  passing: passing.map((r) => r.slice),
  failing: failing.map((r) => ({ key: r.slice, fixes: r.verdict && r.verdict.fixes_needed })),
}
