/**
 * Script para verificar la estructura de la tabla parroquia
 * y validar la corrección aplicada
 */

import sequelize from './config/sequelize.js';

async function verificarEstructuraParroquia() {
  try {
    console.log('🔍 Verificando estructura de tabla parroquia...\n');

    // Verificar si la tabla existe y su estructura
    const [tableInfo] = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'parroquia'
      ORDER BY ordinal_position;
    `);

    if (tableInfo.length === 0) {
      console.log('⚠️ Tabla "parroquia" no encontrada. Verificando "parroquias"...');
      
      const [tableInfoPlural] = await sequelize.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'parroquias'
        ORDER BY ordinal_position;
      `);
      
      if (tableInfoPlural.length > 0) {
        console.log('✅ Tabla "parroquias" encontrada:');
        console.table(tableInfoPlural);
        console.log('\n🔧 Necesario usar "parroquias" en lugar de "parroquia"');
      } else {
        console.log('❌ Ni "parroquia" ni "parroquias" encontradas');
      }
    } else {
      console.log('✅ Tabla "parroquia" encontrada:');
      console.table(tableInfo);
    }

    // Probar una consulta simple de parroquia
    console.log('\n🧪 Probando consulta de ejemplo...');
    
    try {
      const [parroquias] = await sequelize.query(`
        SELECT id_parroquia, nombre 
        FROM parroquia 
        LIMIT 5;
      `);
      console.log('✅ Consulta exitosa con tabla "parroquia":');
      console.table(parroquias);
    } catch (error) {
      console.log('⚠️ Error con tabla "parroquia", probando "parroquias"...');
      try {
        const [parroquiasPlural] = await sequelize.query(`
          SELECT id_parroquia, nombre 
          FROM parroquias 
          LIMIT 5;
        `);
        console.log('✅ Consulta exitosa con tabla "parroquias":');
        console.table(parroquiasPlural);
      } catch (error2) {
        console.log('❌ Error con ambas tablas:', error2.message);
      }
    }

    // Verificar relación con familias
    console.log('\n🔗 Verificando relación con familias...');
    try {
      const [relacionFamilias] = await sequelize.query(`
        SELECT COUNT(*) as total_familias_con_parroquia
        FROM familias f 
        WHERE f.id_parroquia IS NOT NULL;
      `);
      console.log('✅ Familias con parroquia asignada:', relacionFamilias[0].total_familias_con_parroquia);
    } catch (error) {
      console.log('⚠️ Error verificando relación con familias:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  verificarEstructuraParroquia();
}

export default verificarEstructuraParroquia;
