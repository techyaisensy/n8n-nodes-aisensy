#!/bin/bash

# Development mode script - watches for changes and auto-rebuilds
# Run this in one terminal, and n8n will automatically pick up changes

# Get the absolute path of the current directory
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create n8n custom nodes directory if it doesn't exist
N8N_CUSTOM_DIR="$HOME/.n8n/custom"
mkdir -p "$N8N_CUSTOM_DIR"

# Copy dist folder to n8n custom directory (instead of linking to avoid node_modules conflicts)
echo "Installing node to n8n custom directory..."
mkdir -p "$N8N_CUSTOM_DIR/node_modules"
NODE_DIR="$N8N_CUSTOM_DIR/node_modules/n8n-nodes-aisensy"
rm -rf "$NODE_DIR"
mkdir -p "$NODE_DIR"
cp -r "$CURRENT_DIR/dist" "$NODE_DIR/"
# Create a minimal package.json for n8n to recognize it
node -e "const pkg = require('$CURRENT_DIR/package.json'); require('fs').writeFileSync('$NODE_DIR/package.json', JSON.stringify({name: pkg.name, version: pkg.version, n8n: pkg.n8n}, null, 2))"

# Go back to project directory
cd "$CURRENT_DIR"

# Initial build
echo "Building node initially..."
npm run build

echo ""
echo "=========================================="
echo "  Development Mode - Auto Rebuild Active"
echo "=========================================="
echo ""
echo "Watching for changes in:"
echo "  - TypeScript files (nodes/**/*.ts, credentials/**/*.ts)"
echo "  - Icon files (nodes/**/*.{png,svg})"
echo ""
echo "Changes will be automatically rebuilt to dist/"
echo "You may need to refresh n8n to see changes"
echo ""
echo "Press Ctrl+C to stop"
echo "=========================================="
echo ""

# Run watch mode (TypeScript + Icons)
npm run dev:watch

