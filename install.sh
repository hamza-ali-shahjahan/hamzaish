#!/bin/sh
# Hamzaish — one-command bootstrap.
#
#   curl -fsSL https://raw.githubusercontent.com/hamza-ali-shahjahan/hamzaish/main/install.sh | sh
#
# Installs Bun (if missing), clones Hamzaish, runs setup. Idempotent + safe to
# re-run: present Bun is reused, an existing clone is fast-forwarded, setup never
# overwrites your .local files. Read before you run — that's the whole point of
# open source. Set HAMZAISH_DIR to clone somewhere other than ./hamzaish.
set -eu

REPO="https://github.com/hamza-ali-shahjahan/hamzaish.git"
DIR="${HAMZAISH_DIR:-hamzaish}"

say() { printf '\033[33m▸\033[0m %s\n' "$1"; }
ok()  { printf '\033[32m✓\033[0m %s\n' "$1"; }
die() { printf '\033[31m✗\033[0m %s\n' "$1" >&2; exit 1; }

printf '\n  🏭 Hamzaish — Builder Mode bootstrap\n\n'

# 1. git (required)
command -v git >/dev/null 2>&1 || die "git is required — install it, then re-run."

# 2. Bun (install if missing)
if command -v bun >/dev/null 2>&1; then
  ok "Bun present ($(bun --version))"
else
  say "Installing Bun…"
  curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1 || die "Bun install failed — see https://bun.sh"
  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  PATH="$BUN_INSTALL/bin:$PATH"
  command -v bun >/dev/null 2>&1 || die "Bun installed but not on PATH — open a new shell and re-run."
  ok "Bun installed ($(bun --version))"
fi

# 3. Clone (or fast-forward an existing clone)
if [ -d "$DIR/.git" ]; then
  ok "$DIR already cloned — pulling latest"
  git -C "$DIR" pull --ff-only >/dev/null 2>&1 || say "couldn't fast-forward (local changes?) — leaving as-is"
else
  [ -e "$DIR" ] && die "$DIR exists and isn't a git repo — move it or set HAMZAISH_DIR."
  say "Cloning Hamzaish into ./$DIR …"
  git clone --depth 1 "$REPO" "$DIR" >/dev/null 2>&1 || die "clone failed — check your connection."
  ok "cloned"
fi

# 4. Setup (idempotent; never clobbers existing .local files)
say "Running setup…"
( cd "$DIR" && bun run setup )

# 5. Claude Code (the agent that drives the factory — check, don't assume)
printf '\n'
if command -v claude >/dev/null 2>&1; then
  ok "Claude Code present"
else
  say "Claude Code not found — install it to drive the factory: https://claude.ai/code"
fi

# 6. The first command
cat <<EOF

  ✅ Ready. Your factory is at ./$DIR

  Next:
    cd $DIR
    claude                                         # open Claude Code here
    /builder-mode a tip calculator for freelancers

  Builder Mode: build first, wire your stack when you want it, ship when ready.
EOF
