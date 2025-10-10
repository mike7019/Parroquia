/**
 * Script para actualizar la tabla habilidades
 * Hace la columna descripcion NOT NULL
 */

import sequelize from './config/sequelize.js';

async function updateHabilidadesTable() {
  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     ACTUALIZAR TABLA HABILIDADES - DESCRIPCION REQUIRED    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('   ✅ Conexión exitosa\n');

    // Actualizar registros con descripcion NULL a string vacío temporal
    console.log('2. Actualizando registros con descripcion NULL...');
    const [updateResult] = await sequelize.query(`
      UPDATE habilidades 
      SET descripcion = 'Descripción pendiente'
      WHERE descripcion IS NULL OR descripcion = '';
    `);
    console.log(`   ✅ ${updateResult} registro(s) actualizado(s)\n`);

    // Alterar columna para hacerla NOT NULL
    console.log('3. Modificando columna descripcion a NOT NULL...');
    await sequelize.query(`
      ALTER TABLE habilidades 
      ALTER COLUMN descripcion SET NOT NULL;
    `);
    console.log('   ✅ Columna descripcion ahora es NOT NULL\n');

    // Verificar cambios
    console.log('4. Verificando estructura actualizada...');
    const [columns] = await sequelize.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_name = 'habilidades' AND column_name = 'descripcion';
    `);

    if (columns.length > 0) {
      const col = columns[0];
      console.log(`   Columna: ${col.column_name}`);
      console.log(`   Tipo: ${col.data_type}`);
      console.log(`   Nullable: ${col.is_nullable}`);
      
      if (col.is_nullable === 'NO') {
        console.log('   ✅ Cambio aplicado correctamente\n');
      }
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              ACTUALIZACIÓN COMPLETADA                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n✅ La tabla habilidades ahora requiere descripcion');
    console.log('   Campos requeridos para crear: nombre, descripcion');
    console.log('   Campo opcional: categoria\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.parent) {
      console.error('SQL Error:', error.parent.message);
    }
    process.exit(1);
  }
}

updateHabilidadesTable();
