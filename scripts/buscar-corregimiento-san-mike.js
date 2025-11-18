import { QueryTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

async function buscarCorregimiento() {
  try {
    console.log('🔍 Buscando corregimiento "Corregimiento San Mike"...\n');
    
    const results = await sequelize.query(`
      SELECT 
        c.id_corregimiento, 
        c.nombre, 
        c.codigo_corregimiento,
        c.id_municipio_municipios, 
        m.nombre_municipio 
      FROM corregimientos c 
      LEFT JOIN municipios m ON c.id_municipio_municipios = m.id_municipio 
      WHERE c.nombre ILIKE '%San Mike%' OR c.nombre ILIKE '%Corregimiento San Mike%'
    `, {
      type: QueryTypes.SELECT
    });
    
    if (results.length === 0) {
      console.log('❌ No se encontraron corregimientos con ese nombre');
    } else {
      console.log(`✅ Encontrados ${results.length} corregimiento(s):\n`);
      results.forEach((c, index) => {
        console.log(`${index + 1}. ID: ${c.id_corregimiento}`);
        console.log(`   Nombre: ${c.nombre}`);
        console.log(`   Código: ${c.codigo_corregimiento}`);
        console.log(`   Municipio: ${c.nombre_municipio} (ID: ${c.id_municipio_municipios})\n`);
      });
    }
    
    // También buscar todos los corregimientos del municipio 1110
    console.log('\n📋 Corregimientos del municipio 1110:\n');
    const corregsDelMunicipio = await sequelize.query(`
      SELECT 
        c.id_corregimiento, 
        c.nombre, 
        c.codigo_corregimiento
      FROM corregimientos c 
      WHERE c.id_municipio_municipios = 1110
      ORDER BY c.nombre
    `, {
      type: QueryTypes.SELECT
    });
    
    if (corregsDelMunicipio.length === 0) {
      console.log('   No hay corregimientos en este municipio');
    } else {
      corregsDelMunicipio.forEach((c, index) => {
        console.log(`   ${index + 1}. ${c.nombre} (ID: ${c.id_corregimiento})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

buscarCorregimiento();
