# Eval rubric — /security-check (contract pins)

Same honest label as /ship's rubric: a **contract pin** on the command file's
load-bearing checks, not a behavioral run (a planted-issue fixture-repo behavioral case
is the named upgrade path when the debt budget next allows). A false-green security
audit is the worst false-green in the factory — these pins guarantee the audit can't
silently lose a check class.

## Assertions (the command file contains the check class)

| # | Pinned check |
|---|---|
| A1 | gitleaks secret scan |
| A2 | Action pinning + the `claude-code-action >= v1.0.94` advisory floor |
| A3 | MCP-config surface check |
| A4 | RLS reminder |
