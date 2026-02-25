#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# 1. Install Dependencies
echo "📦 Installing dependencies..."
echo "  - Frontend..."
pnpm install
echo "  - Backend..."
cd api && npm install && cd ..

# 2. Build Frontend
echo "🏗️  Building Frontend..."
pnpm run build

# 3. Setup Backend Static Files
echo "📂 Setting up backend static files..."
rm -rf api/public
mkdir -p api/public
cp -r dist/* api/public/

# 4. Build Backend
echo "🔨 Building Backend..."
cd api
npm run build

echo "✅ Deployment preparation complete!"
echo "To start the server, run:"
echo "  cd api && npm start"
