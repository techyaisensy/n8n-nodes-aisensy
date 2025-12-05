#!/usr/bin/env node

const { watch } = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CURRENT_DIR = __dirname;
const N8N_CUSTOM_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.n8n/custom');
const NODE_DIR = path.join(N8N_CUSTOM_DIR, 'node_modules/n8n-nodes-aisensy');
const DIST_DIR = path.join(CURRENT_DIR, 'dist');

// Function to copy dist to n8n directory
function syncToN8n() {
  try {
    console.log('\n🔄 Syncing to n8n...');
    
    // Create directories if they don't exist
    if (!fs.existsSync(N8N_CUSTOM_DIR)) {
      fs.mkdirSync(N8N_CUSTOM_DIR, { recursive: true });
    }
    if (!fs.existsSync(path.join(N8N_CUSTOM_DIR, 'node_modules'))) {
      fs.mkdirSync(path.join(N8N_CUSTOM_DIR, 'node_modules'), { recursive: true });
    }
    if (!fs.existsSync(NODE_DIR)) {
      fs.mkdirSync(NODE_DIR, { recursive: true });
    }

    // Copy dist folder
    if (fs.existsSync(DIST_DIR)) {
      // Remove old files
      if (fs.existsSync(path.join(NODE_DIR, 'dist'))) {
        fs.rmSync(path.join(NODE_DIR, 'dist'), { recursive: true, force: true });
      }
      
      // Copy dist folder
      copyRecursiveSync(DIST_DIR, path.join(NODE_DIR, 'dist'));
      
      // Create package.json for n8n
      const pkg = require('./package.json');
      const n8nPkg = {
        name: pkg.name,
        version: pkg.version,
        n8n: pkg.n8n
      };
      fs.writeFileSync(
        path.join(NODE_DIR, 'package.json'),
        JSON.stringify(n8nPkg, null, 2)
      );
      
      console.log('✅ Synced to n8n successfully!');
      console.log('   Location:', NODE_DIR);
      console.log('   Refresh n8n browser to see changes\n');
    } else {
      console.log('⚠️  dist folder not found, skipping sync\n');
    }
  } catch (error) {
    console.error('❌ Error syncing to n8n:', error.message);
  }
}

// Recursive copy function
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Initial sync
console.log('🚀 Starting watch mode with auto-sync to n8n...\n');
syncToN8n();

// Watch for changes in dist folder
const watcher = watch(DIST_DIR, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: false
});

watcher
  .on('change', (filePath) => {
    console.log(`📝 File changed: ${path.relative(CURRENT_DIR, filePath)}`);
    syncToN8n();
  })
  .on('add', (filePath) => {
    console.log(`➕ File added: ${path.relative(CURRENT_DIR, filePath)}`);
    syncToN8n();
  })
  .on('unlink', (filePath) => {
    console.log(`🗑️  File removed: ${path.relative(CURRENT_DIR, filePath)}`);
    syncToN8n();
  })
  .on('error', error => {
    console.error('❌ Watcher error:', error);
  });

console.log('👀 Watching for changes in dist/ folder...');
console.log('   Press Ctrl+C to stop\n');

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping watcher...');
  watcher.close();
  process.exit(0);
});

