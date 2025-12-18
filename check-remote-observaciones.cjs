const { Sequelize } = require('sequelize');

// Configuración para base de datos REMOTA
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
    console.log('🔍 Conectando a base de datos REMOTA: 206.62.139.100:5433\n');
    
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');
    
    // Verificar la estructura de la tabla familias
    console.log('📋 Verificando estructura de tabla familias:\n');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'familias' 
        AND column_name IN ('sustento_familia', 'observaciones_encuestador', 'autorizacion_datos')
      ORDER BY ordinal_position
    `);
    
    if (columns.length > 0) {
      console.table(columns);
    } else {
      console.log('⚠️  Columnas no encontradas en la tabla familias');
      
      // Mostrar todas las columnas disponibles
      console.log('\n📋 Columnas disponibles en tabla familias:\n');
      const [allColumns] = await sequelize.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'familias'
        ORDER BY ordinal_position
      `);
      console.table(allColumns);
    }
    
    console.log('\n📊 Verificando datos de observaciones en tabla familias...\n');
    
    // Contar total de familias
    const [totalFamilias] = await sequelize.query(
      'SELECT COUNT(*) as total FROM familias'
    );
    console.log(`📊 Total familias: ${totalFamilias[0].total}\n`);
    
    // Verificar si las columnas existen antes de consultar
    const [columnsExist] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.columns
      WHERE table_name = 'familias' 
        AND column_name IN ('sustento_familia', 'observaciones_encuestador', 'autorizacion_datos')
    `);
    
    if (parseInt(columnsExist[0].count) === 3) {
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
      
      // Mostrar las últimas 5 familias con TODOS los datos
      console.log('📋 Últimas 5 familias creadas (para ver datos de observaciones):\n');
      const [ultimas] = await sequelize.query(
        `SELECT 
          id_familia, 
          apellido_familiar,
          COALESCE(sustento_familia, '(NULL)') as sustento_familia,
          COALESCE(observaciones_encuestador, '(NULL)') as observaciones_encuestador,
          COALESCE(autorizacion_datos::text, 'false') as autorizacion_datos,
          fecha_ultima_encuesta
         FROM familias 
         ORDER BY id_familia DESC
         LIMIT 5`
      );
      console.table(ultimas);
      
    } else {
      console.log('⚠️  Las columnas de observaciones NO EXISTEN en la tabla familias de la base de datos remota');
      console.log('⚠️  Esto significa que necesitas ejecutar una migración o sync de la base de datos');
    }
    
    await sequelize.close();
    console.log('\n✅ Verificación completada');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    await sequelize.close();
    process.exit(1);
  }
})();
