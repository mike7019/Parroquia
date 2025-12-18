require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'parroquia_user',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '206.62.139.100',
    port: process.env.DB_PORT || 5433,
    dialect: 'postgres',
    logging: false
  }
);

(async () => {
  try {
    console.log('🔍 Verificando datos de observaciones en tabla familias...\n');
    
    // Contar total de familias
    const [totalFamilias] = await sequelize.query(
      'SELECT COUNT(*) as total FROM familias'
    );
    console.log(`📊 Total familias: ${totalFamilias[0].total}\n`);
    
    // Contar familias con sustento_familia
    const [conSustento] = await sequelize.query(
      `SELECT COUNT(*) as total FROM familias 
       WHERE sustento_familia IS NOT NULL AND sustento_familia != ''`
    );
    console.log(`✅ Familias con sustento_familia: ${conSustento[0].total}`);
    
    // Contar familias con observaciones_encuestador
    const [conObservaciones] = await sequelize.query(
      `SELECT COUNT(*) as total FROM familias 
       WHERE observaciones_encuestador IS NOT NULL AND observaciones_encuestador != ''`
    );
    console.log(`✅ Familias con observaciones_encuestador: ${conObservaciones[0].total}`);
    
    // Contar familias con autorizacion_datos = true
    const [conAutorizacion] = await sequelize.query(
      `SELECT COUNT(*) as total FROM familias 
       WHERE autorizacion_datos = true`
    );
    console.log(`✅ Familias con autorizacion_datos = true: ${conAutorizacion[0].total}\n`);
    
    // Mostrar ejemplos de familias con datos
    console.log('📋 Ejemplos de familias con datos de observaciones:\n');
    const [ejemplos] = await sequelize.query(
      `SELECT 
        id_familia, 
        apellido_familiar,
        COALESCE(sustento_familia, '(vacío)') as sustento_familia,
        COALESCE(observaciones_encuestador, '(vacío)') as observaciones_encuestador,
        COALESCE(autorizacion_datos, false) as autorizacion_datos
       FROM familias 
       WHERE sustento_familia IS NOT NULL 
          OR observaciones_encuestador IS NOT NULL 
          OR autorizacion_datos = true
       LIMIT 5`
    );
    
    if (ejemplos.length > 0) {
      console.table(ejemplos);
    } else {
      console.log('⚠️  No se encontraron familias con datos en estos campos');
      
      // Mostrar 3 familias aleatorias para ver el estado
      console.log('\n📋 Muestra de 3 familias aleatorias:\n');
      const [muestra] = await sequelize.query(
        `SELECT 
          id_familia, 
          apellido_familiar,
          sustento_familia,
          observaciones_encuestador,
          autorizacion_datos
         FROM familias 
         ORDER BY id_familia DESC
         LIMIT 3`
      );
      console.table(muestra);
    }
    
    await sequelize.close();
    console.log('\n✅ Verificación completada');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
})();
