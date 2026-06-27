# MCP Servers — Per Product

## The framework in one paragraph

Model Context Protocol (MCP) servers expose tools and data to Claude (and other LLMs) via a standard protocol. Each product in this factory benefits from a curated MCP stack — read-only access to its own analytics + the DB + GitHub gives Claude (and you) instant context for any work session. Don't wire MCPs that ship secrets to LLMs that might mishandle them. Read-only by default; mutations require explicit user approval.

## When MCPs help

- Investigating a bug: Claude can query Sentry + DB directly
- Writing a status update: Claude can pull metrics from PostHog + Stripe
- Doing a security review: Claude can read the codebase + check dep CVEs
- Customer support: Claude can look up a user's record + their recent events

## When MCPs hurt

- Slow tool calls add up — every read costs latency
- Too many tools confuse the model (15+ tools = degraded performance)
- Mutable tools without confirmation = accidents

## Standard MCP stack per product

Configure in `<product>/.claude/mcp.json`:

| MCP | Purpose | Mode |
|---|---|---|
| **filesystem** | Read/write project files | built-in, default |
| **github** | Repo ops (PRs, issues, code search) | read by default; write requires confirm |
| **supabase / postgres** | Query the DB | **read-only** (separate user) |
| **stripe** | Customer / subscription lookups | **read-only** |
| **posthog** | Event + funnel queries | read-only |
| **sentry** | Issue + event lookups | read-only (often already global in `~/.claude/`) |
| **search-console** | Top queries, position changes | read-only |
| **resend** | Email send (only for support replies, with confirm) | requires confirm |
| **inngest** | Job run history, retries | read-only |

## What NOT to wire

- Production write-DB connections (use read-only replica or RLS-restricted role)
- Stripe with write scope (subscription mutation should always be user-confirmed in UI, not LLM-driven)
- Slack with channel-post scope (LLMs sending messages = accidents waiting)
- AWS / GCP with billing scope
- Anything with destructive defaults (rm, drop table, force-push)

## Configuration template

`<product>/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    },
    "postgres-readonly": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://readonly@..."]
    },
    "posthog": {
      "command": "npx",
      "args": ["-y", "posthog-mcp"],
      "env": {
        "POSTHOG_API_KEY": "phx_...",
        "POSTHOG_PROJECT_ID": "..."
      }
    }
  }
}
```

(Adjust per the actual MCP package names; check `modelcontextprotocol/servers` repo for current.)

## Setup for the factory itself (root level)

The factory directory itself benefits from:
- **filesystem** — read across all products
- **sentry** — pull data across all products (likely already global, see top-level system prompt)
- **github** — manage all products' repos

These wire at `~/.claude/mcp.json` (global) or this folder's `.claude/mcp.json` (project-scoped).

## Security checklist for MCP

- [ ] All API tokens are scoped to read-only where possible
- [ ] Tokens are revocable independently (separate from your main account creds)
- [ ] No production write-access tokens in MCP configs without user-confirm prompts
- [ ] `.claude/mcp.json` is gitignored if it contains tokens
- [ ] Use env var references where the tooling supports them

## When to build a custom MCP

If a product depends on a SaaS the standard MCPs don't cover (e.g., a niche industry CRM), build a custom MCP:
- It's a small server (Node/Python) implementing the MCP spec
- Exposes 3-10 tools (don't sprawl)
- Returns clean structured data
- Lives in the product repo at `tools/mcp/` or as a separate small package

Reference: `anthropic-skills:mcp-builder` skill (already available in this Claude session).

## Source for follow-up

- modelcontextprotocol.io (spec)
- github.com/modelcontextprotocol/servers (catalog of official servers)
- Anthropic Claude Code docs on MCP setup
