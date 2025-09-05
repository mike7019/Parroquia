/**
 * Script para verificar estructura de tabla familias
 */

import db from './src/models/index.js';
const { sequelize } = db;
import { QueryTypes } from 'sequelize';

async function verificarEstructuraFamilias() {
  try {
    console.log('🔍 Verificando estructura de tabla familias...');
    
    // Obtener columnas de la tabla familias
    const columnas = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      ORDER BY ordinal_position
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log('📊 Columnas en tabla familias:');
    columnas.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type})`);
    });
    
    // Buscar específicamente columnas relacionadas con geografía
    const columnasGeo = columnas.filter(col => 
      col.column_name.includes('sector') || 
      col.column_name.includes('municipio') || 
      col.column_name.includes('vereda')
    );
    
    console.log('\n🌍 Columnas geográficas encontradas:');
    columnasGeo.forEach(col => {
      console.log(`   ✅ ${col.column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEstructuraFamilias();
