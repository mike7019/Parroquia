import { sequelize } from './src/models/index.js';

(async () => {
  try {
    console.log('\n🔍 Verificando estructura de tabla habilidades...\n');
    
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'habilidades'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Columnas de tabla habilidades:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    await sequelize.close();
  }
})();
