# WebAdmin Dockerfile - Multi-stage build for production
# This Dockerfile builds the web admin panel with Next.js

# Base stage - Alpine Linux with Node.js
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage - Install production dependencies
FROM base AS deps
# Copy package files for webadmin and its dependencies
COPY apps/webadmin/package*.json ./apps/webadmin/
COPY packages/config/package*.json ./packages/config/
COPY package*.json ./

# Install production dependencies only
RUN npm ci --workspace=webadmin --workspace=@cyclists/config --omit=dev

# Builder stage - Build the application
FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy workspace package files
COPY apps/webadmin/package*.json ./apps/webadmin/
COPY packages/config/package*.json ./packages/config/

# Install all dependencies (including dev dependencies for build)
RUN npm ci --workspace=webadmin --workspace=@cyclists/config

# Copy source code
COPY apps/webadmin ./apps/webadmin
COPY packages/config ./packages/config

# Build the config package first (dependency)
WORKDIR /app/packages/config
RUN npm run build

# Build the webadmin
WORKDIR /app/apps/webadmin
RUN npm run build

# Runner stage - Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/apps/webadmin/.next ./apps/webadmin/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/webadmin/public ./apps/webadmin/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/webadmin/package*.json ./apps/webadmin/
COPY --from=builder --chown=nextjs:nodejs /app/apps/webadmin/next.config.js ./apps/webadmin/

# Copy config package built output and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/packages/config/dist ./packages/config/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/config/package*.json ./packages/config/

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/apps/webadmin/node_modules ./apps/webadmin/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/packages/config/node_modules ./packages/config/node_modules

# Copy root package.json for workspace resolution
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

USER nextjs

EXPOSE 3002

WORKDIR /app/apps/webadmin

CMD ["npm", "start"]
