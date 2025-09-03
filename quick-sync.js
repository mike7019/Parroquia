#!/usr/bin/env node

/**
 * Quick Database Force Sync - One-liner Script
 * 
 * This is the equivalent of your requested one-liner command:
 * node -e "import('./src/models/index.js').then(() => { import('sequelize').then(({default: Sequelize}) => { import('./config/sequelize.js').then(({default: sequelize}) => { sequelize.sync({force: true}).then(() => console.log('✅ Sync complete')).catch(console.error); }); }); })"
 * 
 * Usage:
 *   node quick-sync.js
 *   npm run db:quick:sync
 */

import './src/models/index.js';
import Sequelize from 'sequelize';
import sequelize from './config/sequelize.js';

try {
  await sequelize.sync({ force: true });
  console.log('✅ Sync complete');
  await sequelize.close();
  process.exit(0);
} catch (error) {
  console.error('❌ Sync failed:', error);
  process.exit(1);
}
