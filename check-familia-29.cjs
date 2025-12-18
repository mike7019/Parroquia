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
    
    const familiaId = 29;
    
    console.log(`📋 Verificando datos de familia ID: ${familiaId}\n`);
    
    // Obtener todos los datos de la familia
    const [familia] = await sequelize.query(
      `SELECT 
        id_familia,
        apellido_familiar,
        sustento_familia,
        observaciones_encuestador,
        autorizacion_datos,
        fecha_ultima_encuesta,
        estado_encuesta,
        id_usuario_creador
       FROM familias 
       WHERE id_familia = :familiaId`,
      {
        replacements: { familiaId },
        type: QueryTypes.SELECT
      }
    );
    
    if (!familia) {
      console.log(`❌ No se encontró familia con ID ${familiaId}`);
      await sequelize.close();
      return;
    }
    
    console.log('📊 Datos de la familia:\n');
    console.log(`ID Familia: ${familia.id_familia}`);
    console.log(`Apellido: ${familia.apellido_familiar}`);
    console.log(`Fecha última encuesta: ${familia.fecha_ultima_encuesta}`);
    console.log(`Estado: ${familia.estado_encuesta}`);
    console.log(`Usuario creador: ${familia.id_usuario_creador}`);
    console.log('\n🔍 OBSERVACIONES:');
    console.log(`- sustento_familia: "${familia.sustento_familia}" (tipo: ${typeof familia.sustento_familia})`);
    console.log(`- observaciones_encuestador: "${familia.observaciones_encuestador}" (tipo: ${typeof familia.observaciones_encuestador})`);
    console.log(`- autorizacion_datos: ${familia.autorizacion_datos} (tipo: ${typeof familia.autorizacion_datos})`);
    
    // Verificar si los campos están NULL, vacíos o tienen contenido
    if (familia.sustento_familia === null && familia.observaciones_encuestador === null) {
      console.log('\n⚠️  PROBLEMA: Los campos están NULL en la base de datos');
      console.log('⚠️  Esto significa que el servidor NO recibió los datos o NO los guardó');
    } else if (familia.sustento_familia === '' && familia.observaciones_encuestador === '') {
      console.log('\n⚠️  PROBLEMA: Los campos están vacíos (string vacío)');
      console.log('⚠️  El servidor guardó cadenas vacías en lugar de los datos enviados');
    } else {
      console.log('\n✅ Los campos tienen datos guardados correctamente');
    }
    
    // Ver la estructura completa
    console.log('\n📄 Registro completo (JSON):\n');
    console.log(JSON.stringify(familia, null, 2));
    
    await sequelize.close();
    console.log('\n✅ Verificación completada');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    await sequelize.close();
    process.exit(1);
  }
})();
