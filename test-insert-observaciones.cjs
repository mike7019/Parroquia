const { Sequelize, QueryTypes } = require('sequelize');

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
    
    // Crear una familia de prueba CON datos de observaciones
    console.log('📝 Creando familia de prueba con datos de observaciones...\n');
    
    const [result] = await sequelize.query(
      `INSERT INTO familias (
        apellido_familiar,
        sector,
        direccion_familia,
        telefono,
        tamaño_familia,
        estado_encuesta,
        numero_encuestas,
        fecha_ultima_encuesta,
        codigo_familia,
        sustento_familia,
        observaciones_encuestador,
        autorizacion_datos,
        id_municipio
      ) VALUES (
        'TEST OBSERVACIONES',
        'Test',
        'Direccion Test',
        '1234567890',
        1,
        'completed',
        1,
        CURRENT_DATE,
        $1,
        $2,
        $3,
        $4,
        1
      ) RETURNING id_familia, apellido_familiar, sustento_familia, observaciones_encuestador, autorizacion_datos`,
      {
        bind: [
          `TEST_${Date.now()}`,
          'Este es el sustento de la familia de prueba',
          'Observaciones del encuestador de prueba',
          true
        ],
        type: QueryTypes.INSERT
      }
    );
    
    console.log('✅ Familia de prueba creada:\n');
    console.log(JSON.stringify(result[0], null, 2));
    
    console.log('\n📋 Esto demuestra que:');
    console.log('1. ✅ Las columnas SÍ existen en la base de datos');
    console.log('2. ✅ Se pueden insertar datos correctamente');
    console.log('3. ⚠️  El problema está en el código del servidor que NO está guardando los datos');
    
    console.log('\n🔧 SOLUCIÓN:');
    console.log('1. Conectarse al servidor: ssh ubuntu@206.62.139.100');
    console.log('2. cd /root/Parroquia');
    console.log('3. git pull origin develop');
    console.log('4. pm2 restart parroquia-api');
    console.log('5. pm2 logs parroquia-api --lines 50');
    
    await sequelize.close();
    console.log('\n✅ Prueba completada');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    await sequelize.close();
    process.exit(1);
  }
})();
