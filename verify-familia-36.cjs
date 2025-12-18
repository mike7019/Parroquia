const { Sequelize, QueryTypes } = require('sequelize');

const sequelize = new Sequelize(
  'parroquia_db',
  'parroquia_user',
  'ParroquiaSecure2025',
  {
    host: '206.62.139.100',
    port: 5433,
    dialect: 'postgres',
    logging: false
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    
    const familiaId = 36;
    
    const [familia] = await sequelize.query(
      `SELECT 
        id_familia,
        apellido_familiar,
        sustento_familia,
        observaciones_encuestador,
        autorizacion_datos
       FROM familias 
       WHERE id_familia = :familiaId`,
      {
        replacements: { familiaId },
        type: QueryTypes.SELECT
      }
    );
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 VERIFICACIÓN FAMILIA ID 36 (DESPUÉS DE DEBUG)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Apellido: ${familia.apellido_familiar}\n`);
    console.log('📊 VALORES EN BASE DE DATOS:\n');
    console.log(`   sustento_familia: "${familia.sustento_familia}"`);
    console.log(`   observaciones_encuestador: "${familia.observaciones_encuestador}"`);
    console.log(`   autorizacion_datos: ${familia.autorizacion_datos}\n`);
    
    console.log('📝 VALORES QUE DEBERÍAN ESTAR:\n');
    console.log('   sustento_familia: "tma nuevo pruiebs"');
    console.log('   observaciones_encuestador: "completedooo"');
    console.log('   autorizacion_datos: true\n');
    
    if (familia.sustento_familia === 'tma nuevo pruiebs' && 
        familia.observaciones_encuestador === 'completedooo' &&
        familia.autorizacion_datos === true) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅✅✅ ¡¡¡ÉXITO!!! ✅✅✅');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Los datos se guardaron CORRECTAMENTE en la BD');
      console.log('✅ El fix funciona perfectamente');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ PROBLEMA: Sequelize NO está guardando los campos');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Los datos llegan al código pero no se insertan en la BD');
      console.log('Posible causa: Columnas no definidas en el modelo Familia.cjs');
    }
    
    await sequelize.close();
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
})();
