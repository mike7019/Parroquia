import sequelize from './config/sequelize.js';

async function verificarTablaProfesiones() {
  try {
    console.log('🔍 Verificando tabla profesiones...');
    
    // Verificar si la tabla existe
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'profesiones' 
      ORDER BY ordinal_position;
    `);
    
    if (results.length === 0) {
      console.log('❌ La tabla profesiones no existe');
      return;
    }
    
    console.log('✅ Estructura de la tabla profesiones:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Contar registros
    const [countResult] = await sequelize.query('SELECT COUNT(*) as count FROM profesiones');
    console.log(`📊 Total de registros: ${countResult[0].count}`);
    
    // Mostrar algunos registros
    if (countResult[0].count > 0) {
      const [sampleData] = await sequelize.query('SELECT * FROM profesiones LIMIT 5');
      console.log('📋 Primeros 5 registros:');
      sampleData.forEach((prof, index) => {
        console.log(`  ${index + 1}. ${prof.nombre}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error al verificar tabla profesiones:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarTablaProfesiones();
