# Devcontainer base for Hamzaish-scaffolded products.
#
# Goal: an isolated, reproducible box that has both Node (the Next.js toolchain)
# and Bun (this repo's canonical runtime / package manager — see ../package.json
# `engines.bun` and the Bun-first CI). The agent works in here, NOT on your host.
#
# Pinned to a versioned base tag so the image is reproducible and can't be
# silently repointed upstream (same discipline as our pinned GitHub Actions).
FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm

# Install Bun via its official installer into a shared location on PATH.
# Leave the version unpinned here to track the latest stable Bun; pin it to the
# exact version in package.json `engines.bun` when you want full reproducibility:
#   RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.1.0"
ENV BUN_INSTALL=/usr/local/bun
ENV PATH=${BUN_INSTALL}/bin:${PATH}
RUN curl -fsSL https://bun.sh/install | bash \
    && chmod -R a+rx "${BUN_INSTALL}"

# Drop to the non-root user the base image already provides. The agent should
# never run as root inside the container.
USER node
