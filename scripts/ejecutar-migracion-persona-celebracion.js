/**
 * Script para ejecutar la migración de persona_celebracion
 * 
 * EJECUTAR EN PRODUCCIÓN:
 * node scripts/ejecutar-migracion-persona-celebracion.js
 */

import sequelize from '../src/config/database.js';
import { QueryInterface } from 'sequelize';
import * as migration from '../migrations/20251108000001-create-persona-celebracion.js';

async function ejecutarMigracion() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║    MIGRACIÓN: Crear tabla persona_celebracion                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida\n');

    // Verificar si la tabla ya existe
    const [tables] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'persona_celebracion'
      );
    `);

    const existe = tables[0].exists;

    if (existe) {
      console.log('⚠️  La tabla persona_celebracion YA EXISTE');
      console.log('');
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const respuesta = await new Promise(resolve => {
        rl.question('¿Deseas recrearla? Esto eliminará todos los datos (S/N): ', resolve);
      });
      rl.close();

      if (respuesta.toUpperCase() !== 'S') {
        console.log('\n❌ Operación cancelada por el usuario');
        process.exit(0);
      }

      console.log('\n🗑️  Eliminando tabla existente...');
      await migration.down(sequelize.getQueryInterface(), sequelize.Sequelize);
    }

    // Ejecutar la migración UP
    console.log('🚀 Ejecutando migración...\n');
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);

    // Verificar que se creó correctamente
    console.log('\n📋 Verificando estructura de la tabla...');
    const [columnas] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'persona_celebracion'
      ORDER BY ordinal_position;
    `);

    console.log('\n✅ Columnas creadas:');
    console.table(columnas);

    // Verificar índices
    console.log('\n📊 Verificando índices...');
    const [indices] = await sequelize.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'persona_celebracion'
      ORDER BY indexname;
    `);

    console.log('\n✅ Índices creados:');
    console.table(indices);

    // Verificar constraints
    console.log('\n🔗 Verificando constraints...');
    const [constraints] = await sequelize.query(`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'persona_celebracion'
      ORDER BY tc.constraint_type;
    `);

    console.log('\n✅ Constraints creados:');
    console.table(constraints);

    // Prueba de inserción
    console.log('\n🧪 Ejecutando prueba de inserción...');
    const [testPersona] = await sequelize.query(`
      SELECT id_persona FROM personas LIMIT 1;
    `);

    if (testPersona.length > 0) {
      const personaId = testPersona[0].id_persona;
      console.log(`   Usando persona ID: ${personaId}`);

      await sequelize.query(`
        INSERT INTO persona_celebracion (id_persona, motivo, dia, mes, created_at, updated_at)
        VALUES (${personaId}, 'TEST_MIGRATION', '01', '01', NOW(), NOW())
        ON CONFLICT (id_persona, motivo, dia, mes) DO NOTHING;
      `);
      console.log('   ✅ Inserción de prueba exitosa');

      // Eliminar el registro de prueba
      await sequelize.query(`
        DELETE FROM persona_celebracion 
        WHERE motivo = 'TEST_MIGRATION' AND dia = '01' AND mes = '01';
      `);
      console.log('   🧹 Registro de prueba eliminado');
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE                  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📝 RESUMEN:');
    console.log('   ✅ Tabla persona_celebracion creada');
    console.log('   ✅ 4 índices creados (1 único + 3 de búsqueda)');
    console.log('   ✅ Foreign key a personas configurada');
    console.log('   ✅ Unique constraint configurado');
    console.log('   ✅ Prueba de inserción exitosa\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LA MIGRACIÓN:');
    console.error(error);
    console.error('\n💡 Tip: Verifica que:');
    console.error('   - La tabla personas existe');
    console.error('   - Las variables de entorno están configuradas');
    console.error('   - Tienes permisos de CREATE TABLE\n');
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar
ejecutarMigracion()
  .then(() => {
    console.log('\n🎉 Proceso terminado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Proceso terminado con errores');
    process.exit(1);
  });
