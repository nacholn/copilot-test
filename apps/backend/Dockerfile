# Backend Dockerfile - Multi-stage build for production
# This Dockerfile builds the backend service with Next.js API and custom Socket.IO server

# Base stage - Alpine Linux with Node.js
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage - Install production dependencies
FROM base AS deps
# Copy package files for backend and its dependencies
COPY apps/backend/package*.json ./apps/backend/
COPY packages/config/package*.json ./packages/config/
COPY package*.json ./

# Install production dependencies only
RUN npm ci --workspace=backend --workspace=@cyclists/config --omit=dev

# Builder stage - Build the application
FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy workspace package files
COPY apps/backend/package*.json ./apps/backend/
COPY packages/config/package*.json ./packages/config/

# Install all dependencies (including dev dependencies for build)
RUN npm ci --workspace=backend --workspace=@cyclists/config

# Copy source code
COPY apps/backend ./apps/backend
COPY packages/config ./packages/config

# Build the config package first (dependency)
WORKDIR /app/packages/config
RUN npm run build

# Build the backend
WORKDIR /app/apps/backend
RUN npm run build

# Runner stage - Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/.next ./apps/backend/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/public ./apps/backend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/package*.json ./apps/backend/
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/server.ts ./apps/backend/
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/next.config.js ./apps/backend/

# Copy migrations directory
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/migrations ./apps/backend/migrations

# Copy config package built output and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/packages/config/dist ./packages/config/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/config/package*.json ./packages/config/

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/packages/config/node_modules ./packages/config/node_modules

# Copy root package.json for workspace resolution
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

USER nextjs

EXPOSE 3001

WORKDIR /app/apps/backend

CMD ["npm", "start"]
