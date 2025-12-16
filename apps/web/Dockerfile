# Web PWA Dockerfile - Multi-stage build for production
# This Dockerfile builds the web Progressive Web App with Next.js

# Base stage - Alpine Linux with Node.js
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage - Install production dependencies
FROM base AS deps
# Copy package files for web and its dependencies
COPY apps/web/package*.json ./apps/web/
COPY packages/config/package*.json ./packages/config/
COPY packages/ui/package*.json ./packages/ui/
COPY package*.json ./

# Install production dependencies only
RUN npm ci --workspace=web --workspace=@cyclists/config --workspace=@cyclists/ui --omit=dev

# Builder stage - Build the application
FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy workspace package files
COPY apps/web/package*.json ./apps/web/
COPY packages/config/package*.json ./packages/config/
COPY packages/ui/package*.json ./packages/ui/

# Install all dependencies (including dev dependencies for build)
RUN npm ci --workspace=web --workspace=@cyclists/config --workspace=@cyclists/ui

# Copy source code
COPY apps/web ./apps/web
COPY packages/config ./packages/config
COPY packages/ui ./packages/ui

# Build the config package first (dependency)
WORKDIR /app/packages/config
RUN npm run build

# Build the ui package (dependency)
WORKDIR /app/packages/ui
RUN npm run build

# Build the web app
WORKDIR /app/apps/web
RUN npm run build

# Runner stage - Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package*.json ./apps/web/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.js ./apps/web/

# Copy config package built output and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/packages/config/dist ./packages/config/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/config/package*.json ./packages/config/

# Copy ui package built output and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/packages/ui/dist ./packages/ui/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/ui/package*.json ./packages/ui/

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/packages/ui/node_modules ./packages/ui/node_modules

# Copy root package.json for workspace resolution
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

USER nextjs

EXPOSE 3000

WORKDIR /app/apps/web

CMD ["npm", "start"]
