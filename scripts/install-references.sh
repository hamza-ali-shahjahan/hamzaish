#!/usr/bin/env bash
# scripts/install-references.sh
# Shallow-clone the three reference repos into references/.
# These are study material, not runtime dependencies. Re-clone as needed.

set -e

HAMZAISH_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REF_DIR="$HAMZAISH_ROOT/references"

mkdir -p "$REF_DIR"
cd "$REF_DIR"

clone_if_missing() {
  local name=$1
  local url=$2
  if [ -d "$name/.git" ]; then
    echo "✓ $name already cloned (skip — fetch latest with: cd $name && git fetch --depth=1 && git reset --hard origin/HEAD)"
  else
    rm -rf "$name"
    echo "→ cloning $name from $url"
    git clone --depth=1 "$url" "$name"
  fi
}

clone_if_missing "gbrain"       "https://github.com/garrytan/gbrain.git"
clone_if_missing "hermes-agent" "https://github.com/nousresearch/hermes-agent.git"
clone_if_missing "openclaw"     "https://github.com/openclaw/openclaw.git"
clone_if_missing "bmad-method"  "https://github.com/bmad-code-org/bmad-method.git"
clone_if_missing "agent-os"     "https://github.com/buildermethods/agent-os.git"
# 2026-07-30 four-repo assessment (see references/README.md — study-only, never import)
clone_if_missing "graft"        "https://github.com/NanoNets/Graft.git"
clone_if_missing "adrian"       "https://github.com/secureagentics/Adrian.git"
clone_if_missing "agentenv"     "https://github.com/kvcache-ai/AgentENV.git"
clone_if_missing "openspace"    "https://github.com/HKUDS/OpenSpace.git"
clone_if_missing "metaharness"  "https://github.com/ruvnet/metaharness.git"
clone_if_missing "mattpocock-skills" "https://github.com/mattpocock/skills.git"
clone_if_missing "headroom"     "https://github.com/headroomlabs-ai/headroom.git"

echo ""
echo "Done. references/README.md explains what to mine from each."
