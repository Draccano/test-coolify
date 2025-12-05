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
RUN pnpm turbo prune admin --docker

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
RUN pnpm turbo run build --filter=admin

# ============================================
# Runner stage - serve static files with nginx
# ============================================
FROM nginx:alpine AS runner

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom nginx config
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# Create nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
