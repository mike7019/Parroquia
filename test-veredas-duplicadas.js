import sequelize from './config/sequelize.js';

async function testVeredasDuplicadas() {
  try {
    console.log('🧪 Test: Veredas con mismo nombre en diferentes municipios\n');
    
    // Limpiar veredas de prueba anteriores
    await sequelize.query(`
      DELETE FROM veredas 
      WHERE nombre IN ('El Alamo Test', 'Vereda Prueba 1')
    `);
    
    console.log('✅ Limpieza completada\n');
    
    // Test 1: Crear "El Alamo" en municipio 383 (Girardota)
    console.log('📝 Test 1: Crear "El Alamo" en municipio 383...');
    const [result1] = await sequelize.query(`
      INSERT INTO veredas (nombre, codigo_vereda, id_municipio_municipios, created_at, updated_at)
      VALUES ('El Alamo Test', 'EA383', 383, NOW(), NOW())
      RETURNING *
    `);
    console.log(`   ✅ Creada: ID ${result1[0].id_vereda} - "${result1[0].nombre}" en municipio ${result1[0].id_municipio_municipios}`);
    
    // Test 2: Crear "El Alamo" en municipio 1 (debe ser diferente)
    console.log('\n📝 Test 2: Crear "El Alamo" en municipio 1...');
    const [result2] = await sequelize.query(`
      INSERT INTO veredas (nombre, codigo_vereda, id_municipio_municipios, created_at, updated_at)
      VALUES ('El Alamo Test', 'EA001', 1, NOW(), NOW())
      RETURNING *
    `);
    console.log(`   ✅ Creada: ID ${result2[0].id_vereda} - "${result2[0].nombre}" en municipio ${result2[0].id_municipio_municipios}`);
    
    // Test 3: Intentar crear duplicado en el mismo municipio (debe fallar)
    console.log('\n📝 Test 3: Intentar crear duplicado en municipio 383...');
    try {
      await sequelize.query(`
        INSERT INTO veredas (nombre, codigo_vereda, id_municipio_municipios, created_at, updated_at)
        VALUES ('El Alamo Test', 'EA383B', 383, NOW(), NOW())
      `);
      console.log('   ❌ ERROR: Se permitió crear duplicado en el mismo municipio');
    } catch (error) {
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        console.log('   ✅ Correctamente rechazado (duplicado en mismo municipio)');
      } else {
        console.log(`   ⚠️ Error inesperado: ${error.message}`);
      }
    }
    
    // Verificar resultados
    console.log('\n📊 Resumen de veredas "El Alamo Test":');
    const [veredas] = await sequelize.query(`
      SELECT id_vereda, nombre, codigo_vereda, id_municipio_municipios 
      FROM veredas 
      WHERE nombre = 'El Alamo Test'
      ORDER BY id_municipio_municipios
    `);
    console.table(veredas);
    
    console.log('\n✅ Test completado exitosamente');
    console.log('💡 Ahora puedes crear veredas con el mismo nombre en diferentes municipios');
    
    // Limpiar
    console.log('\n🧹 Limpiando datos de prueba...');
    await sequelize.query(`
      DELETE FROM veredas 
      WHERE nombre = 'El Alamo Test'
    `);
    console.log('✅ Limpieza completada');
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

testVeredasDuplicadas();
