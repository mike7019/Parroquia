// Script para verificar la estructura de la tabla sectores
import sequelize from './config/sequelize.js';

async function checkSectoresTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla sectores...');
    
    // Obtener información de la tabla
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'sectores' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Estructura actual de la tabla sectores:');
    console.table(results);
    
    // Verificar si existe la columna id_parroquia
    const hasParroquiaColumn = results.some(col => col.column_name === 'id_parroquia');
    
    if (hasParroquiaColumn) {
      console.log('❌ PROBLEMA: La columna id_parroquia AÚN EXISTE en la tabla sectores');
      console.log('🔧 Necesitamos eliminar esta columna...');
      
      // Eliminar la columna
      await sequelize.query(`ALTER TABLE sectores DROP COLUMN IF EXISTS id_parroquia;`);
      console.log('✅ Columna id_parroquia eliminada exitosamente');
      
      // Verificar nuevamente
      const [newResults] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'sectores' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log('📊 Estructura CORREGIDA de la tabla sectores:');
      console.table(newResults);
    } else {
      console.log('✅ La columna id_parroquia NO existe en la tabla sectores (correcto)');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar tabla sectores:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSectoresTable();
