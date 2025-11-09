/**
 * Script para verificar la estructura de la tabla persona_enfermedad
 */

import { QueryTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

async function verificarEstructura() {
  try {
    console.log('🔍 Verificando estructura de tabla persona_enfermedad...\n');

    // Obtener columnas de la tabla
    const columnas = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        column_default,
        is_nullable,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'persona_enfermedad'
      ORDER BY ordinal_position;
    `, {
      type: QueryTypes.SELECT
    });

    console.log('📋 Columnas de persona_enfermedad:');
    console.log('=====================================');
    columnas.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✅ Verificación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verificarEstructura();
