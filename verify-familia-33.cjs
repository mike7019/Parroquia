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
    console.log('✅ Conectado a base de datos remota\n');
    
    const familiaId = 33;
    
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
    
    console.log(`📊 Verificando familia ID ${familiaId}:\n`);
    console.log(`Apellido: ${familia.apellido_familiar}`);
    console.log(`Fecha: ${familia.fecha_ultima_encuesta}`);
    console.log('');
    console.log('🔍 OBSERVACIONES:');
    console.log(`- sustento_familia: "${familia.sustento_familia}"`);
    console.log(`- observaciones_encuestador: "${familia.observaciones_encuestador}"`);
    console.log(`- autorizacion_datos: ${familia.autorizacion_datos}`);
    console.log('');
    
    if (familia.sustento_familia && familia.observaciones_encuestador) {
      console.log('✅ ¡PERFECTO! Los datos de observaciones SÍ se guardaron correctamente');
      console.log('✅ El servidor YA tiene el código actualizado');
    } else {
      console.log('❌ ERROR: Los datos siguen siendo NULL');
      console.log('❌ El servidor NO ha hecho git pull + pm2 restart');
    }
    
    await sequelize.close();
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
})();
