import sequelize from './config/sequelize.js';

const fixParroquiaTimestamps = async () => {
  try {
    console.log('🔧 Fixing parroquia table timestamp defaults...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check current structure
    console.log('\n📋 Current column defaults:');
    const [columns] = await sequelize.query(`
      SELECT column_name, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'parroquia' 
      AND column_name IN ('created_at', 'updated_at')
      ORDER BY column_name
    `);
    
    columns.forEach(col => {
      console.log(`   ${col.column_name}: default=${col.column_default || 'NULL'}, nullable=${col.is_nullable}`);
    });
    
    // Fix created_at default
    console.log('\n🔧 Setting created_at default to CURRENT_TIMESTAMP...');
    await sequelize.query(`
      ALTER TABLE parroquia 
      ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP
    `);
    
    // Fix updated_at default
    console.log('🔧 Setting updated_at default to CURRENT_TIMESTAMP...');
    await sequelize.query(`
      ALTER TABLE parroquia 
      ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP
    `);
    
    // Verify the changes
    console.log('\n✅ Verifying changes:');
    const [newColumns] = await sequelize.query(`
      SELECT column_name, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'parroquia' 
      AND column_name IN ('created_at', 'updated_at')
      ORDER BY column_name
    `);
    
    newColumns.forEach(col => {
      console.log(`   ${col.column_name}: default=${col.column_default || 'NULL'}, nullable=${col.is_nullable}`);
    });
    
    console.log('\n🎉 Timestamp defaults fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
};

fixParroquiaTimestamps();
