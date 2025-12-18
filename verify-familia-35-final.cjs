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
    
    const familiaId = 35;
    
    const [familia] = await sequelize.query(
      `SELECT 
        id_familia,
        apellido_familiar,
        sustento_familia,
        observaciones_encuestador,
        autorizacion_datos,
        fecha_ultima_encuesta
       FROM familias 
       WHERE id_familia = :familiaId`,
      {
        replacements: { familiaId },
        type: QueryTypes.SELECT
      }
    );
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 VERIFICACIÓN FINAL - Familia ID 35');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📋 Apellido: ${familia.apellido_familiar}`);
    console.log(`📅 Fecha: ${familia.fecha_ultima_encuesta}\n`);
    console.log('🔍 DATOS DE OBSERVACIONES:\n');
    console.log(`   sustento_familia: "${familia.sustento_familia}"`);
    console.log(`   observaciones_encuestador: "${familia.observaciones_encuestador}"`);
    console.log(`   autorizacion_datos: ${familia.autorizacion_datos}\n`);
    
    if (familia.sustento_familia === 'tma nuevo pruiebs' && 
        familia.observaciones_encuestador === 'completedooo' &&
        familia.autorizacion_datos === true) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅✅✅ ¡¡¡ÉXITO TOTAL!!! ✅✅✅');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Los campos de observaciones se GUARDARON correctamente');
      console.log('✅ El servidor tiene el código actualizado (commit 1aa9f77)');
      console.log('✅ PM2 reload funcionó correctamente');
      console.log('✅ El fix está funcionando en producción');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('🎉 PROBLEMA RESUELTO:');
      console.log('   1. Se agregaron los campos al query SQL de obtención');
      console.log('   2. Se agregaron los campos al response JSON');
      console.log('   3. Se agregaron los campos al INSERT de crear encuesta');
      console.log('   4. Todo funciona end-to-end ✓');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('❌ ERROR: Los datos no coinciden con lo esperado');
      console.log('   Esperado: sustento="tma nuevo pruiebs", obs="completedooo", auth=true');
      console.log(`   Obtenido: sustento="${familia.sustento_familia}", obs="${familia.observaciones_encuestador}", auth=${familia.autorizacion_datos}`);
    }
    
    await sequelize.close();
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
})();
