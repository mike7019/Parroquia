import sequelize from './config/sequelize.js';

async function verificarTablaSectores() {
  try {
    // Verificar estructura de la tabla sectores
    console.log('🔍 Verificando estructura de tabla sectores...');
    
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'sectores' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estructura de tabla sectores:');
    results.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar cantidad de registros
    const [countResult] = await sequelize.query('SELECT COUNT(*) as total FROM sectores');
    console.log(`\n📊 Total registros en sectores: ${countResult[0].total}`);
    
    // Mostrar algunos registros de ejemplo
    if (countResult[0].total > 0) {
      const [sampleResults] = await sequelize.query(`
        SELECT s.*, m.nombre_municipio 
        FROM sectores s 
        LEFT JOIN municipios m ON s.id_municipio = m.id_municipio 
        LIMIT 3
      `);
      
      console.log('\n🔬 Muestra de registros:');
      sampleResults.forEach((sector, index) => {
        console.log(`  ${index + 1}. ${sector.nombre} (ID: ${sector.id_sector}) - Municipio: ${sector.nombre_municipio || 'Sin municipio'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarTablaSectores();
