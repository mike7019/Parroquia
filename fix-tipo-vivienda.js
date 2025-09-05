import sequelize from './config/sequelize.js';

async function fixTipoVivienda() {
  try {
    console.log('🔧 Corrigiendo tipo de vivienda para familia ID 15...');
    
    // Corregir familia 15: tipo_vivienda='1' debería ser id_tipo_vivienda=1
    await sequelize.query(`
      UPDATE familias 
      SET id_tipo_vivienda = 1, tipo_vivienda = null
      WHERE id_familia = 15 AND tipo_vivienda = '1'
    `);
    
    console.log('✅ Familia ID 15 corregida');
    
    // Verificar el cambio
    const [familia] = await sequelize.query(`
      SELECT f.id_familia, f.apellido_familiar, f.tipo_vivienda, f.id_tipo_vivienda,
             tv.nombre as tipo_nombre
      FROM familias f
      LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
      WHERE f.id_familia = 15
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('📋 Estado después de la corrección:');
    console.log(familia);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixTipoVivienda();
