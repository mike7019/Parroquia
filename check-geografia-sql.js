/**
 * Script para verificar datos geográficos usando SQL directo
 */

import db from './src/models/index.js';
const { sequelize } = db;
import { QueryTypes } from 'sequelize';

async function verificarDatosGeograficos() {
  try {
    console.log('🔍 Verificando datos geográficos de familias...');
    
    // Consulta SQL directa para verificar datos de familias
    const familias = await sequelize.query(`
      SELECT 
        f.id_familia,
        f.id_sector,
        f.id_municipio,
        f.id_vereda,
        s.nombre as sector_nombre,
        m.nombre_municipio as municipio_nombre,
        v.nombre as vereda_nombre
      FROM familias f
      LEFT JOIN sectores s ON f.id_sector = s.id_sector
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio  
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LIMIT 5
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log(`📊 Total familias encontradas: ${familias.length}\n`);
    
    familias.forEach((familia, index) => {
      console.log(`👪 Familia ${familia.id_familia}:`);
      console.log(`   🏘️ Sector ID: ${familia.id_sector} -> ${familia.sector_nombre || 'null'}`);
      console.log(`   🏙️ Municipio ID: ${familia.id_municipio} -> ${familia.municipio_nombre || 'null'}`);
      console.log(`   🌿 Vereda ID: ${familia.id_vereda} -> ${familia.vereda_nombre || 'null'}`);
      console.log('');
    });
    
    // Verificar si existen catálogos geográficos
    const sectores = await sequelize.query('SELECT COUNT(*) as total FROM sectores', { type: QueryTypes.SELECT });
    const municipios = await sequelize.query('SELECT COUNT(*) as total FROM municipios', { type: QueryTypes.SELECT });
    const veredas = await sequelize.query('SELECT COUNT(*) as total FROM veredas', { type: QueryTypes.SELECT });
    
    console.log(`📊 CATÁLOGOS DISPONIBLES:`);
    console.log(`   🏘️ Sectores: ${sectores[0].total}`);
    console.log(`   🏙️ Municipios: ${municipios[0].total}`);
    console.log(`   🌿 Veredas: ${veredas[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarDatosGeograficos();
