import sequelize from './config/sequelize.js';

async function checkSchema() {
  try {
    await sequelize.authenticate();
    
    console.log('🔍 Checking tipos_disposicion_basura schema:');
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'tipos_disposicion_basura' 
      ORDER BY ordinal_position;
    `);
    
    console.table(results);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkSchema();
