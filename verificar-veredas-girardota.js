import sequelize from './config/sequelize.js';

async function verificarVeredasGirardota() {
  try {
    console.log('🔍 Verificando veredas para Girardota (ID: 383)...\n');
    
    // Verificar el municipio
    const [municipio] = await sequelize.query(`
      SELECT id_municipio, nombre_municipio, id_departamento 
      FROM municipios 
      WHERE id_municipio = 383
    `);
    
    if (municipio.length === 0) {
      console.log('❌ No se encontró el municipio con ID 383');
      await sequelize.close();
      return;
    }
    
    console.log('✅ Municipio encontrado:');
    console.log(`   ID: ${municipio[0].id_municipio}`);
    console.log(`   Nombre: ${municipio[0].nombre_municipio}`);
    console.log(`   ID Departamento: ${municipio[0].id_departamento}\n`);
    
    // Verificar veredas
    const [veredas] = await sequelize.query(`
      SELECT id_vereda, nombre, codigo_vereda, id_municipio_municipios 
      FROM veredas 
      WHERE id_municipio_municipios = 383
      ORDER BY nombre
    `);
    
    console.log(`📊 Total de veredas para Girardota: ${veredas.length}\n`);
    
    if (veredas.length === 0) {
      console.log('❌ No hay veredas registradas para este municipio');
      console.log('\n💡 Opciones:');
      console.log('   1. Crear veredas manualmente');
      console.log('   2. Ejecutar un seeder de veredas');
      console.log('   3. Importar datos desde otra fuente\n');
      
      // Verificar si hay veredas en otros municipios
      const [totalVeredas] = await sequelize.query(`
        SELECT COUNT(*) as total FROM veredas
      `);
      console.log(`📈 Total de veredas en la base de datos: ${totalVeredas[0].total}`);
      
    } else {
      console.log('✅ Veredas encontradas:\n');
      veredas.forEach((vereda, index) => {
        console.log(`${index + 1}. ${vereda.nombre}`);
        console.log(`   - ID: ${vereda.id_vereda}`);
        console.log(`   - Código: ${vereda.codigo_vereda || 'N/A'}`);
        console.log('');
      });
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verificarVeredasGirardota();
