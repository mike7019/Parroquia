import sequelize from './config/sequelize.js';

async function crearVeredaPrueba() {
  try {
    console.log('🔧 Creando vereda de prueba para Girardota (ID: 383)...\n');
    
    // Verificar que el municipio existe
    const [municipio] = await sequelize.query(`
      SELECT id_municipio, nombre_municipio 
      FROM municipios 
      WHERE id_municipio = 383
    `);
    
    if (municipio.length === 0) {
      console.log('❌ No se encontró el municipio con ID 383');
      await sequelize.close();
      return;
    }
    
    console.log('✅ Municipio encontrado:', municipio[0].nombre_municipio);
    
    // Crear la vereda de prueba
    const [result] = await sequelize.query(`
      INSERT INTO veredas (nombre, codigo_vereda, id_municipio_municipios, created_at, updated_at)
      VALUES ('Vereda Prueba 1', 'VP001', 383, NOW(), NOW())
      RETURNING *
    `);
    
    console.log('\n✅ Vereda creada exitosamente:');
    console.log(`   ID: ${result[0].id_vereda}`);
    console.log(`   Nombre: ${result[0].nombre}`);
    console.log(`   Código: ${result[0].codigo_vereda}`);
    console.log(`   Municipio ID: ${result[0].id_municipio_municipios}`);
    
    // Verificar la creación
    const [veredas] = await sequelize.query(`
      SELECT id_vereda, nombre, codigo_vereda 
      FROM veredas 
      WHERE id_municipio_municipios = 383
    `);
    
    console.log(`\n📊 Total de veredas para Girardota ahora: ${veredas.length}`);
    
    await sequelize.close();
    console.log('\n✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
    await sequelize.close();
    process.exit(1);
  }
}

crearVeredaPrueba();
