#!/usr/bin/env node

/**
 * Database Health Check Script
 * 
 * Verifies that the database is properly configured and all key tables exist
 * with the expected structure after deployment synchronization.
 * 
 * Usage:
 *   node checkDatabase.js
 */

import sequelize from './config/sequelize.js';

// List of critical tables that should exist after deployment
const CRITICAL_TABLES = [
  'departamentos',
  'municipios', 
  'parroquias',
  'sectores',
  'veredas',
  'familias',
  'personas',
  'usuarios',
  'enfermedades'
];

async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkTableExists(tableName) {
  try {
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '${tableName}'
    `);
    
    return results.length > 0;
  } catch (error) {
    console.error(`❌ Error checking table ${tableName}:`, error.message);
    return false;
  }
}

async function getTableRowCount(tableName) {
  try {
    const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    return parseInt(results[0].count);
  } catch (error) {
    console.error(`❌ Error counting rows in ${tableName}:`, error.message);
    return -1;
  }
}

async function checkCatalogData() {
  console.log('\n📋 Checking catalog data...');
  
  const catalogChecks = [
    { table: 'departamentos', expectedMin: 30 },
    { table: 'municipios', expectedMin: 1000 },
    { table: 'enfermedades', expectedMin: 20 }
  ];
  
  let allGood = true;
  
  for (const check of catalogChecks) {
    const count = await getTableRowCount(check.table);
    if (count >= check.expectedMin) {
      console.log(`  ✅ ${check.table}: ${count} records (expected: ${check.expectedMin}+)`);
    } else if (count === 0) {
      console.log(`  ⚠️  ${check.table}: ${count} records (may need seeding)`);
    } else {
      console.log(`  ❌ ${check.table}: ${count} records (expected: ${check.expectedMin}+)`);
      allGood = false;
    }
  }
  
  return allGood;
}

async function checkDatabaseHealth() {
  console.log('🔍 DATABASE HEALTH CHECK');
  console.log('=' * 50);
  
  // Check connection
  const connectionOk = await checkDatabaseConnection();
  if (!connectionOk) {
    return false;
  }
  
  // Check critical tables
  console.log('\n📊 Checking critical tables...');
  let tablesOk = true;
  
  for (const tableName of CRITICAL_TABLES) {
    const exists = await checkTableExists(tableName);
    if (exists) {
      const count = await getTableRowCount(tableName);
      console.log(`  ✅ ${tableName}: exists (${count} records)`);
    } else {
      console.log(`  ❌ ${tableName}: missing`);
      tablesOk = false;
    }
  }
  
  // Check catalog data
  const catalogOk = await checkCatalogData();
  
  // Final assessment
  console.log('\n' + '=' * 50);
  
  if (connectionOk && tablesOk && catalogOk) {
    console.log('🎉 DATABASE HEALTH CHECK PASSED!');
    console.log('💚 All critical components are working correctly');
    return true;
  } else {
    console.log('⚠️  DATABASE HEALTH CHECK ISSUES DETECTED');
    if (!connectionOk) console.log('❌ Connection problems detected');
    if (!tablesOk) console.log('❌ Missing critical tables');
    if (!catalogOk) console.log('❌ Insufficient catalog data');
    console.log('\n💡 Consider running: npm run db:sync:deploy');
    return false;
  }
}

async function main() {
  try {
    const isHealthy = await checkDatabaseHealth();
    
    // Close database connection
    await sequelize.close();
    
    // Exit with appropriate code
    process.exit(isHealthy ? 0 : 1);
    
  } catch (error) {
    console.error('\n💥 Health check failed with error:');
    console.error(error.message);
    
    try {
      await sequelize.close();
    } catch (closeError) {
      // Ignore close errors
    }
    
    process.exit(1);
  }
}

// Auto-execute if this file is run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('checkDatabase.js')) {
  main();
}

export default checkDatabaseHealth;
