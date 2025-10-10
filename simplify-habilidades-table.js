/**
 * Script para simplificar la tabla habilidades
 * Elimina las columnas categoria y activo
 */

import sequelize from './config/sequelize.js';

async function simplifyHabilidadesTable() {
  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║      SIMPLIFICAR TABLA HABILIDADES - ELIMINAR COLUMNAS    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('   ✅ Conexión exitosa\n');

    // Verificar si las columnas existen
    console.log('2. Verificando columnas existentes...');
    const [columns] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'habilidades' 
        AND column_name IN ('categoria', 'activo');
    `);
    
    console.log(`   Encontradas ${columns.length} columnas para eliminar`);
    columns.forEach(col => {
      console.log(`   - ${col.column_name}`);
    });
    console.log();

    // Eliminar columna categoria si existe
    if (columns.some(c => c.column_name === 'categoria')) {
      console.log('3. Eliminando columna categoria...');
      await sequelize.query(`
        ALTER TABLE habilidades 
        DROP COLUMN IF EXISTS categoria;
      `);
      console.log('   ✅ Columna categoria eliminada\n');
    } else {
      console.log('3. Columna categoria ya no existe\n');
    }

    // Eliminar columna activo si existe
    if (columns.some(c => c.column_name === 'activo')) {
      console.log('4. Eliminando columna activo...');
      await sequelize.query(`
        ALTER TABLE habilidades 
        DROP COLUMN IF EXISTS activo;
      `);
      console.log('   ✅ Columna activo eliminada\n');
    } else {
      console.log('4. Columna activo ya no existe\n');
    }

    // Verificar estructura final
    console.log('5. Verificando estructura final de la tabla...');
    const [finalColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'habilidades'
      ORDER BY ordinal_position;
    `);

    console.log('   Columnas finales:');
    finalColumns.forEach(col => {
      const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
      console.log(`   - ${col.column_name.padEnd(20)} ${col.data_type.padEnd(25)} ${nullable}`);
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              SIMPLIFICACIÓN COMPLETADA                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n✅ La tabla habilidades ahora solo tiene los campos esenciales:');
    console.log('   • id_habilidad (PK, auto-increment)');
    console.log('   • nombre (string, unique, required)');
    console.log('   • descripcion (text, required)');
    console.log('   • created_at (timestamp)');
    console.log('   • updated_at (timestamp)\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.parent) {
      console.error('SQL Error:', error.parent.message);
    }
    process.exit(1);
  }
}

simplifyHabilidadesTable();
