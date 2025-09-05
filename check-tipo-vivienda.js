import sequelize from './config/sequelize.js';

async function checkTipoVivienda() {
  try {
    console.log('🏠 Verificando tipos de vivienda...\n');
    
    const familias = await sequelize.query(`
      SELECT f.id_familia, f.apellido_familiar, f.tipo_vivienda, f.id_tipo_vivienda,
             tv.id_tipo_vivienda as tipo_id, tv.nombre as tipo_nombre
      FROM familias f
      LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
      ORDER BY f.id_familia
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('📋 Familias y sus tipos de vivienda:');
    familias.forEach(f => {
      console.log(`ID: ${f.id_familia} | Familia: ${f.apellido_familiar}`);
      console.log(`  tipo_vivienda (texto): '${f.tipo_vivienda}'`);
      console.log(`  id_tipo_vivienda (FK): ${f.id_tipo_vivienda}`);
      console.log(`  Relación encontrada: ${f.tipo_id ? f.tipo_nombre : 'NO ENCONTRADA'}`);
      console.log('---');
    });
    
    console.log('\n🏠 Catálogo de tipos de vivienda disponible:');
    const tipos = await sequelize.query('SELECT * FROM tipos_vivienda ORDER BY id_tipo_vivienda', { type: sequelize.QueryTypes.SELECT });
    console.log(tipos);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTipoVivienda();
