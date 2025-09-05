/**
 * Script para verificar datos geográficos de las familias
 */

import db from './src/models/index.js';
const { sequelize, Familia, Sector, Municipio, Vereda } = db;

async function verificarDatosGeograficos() {
  try {
    console.log('🔍 Verificando datos geográficos de familias...');
    
    // Obtener primeras 5 familias con datos geográficos
    const familias = await Familia.findAll({
      limit: 5,
      include: [
        { model: Sector, as: 'sector' },
        { model: Municipio, as: 'municipio' },
        { model: Vereda, as: 'vereda' }
      ]
    });
    
    console.log(`📊 Total familias encontradas: ${familias.length}\n`);
    
    familias.forEach((familia, index) => {
      console.log(`👪 Familia ${familia.id_familias}:`);
      console.log(`   🏘️ Sector ID: ${familia.id_sector_sectores} -> ${familia.sector ? familia.sector.nombre : 'null'}`);
      console.log(`   🏙️ Municipio ID: ${familia.id_municipio_municipios} -> ${familia.municipio ? familia.municipio.nombre : 'null'}`);
      console.log(`   🌿 Vereda ID: ${familia.id_vereda_veredas} -> ${familia.vereda ? familia.vereda.nombre : 'null'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarDatosGeograficos();
