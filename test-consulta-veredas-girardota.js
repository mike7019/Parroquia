import sequelize from './config/sequelize.js';

async function consultarVeredasAPI() {
  try {
    console.log('🔍 Consultando veredas del municipio 383 (simulando el endpoint)...\n');
    
    // Esta es la consulta que debería hacer el endpoint
    const [veredas] = await sequelize.query(`
      SELECT id_vereda, nombre, codigo_vereda, id_municipio_municipios 
      FROM veredas 
      WHERE id_municipio_municipios = 383
      ORDER BY nombre
    `);
    
    console.log(`📊 Total de veredas encontradas: ${veredas.length}\n`);
    
    if (veredas.length > 0) {
      console.log('✅ Veredas para Girardota:\n');
      veredas.forEach((vereda, index) => {
        console.log(`${index + 1}. ${vereda.nombre}`);
        console.log(`   - ID: ${vereda.id_vereda}`);
        console.log(`   - Código: ${vereda.codigo_vereda}`);
        console.log(`   - ID Municipio: ${vereda.id_municipio_municipios}\n`);
      });
      
      // Formato de respuesta del endpoint
      console.log('📄 Respuesta simulada del endpoint:');
      console.log(JSON.stringify({
        success: true,
        message: "Veredas by municipio retrieved successfully",
        data: veredas.map(v => ({
          id_vereda: v.id_vereda,
          nombre: v.nombre,
          codigo_vereda: v.codigo_vereda,
          id_municipio: v.id_municipio_municipios
        })),
        timestamp: new Date().toISOString()
      }, null, 2));
    } else {
      console.log('❌ No se encontraron veredas');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

consultarVeredasAPI();
