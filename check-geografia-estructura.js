/**
 * Script para verificar estructura de tablas geográficas
 */

import db from './src/models/index.js';
const { sequelize } = db;
import { QueryTypes } from 'sequelize';

async function verificarEstructuraGeografica() {
  try {
    console.log('🔍 Verificando estructura de tablas geográficas...');
    
    // Verificar tabla sectores
    const sectores = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sectores' 
      ORDER BY ordinal_position
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log('\n📊 Columnas en tabla sectores:');
    sectores.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type})`);
    });
    
    // Verificar tabla municipios
    const municipios = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'municipios' 
      ORDER BY ordinal_position
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log('\n📊 Columnas en tabla municipios:');
    municipios.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type})`);
    });
    
    // Verificar tabla veredas
    const veredas = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'veredas' 
      ORDER BY ordinal_position
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log('\n📊 Columnas en tabla veredas:');
    veredas.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEstructuraGeografica();
