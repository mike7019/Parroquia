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
    
    const familiaId = 34;
    
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
    
    console.log('🔍 VERIFICACIÓN FINAL - Familia ID 34:\n');
    console.log(`Apellido: ${familia.apellido_familiar}`);
    console.log(`Fecha: ${familia.fecha_ultima_encuesta}\n`);
    console.log('📊 OBSERVACIONES:');
    console.log(`- sustento_familia: "${familia.sustento_familia}"`);
    console.log(`- observaciones_encuestador: "${familia.observaciones_encuestador}"`);
    console.log(`- autorizacion_datos: ${familia.autorizacion_datos}\n`);
    
    if (familia.sustento_familia === 'tma nuevo pruiebs' && 
        familia.observaciones_encuestador === 'completedooo' &&
        familia.autorizacion_datos === true) {
      console.log('✅✅✅ ¡ÉXITO TOTAL! ✅✅✅');
      console.log('✅ Los datos de observaciones se guardaron CORRECTAMENTE');
      console.log('✅ El servidor está funcionando con el código actualizado');
      console.log('✅ El fix está aplicado y funcionando en producción');
    } else {
      console.log('❌ Algo salió mal, los datos no coinciden');
    }
    
    await sequelize.close();
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
})();
