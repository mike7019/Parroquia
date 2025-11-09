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
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`  - ${col.column_name.padEnd(25)} ${col.data_type}${length} ${nullable}`);
    });

    // También mostrar algunos datos de ejemplo
    console.log('\n📊 Ejemplo de datos (primeros 3 registros):');
    console.log('===========================================');
    const ejemplos = await sequelize.query(`
      SELECT * FROM persona_enfermedad LIMIT 3
    `, {
      type: QueryTypes.SELECT
    });
    
    if (ejemplos.length > 0) {
      console.log(JSON.stringify(ejemplos, null, 2));
    } else {
      console.log('  (No hay datos en la tabla)');
    }

    console.log('\n✅ Verificación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

verificarEstructura();
