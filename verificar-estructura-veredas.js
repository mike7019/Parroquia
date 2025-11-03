import sequelize from './config/sequelize.js';

async function verificarEstructura() {
  try {
    console.log('🔍 Verificando estructura de tabla veredas...\n');
    
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'veredas' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas de la tabla veredas:');
    console.table(columns);
    
    const [count] = await sequelize.query(`SELECT COUNT(*) as total FROM veredas`);
    console.log(`\n📊 Total de veredas en la base de datos: ${count[0].total}`);
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

verificarEstructura();
