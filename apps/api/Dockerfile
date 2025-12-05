# syntax=docker/dockerfile:1

# ============================================
# Base stage - shared across all stages
# ============================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# ============================================
# Pruned stage - extract only what's needed
# ============================================
FROM base AS pruner
RUN pnpm add -g turbo
COPY . .
RUN pnpm turbo prune api --docker

# ============================================
# Builder stage - install deps and build
# ============================================
FROM base AS builder

# Install dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

# Build the app
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=api

# ============================================
# Runner stage - production image
# ============================================
FROM base AS runner

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 api
RUN adduser --system --uid 1001 api

WORKDIR /app

# Copy the entire pruned workspace with built packages
COPY --from=builder /app .

USER api

EXPOSE 3000
ENV PORT=3000

# Run from the apps/api directory
CMD ["node", "apps/api/dist/index.cjs"]
