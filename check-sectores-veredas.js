import sequelize from './config/sequelize.js';

(async () => {
  try {
    console.log('🔍 Checking sectores and veredas table structures...');
    
    const [results] = await sequelize.query(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name IN ('sectores', 'veredas')
      ORDER BY table_name, ordinal_position
    `);
    
    console.log('📊 Table structures:');
    console.table(results);
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
