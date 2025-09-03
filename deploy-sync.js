#!/usr/bin/env node

/**
 * Complete Deployment Synchronization Script
 * 
 * This script runs the complete sequence needed to update a remote server:
 * 1. Database schema sync (force)
 * 2. Seed catalog data
 * 3. Verify system health
 * 
 * Usage:
 *   node deploy-sync.js
 *   npm run deploy:sync
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Command completed successfully: ${command}`);
        resolve(code);
      } else {
        console.error(`❌ Command failed with code ${code}: ${command}`);
        reject(new Error(`Command failed: ${command}`));
      }
    });

    process.on('error', (error) => {
      console.error(`❌ Error running ${command}:`, error.message);
      reject(error);
    });
  });
}

async function deploySync() {
  console.log('🚀 Starting Complete Deployment Synchronization...');
  console.log('=' * 60);
  
  try {
    // Step 1: Sync database schema
    console.log('\n📊 Step 1: Synchronizing database schema...');
    await runCommand('node', ['sync-database.js']);
    
    // Step 2: Run seeders
    console.log('\n🌱 Step 2: Loading catalog data...');
    await runCommand('node', ['runSeeders.js']);
    
    // Step 3: Verify database
    console.log('\n🔍 Step 3: Verifying database health...');
    await runCommand('node', ['checkDatabase.js']);
    
    console.log('\n' + '=' * 60);
    console.log('🎉 DEPLOYMENT SYNC COMPLETED SUCCESSFULLY!');
    console.log('🚀 Remote server is now fully updated and ready');
    console.log('💡 You can now start your application with npm start');
    
  } catch (error) {
    console.error('\n' + '=' * 60);
    console.error('💥 DEPLOYMENT SYNC FAILED!');
    console.error('Error:', error.message);
    console.error('\n🔧 Manual intervention may be required');
    process.exit(1);
  }
}

// Auto-execute if this file is run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('deploy-sync.js')) {
  deploySync();
}

export default deploySync;
