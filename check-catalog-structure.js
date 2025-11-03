/**
 * Script para verificar la estructura de las tablas de catálogos
 */

import { QueryTypes } from 'sequelize';
import sequelize from './config/sequelize.js';

async function checkStructure() {
  try {
    console.log('\n📊 VERIFICANDO ESTRUCTURA DE TABLAS\n');
    
    // Destrezas
    console.log('=== DESTREZAS ===');
    const destrezasColumns = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'destrezas' 
      ORDER BY ordinal_position
    `, { type: QueryTypes.SELECT });
    
    console.log(destrezasColumns);
    
    // Habilidades
    console.log('\n=== HABILIDADES ===');
    const habilidadesColumns = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'habilidades' 
      ORDER BY ordinal_position
    `, { type: QueryTypes.SELECT });
    
    console.log(habilidadesColumns);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkStructure();
