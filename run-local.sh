#!/bin/bash

# Script to run n8n locally with the custom AiSensy node

# Get the absolute path of the current directory
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create n8n custom nodes directory if it doesn't exist
N8N_CUSTOM_DIR="$HOME/.n8n/custom"
mkdir -p "$N8N_CUSTOM_DIR"

# Build the node first
echo "Building the node..."
npm run build

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

# Run n8n using npx (no need to install globally)
echo ""
echo "Starting n8n with custom node..."
echo "Access n8n at: http://localhost:5678"
echo ""
npx n8n

