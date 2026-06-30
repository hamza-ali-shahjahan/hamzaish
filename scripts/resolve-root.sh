#!/usr/bin/env bash
# resolve-root.sh — print the Hamzaish factory root, deterministically, from anywhere.
#
# WHY: /hamzaish (and any factory-relative command) must never assume `cwd == factory
# root`. A new user invokes /hamzaish from their workspace and the factory lives a level
# down (~/Claude/Hamzaish). Without this resolver, `ls products` / `ls factory` come back
# empty and the front door stumbles on its first action. This is the single source of
# truth for "where is the factory" — reused by the slash commands and (optionally) hooks.
#
# Resolution order: $HAMZAISH_ROOT → walk up from cwd → ~/Claude/Hamzaish → common spots.
# Prints the absolute path and exits 0 on success; prints guidance to stderr and exits 1
# if the factory genuinely can't be found (a true first-timer who hasn't installed yet).
set -euo pipefail

is_factory_root() { [ -d "$1/factory" ] && [ -d "$1/products/_template" ]; }

# 1. Explicit override wins.
if [ -n "${HAMZAISH_ROOT:-}" ] && is_factory_root "$HAMZAISH_ROOT"; then
  echo "$HAMZAISH_ROOT"; exit 0
fi

# 2. Walk up from the current directory (handles being inside the factory or any subdir).
dir="$(pwd -P)"
while [ "$dir" != "/" ]; do
  if is_factory_root "$dir"; then echo "$dir"; exit 0; fi
  dir="$(dirname "$dir")"
done

# 3. The conventional default.
if is_factory_root "${HOME}/Claude/Hamzaish"; then echo "${HOME}/Claude/Hamzaish"; exit 0; fi

# 4. A couple of other common spots.
for cand in "${HOME}/Hamzaish" "${HOME}/code/Hamzaish" "${HOME}/src/Hamzaish"; do
  if is_factory_root "$cand"; then echo "$cand"; exit 0; fi
done

# Not found — guide, never crash silently.
{
  echo "✗ Could not locate the Hamzaish factory root."
  echo "  Fix: export HAMZAISH_ROOT=/path/to/Hamzaish — or clone it to the default:"
  echo "    git clone https://github.com/hamza-ali-shahjahan/hamzaish \"\$HOME/Claude/Hamzaish\""
} >&2
exit 1
