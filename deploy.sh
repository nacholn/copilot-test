#!/bin/bash

# Production Deployment Script for Cyclists Social Network
# This script automates the deployment process with Docker Compose

set -e  # Exit on error

echo "=========================================="
echo "Cyclists Social Network - Production Deployment"
echo "=========================================="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your configuration."
    echo "You can use .env.production as a template."
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
export $(grep -v '^#' .env.production | xargs)

# Create traefik-certificates directory and acme.json if they don't exist
echo "🔐 Setting up SSL certificate storage..."
mkdir -p traefik-certificates
if [ ! -f traefik-certificates/acme.json ]; then
    touch traefik-certificates/acme.json
    chmod 600 traefik-certificates/acme.json
    echo "✅ Created acme.json with proper permissions"
else
    echo "✅ acme.json already exists"
fi

# Build Docker images
echo ""
echo "🏗️  Building Docker images (this may take several minutes)..."
docker compose -f docker-compose.prod.yml build --no-cache

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker images built successfully"
else
    echo "❌ Error: Docker build failed"
    exit 1
fi

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Start services
echo ""
echo "🚀 Starting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run database migrations
echo ""
echo "📊 Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T backend npm run migrate:up

# Check migration status
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "⚠️  Warning: Database migrations may have failed. Check logs."
fi

# Clean up Docker resources
echo ""
echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f

# Show deployment status
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Service URLs:"
echo "  🌐 Web App:        https://${DOMAIN}"
echo "  🔧 Admin Panel:    https://admin.${DOMAIN}"
echo "  🚀 API:            https://api.${DOMAIN}"
echo "  📊 Traefik:        https://traefik.${DOMAIN}"
echo ""
echo "Useful commands:"
echo "  View logs:         docker compose -f docker-compose.prod.yml logs -f"
echo "  Check status:      docker compose -f docker-compose.prod.yml ps"
echo "  Stop services:     docker compose -f docker-compose.prod.yml down"
echo "  Restart services:  docker compose -f docker-compose.prod.yml restart"
echo ""
echo "Note: SSL certificates may take a few minutes to generate."
echo "      If you see certificate errors, wait a moment and refresh."
echo ""
