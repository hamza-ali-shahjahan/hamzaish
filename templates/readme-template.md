# {{PRODUCT_NAME}}

{{ONE_LINER}}

## Status
Stage: {{idea | mvp | launch | scale}}
Created: {{DATE}}
Production URL: {{URL_OR_PENDING}}

## Quick start

```bash
cd code
cp .env.example .env.local
# fill in env vars (see SETUP.md for the 11-step checklist)
pnpm install
pnpm dev
```

Visit http://localhost:3000.

## Folder layout

```
products/{{slug}}/
├── product.config.json    # Dashboard manifest
├── CLAUDE.md              # Claude Code instructions for this product
├── scope.md               # What it does / deliberately doesn't
├── prd.md                 # 1-page PRD
├── metrics.md             # NSM, activation, retention targets
├── SETUP.md               # 11-step onboarding checklist
├── decisions/             # ADRs + session logs
├── interviews/            # Customer discovery raw + synthesis
├── launch/                # Brand, copy, pricing, launch assets
├── analytics/             # Connector configs (no secrets)
└── code/                  # The actual Next.js app
```

## Onboarding
See `SETUP.md`. If you haven't done the 11-step onboarding, the app won't fully work — it boots, but auth/payments/analytics need real credentials.

## Working on this product
Start sessions inside this folder. Read `CLAUDE.md` first.

For factory-level work (cross-product, orchestration), `cd ../..` to the factory root.
