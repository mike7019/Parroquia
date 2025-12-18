require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'parroquia_db',
  'parroquia_user',
  'clave',
  {
    host: '206.62.139.100',
    port: 5433,
    dialect: 'postgres',
    logging: false
  }
);

async function verifyFamilia38() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a DB establecida\n');

    const [results] = await sequelize.query(`
      SELECT 
        id_familia,
        sustento_familia,
        observaciones_encuestador,
        autorizacion_datos
      FROM familias 
      WHERE id_familia = 38
    `);

    if (results.length === 0) {
      console.log('❌ No se encontró la familia 38');
      return;
    }

    const familia = results[0];
    console.log('🔍 VERIFICACIÓN FAMILIA 38 (DESPUÉS DE PM2 RESTART):');
    console.log('=' .repeat(60));
    console.log('ID Familia:', familia.id_familia);
    console.log('\n📋 OBSERVACIONES:');
    console.log('sustento_familia:', JSON.stringify(familia.sustento_familia));
    console.log('observaciones_encuestador:', JSON.stringify(familia.observaciones_encuestador));
    console.log('autorizacion_datos:', familia.autorizacion_datos);
    console.log('=' .repeat(60));

    // Verificación crítica
    if (familia.sustento_familia === null && familia.observaciones_encuestador === null) {
      console.log('\n❌ FALLO: Los campos siguen siendo NULL');
      console.log('   El problema persiste después del PM2 restart');
    } else {
      console.log('\n✅ ÉXITO: Los datos se guardaron correctamente!');
      console.log('   El PM2 restart resolvió el problema del cache del modelo');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyFamilia38();
