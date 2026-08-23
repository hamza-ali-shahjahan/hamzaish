#!/usr/bin/env bash
#
# supabase-bootstrap.sh — stand up a Supabase project for a repo in one command.
#
#   ./scripts/supabase-bootstrap.sh <project-name> [--region <r>] [--org <id>]
#
# Creates the project, waits for it to finish provisioning, links this repo to
# it, and applies every migration in ./supabase/migrations. Replaces the
# ~6-step dashboard dance with one command plus one password prompt.
#
# WHAT THIS DELIBERATELY DOES NOT DO
#   - It never writes a secrets file. After it finishes it tells you which
#     env vars to fill; you paste the values yourself.
#   - It never prints or logs the database password.
#
# PREREQUISITES
#   npx        (bundled with Node — the Supabase CLI runs via npx, no install)
#   A one-time `npx supabase login`. The token lands in the macOS Keychain and
#   is machine-wide: you do this ONCE, ever, not once per project.
#
set -euo pipefail

SUPA="npx --yes supabase@latest"
REGION="us-east-1"
ORG=""
NAME=""

die()  { printf '\n\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }
info() { printf '\033[36m→\033[0m %s\n' "$*"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --region) REGION="${2:-}"; shift 2 ;;
    --org)    ORG="${2:-}";    shift 2 ;;
    -h|--help)
      sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *)        NAME="$1";       shift ;;
  esac
done

[[ -n "$NAME" ]] || die "Usage: $(basename "$0") <project-name> [--region us-east-1] [--org <id>]"

# ---------------------------------------------------------------- preflight
command -v npx >/dev/null 2>&1 || die "npx not found. Install Node first."

info "Checking Supabase login…"
if ! $SUPA projects list --output json >/tmp/.supa-projects.json 2>/dev/null; then
  die "Not logged in. Run:  npx supabase login   (one time, ever — token goes to the Keychain)"
fi
ok "Logged in."

# Reuse an existing project with this name rather than creating a duplicate.
EXISTING_REF=$(python3 -c "
import json,sys
try: rows=json.load(open('/tmp/.supa-projects.json'))
except Exception: sys.exit()
print(next((p['ref'] for p in rows if p.get('name')=='$NAME'), ''))
" 2>/dev/null || true)

# ------------------------------------------------------------------ org id
if [[ -z "$ORG" && -z "$EXISTING_REF" ]]; then
  ORG=$(python3 -c "
import json
rows=json.load(open('/tmp/.supa-projects.json'))
orgs={p['organization_id'] for p in rows}
print(orgs.pop() if len(orgs)==1 else '')
" 2>/dev/null || true)
  [[ -n "$ORG" ]] || die "Several organizations found — pass --org <id>. List them with: npx supabase orgs list"
  info "Using organization $ORG"
fi

# ------------------------------------------------------------------- create
if [[ -n "$EXISTING_REF" ]]; then
  REF="$EXISTING_REF"
  ok "Project '$NAME' already exists ($REF) — reusing it."
else
  echo
  echo "Choose a database password. It is NOT echoed, NOT stored by this script,"
  echo "and NOT written to shell history. Save it to your password manager now —"
  echo "Supabase will not show it to you again."
  echo
  read -r -s -p "  Database password: " DB_PASSWORD; echo
  read -r -s -p "  Confirm:           " DB_CONFIRM;  echo
  [[ "$DB_PASSWORD" == "$DB_CONFIRM" ]] || die "Passwords did not match."
  [[ ${#DB_PASSWORD} -ge 12 ]] || die "Use at least 12 characters."

  info "Creating project '$NAME' in $REGION…"
  CREATE_OUT=$($SUPA projects create "$NAME" \
                 --org-id "$ORG" \
                 --region "$REGION" \
                 --db-password "$DB_PASSWORD" \
                 --output json 2>&1) || die "Create failed: $CREATE_OUT"

  REF=$(python3 -c "
import json,sys,re
raw='''$CREATE_OUT'''
m=re.search(r'\{.*\}', raw, re.S)
print(json.loads(m.group(0)).get('ref','') if m else '')
" 2>/dev/null || true)
  unset DB_PASSWORD DB_CONFIRM

  [[ -n "$REF" ]] || die "Could not read the project ref from the create response."
  ok "Created $REF"
fi

# ------------------------------------------------------- wait for provisioning
info "Waiting for the database to finish provisioning (can take a few minutes)…"
for i in $(seq 1 60); do
  STATUS=$($SUPA projects list --output json 2>/dev/null | python3 -c "
import json,sys
print(next((p['status'] for p in json.load(sys.stdin) if p['ref']=='$REF'), '?'))
" 2>/dev/null || echo "?")
  [[ "$STATUS" == "ACTIVE_HEALTHY" ]] && { ok "Database is healthy."; break; }
  printf '\r  [%02d] %s        ' "$i" "$STATUS"
  sleep 10
done
[[ "${STATUS:-}" == "ACTIVE_HEALTHY" ]] || die "Still '$STATUS' after 10 minutes. Check the dashboard."

# --------------------------------------------------------------------- link
info "Linking this repo…"
$SUPA link --project-ref "$REF" </dev/null >/dev/null 2>&1 || die "Link failed."
ok "Linked to $REF"

# ------------------------------------------------------------------- migrate
if compgen -G "supabase/migrations/*.sql" >/dev/null; then
  info "Applying migrations…"
  $SUPA db push </dev/null || die "Migration failed. See the error above — if it mentions a
missing function, check the pgcrypto note in /deployment-learnings."
  ok "Migrations applied."
else
  info "No migrations found in supabase/migrations — skipping."
fi

# ---------------------------------------------------------------- next steps
cat <<EOF

────────────────────────────────────────────────────────────
✓ Supabase is ready.

  Project   $NAME
  Ref       $REF
  Region    $REGION
  API URL   https://$REF.supabase.co

Now fill these in your local env file yourself (never let an agent
write them, and never paste them into a chat):

  NEXT_PUBLIC_SUPABASE_URL=https://$REF.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=<Project Settings → API → service_role>

  Keys:  https://supabase.com/dashboard/project/$REF/settings/api

Verify without printing anything:
  grep -c '^SUPABASE_SERVICE_ROLE_KEY=.' .env.local
────────────────────────────────────────────────────────────
EOF
