import sequelize from './config/sequelize.js';

async function verificarVeredasExistentes() {
  try {
    console.log('🔍 Verificando veredas existentes...\n');
    
    // Buscar todas las veredas
    const [todasVeredas] = await sequelize.query(`
      SELECT id_vereda, nombre, codigo_vereda, id_municipio_municipios 
      FROM veredas 
      ORDER BY id_vereda DESC
      LIMIT 10
    `);
    
    console.log('📊 Últimas 10 veredas en la base de datos:');
    console.table(todasVeredas);
    
    // Buscar específicamente por nombre "El Alamo"
    const [elAlamo] = await sequelize.query(`
      SELECT id_vereda, nombre, codigo_vereda, id_municipio_municipios, created_at
      FROM veredas 
      WHERE nombre ILIKE '%alamo%'
    `);
    
    console.log('\n🔍 Buscando veredas con "Alamo" en el nombre:');
    if (elAlamo.length > 0) {
      console.table(elAlamo);
    } else {
      console.log('❌ No se encontró ninguna vereda con "Alamo" en el nombre');
    }
    
    // Contar veredas por municipio
    const [porMunicipio] = await sequelize.query(`
      SELECT id_municipio_municipios, COUNT(*) as total
      FROM veredas 
      GROUP BY id_municipio_municipios
      ORDER BY total DESC
      LIMIT 10
    `);
    
    console.log('\n📊 Top 10 municipios con más veredas:');
    console.table(porMunicipio);
    
    // Veredas para municipio 383
    const [veredas383] = await sequelize.query(`
      SELECT id_vereda, nombre, codigo_vereda, id_municipio_municipios, created_at
      FROM veredas 
      WHERE id_municipio_municipios = 383
    `);
    
    console.log('\n📍 Veredas del municipio 383 (Girardota):');
    if (veredas383.length > 0) {
      console.table(veredas383);
    } else {
      console.log('❌ No hay veredas para el municipio 383');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

verificarVeredasExistentes();
