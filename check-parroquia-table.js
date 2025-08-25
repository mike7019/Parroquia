import 'dotenv/config';
import sequelize from './config/sequelize.js';

console.log('🔍 Checking parroquia table structure...');

try {
  // Query the table structure
  const [results] = await sequelize.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'parroquia'
    ORDER BY ordinal_position;
  `);
  
  console.log('📋 Parroquia table columns:');
  results.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
  });
  
  // Check if activo column exists
  const activoExists = results.some(col => col.column_name === 'activo');
  console.log(`\n❓ Activo column exists: ${activoExists}`);
  
  if (!activoExists) {
    console.log('🔧 Adding activo column...');
    await sequelize.query(`
      ALTER TABLE parroquia 
      ADD COLUMN activo BOOLEAN DEFAULT true;
    `);
    console.log('✅ Activo column added successfully');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await sequelize.close();
}
