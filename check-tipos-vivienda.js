/**
 * Script para verificar tipos de vivienda disponibles
 */

import db from './src/models/index.js';
const { sequelize } = db;
import { QueryTypes } from 'sequelize';

async function verificarTiposVivienda() {
  try {
    console.log('🏠 Verificando tipos de vivienda disponibles...');
    
    // Obtener todos los tipos de vivienda
    const tipos = await sequelize.query(`
      SELECT id_tipo_vivienda, nombre, descripcion 
      FROM tipos_vivienda 
      ORDER BY id_tipo_vivienda
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log(`📊 Total tipos de vivienda: ${tipos.length}\n`);
    
    tipos.forEach(tipo => {
      console.log(`🏠 ID: ${tipo.id_tipo_vivienda} | Nombre: ${tipo.nombre} | Descripción: ${tipo.descripcion || 'N/A'}`);
    });
    
    // Verificar familias con tipo_vivienda definido
    const familiasConTipo = await sequelize.query(`
      SELECT f.id_familia, f.tipo_vivienda, f.id_tipo_vivienda
      FROM familias f
      WHERE f.tipo_vivienda IS NOT NULL OR f.id_tipo_vivienda IS NOT NULL
      LIMIT 5
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log(`\n📊 Familias con tipo de vivienda definido: ${familiasConTipo.length}`);
    familiasConTipo.forEach(familia => {
      console.log(`👪 Familia ${familia.id_familia}: tipo_vivienda="${familia.tipo_vivienda}", id_tipo_vivienda=${familia.id_tipo_vivienda}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarTiposVivienda();
