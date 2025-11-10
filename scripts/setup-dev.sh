#!/bin/bash

# Development Environment Setup Script
# This script helps set up the development environment quickly

set -e

echo "🚴 Cyclists Social Network - Development Setup"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Setup environment files
echo "🔧 Setting up environment files..."

if [ ! -f "apps/backend/.env" ]; then
    cp apps/backend/.env.example apps/backend/.env
    echo "✅ Created apps/backend/.env"
else
    echo "ℹ️  apps/backend/.env already exists"
fi

if [ ! -f "apps/web/.env" ]; then
    cp apps/web/.env.example apps/web/.env
    echo "✅ Created apps/web/.env"
else
    echo "ℹ️  apps/web/.env already exists"
fi

if [ ! -f "apps/mobile/.env" ]; then
    cp apps/mobile/.env.example apps/mobile/.env
    echo "✅ Created apps/mobile/.env"
else
    echo "ℹ️  apps/mobile/.env already exists"
fi

echo ""
echo "⚙️  Building packages..."
npm run build --workspace=packages/config --workspace=packages/ui

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update environment variables in:"
echo "   - apps/backend/.env"
echo "   - apps/web/.env"
echo "   - apps/mobile/.env"
echo ""
echo "2. Setup Supabase:"
echo "   - Create a project at https://supabase.com"
echo "   - Enable Email authentication"
echo "   - Copy your project URL and anon key to .env files"
echo ""
echo "3. Setup PostgreSQL:"
echo "   - Run the database initialization script:"
echo "     psql -U your_user -d your_database -f scripts/init-db.sql"
echo ""
echo "4. Start development servers:"
echo "   - Backend:  cd apps/backend && npm run dev"
echo "   - Web:      cd apps/web && npm run dev"
echo "   - Mobile:   cd apps/mobile && npm start"
echo ""
echo "📚 For more information, see SETUP.md"
echo ""
