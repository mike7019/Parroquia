import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function mostrarIDsDisponibles() {
  try {
    await sequelize.authenticate();
    
    const municipios = await sequelize.query('SELECT id_municipio, nombre_municipio FROM municipios ORDER BY id_municipio LIMIT 3', { type: QueryTypes.SELECT });
    const sectores = await sequelize.query('SELECT id_sector, nombre, id_municipio FROM sectores ORDER BY id_sector LIMIT 3', { type: QueryTypes.SELECT });
    const veredas = await sequelize.query('SELECT id_vereda, nombre, id_municipio_municipios FROM veredas ORDER BY id_vereda LIMIT 3', { type: QueryTypes.SELECT });
    
    console.log('📊 IDs disponibles para usar en encuestas:');
    console.log('==========================================');
    
    console.log('\n🏘️ Municipios:');
    municipios.forEach(m => {
      console.log(`   ID: ${m.id_municipio} - ${m.nombre_municipio}`);
    });
    
    console.log('\n📍 Sectores:');
    sectores.forEach(s => {
      console.log(`   ID: ${s.id_sector} - ${s.nombre} (municipio: ${s.id_municipio})`);
    });
    
    console.log('\n🌾 Veredas:');
    veredas.forEach(v => {
      console.log(`   ID: ${v.id_vereda} - ${v.nombre} (municipio: ${v.id_municipio_municipios})`);
    });
    
    console.log('\n📝 SOLUCIÓN PARA LAS ENCUESTAS:');
    console.log('===============================');
    if (municipios.length > 0 && sectores.length > 0 && veredas.length > 0) {
      console.log('✅ Usar estos IDs en las encuestas:');
      console.log(`   id_municipio: ${municipios[0].id_municipio}`);
      console.log(`   id_sector: ${sectores[0].id_sector}`);
      console.log(`   id_vereda: ${veredas[0].id_vereda}`);
      console.log('\n🎯 ¡Con estos IDs las encuestas deberían funcionar!');
    } else {
      console.log('❌ Faltan datos básicos');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

mostrarIDsDisponibles();
