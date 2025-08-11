/**
 * Script para limpiar duplicados y luego sincronizar el modelo SistemaAcueducto
 */

import sequelize from './config/sequelize.js';
import SistemaAcueducto from './src/models/catalog/SistemaAcueducto.js';

async function cleanAndSyncSistemaAcueducto() {
  try {
    console.log('🧹 Limpiando duplicados y sincronizando modelo SistemaAcueducto...\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');

    // 1. Verificar duplicados existentes
    console.log('🔍 Verificando registros duplicados...');
    const [duplicados] = await sequelize.query(`
      SELECT nombre, COUNT(*) as cantidad
      FROM sistemas_acueducto 
      GROUP BY nombre 
      HAVING COUNT(*) > 1
      ORDER BY cantidad DESC
    `);
    
    if (duplicados.length > 0) {
      console.log('⚠️ Encontrados registros duplicados:');
      duplicados.forEach(dup => {
        console.log(`   - "${dup.nombre}": ${dup.cantidad} registros`);
      });

      // 2. Eliminar duplicados manteniendo el más reciente
      console.log('\n🧹 Eliminando duplicados...');
      for (const dup of duplicados) {
        const [registros] = await sequelize.query(`
          SELECT id_sistema_acueducto, nombre, created_at
          FROM sistemas_acueducto 
          WHERE nombre = :nombre
          ORDER BY created_at DESC
        `, {
          replacements: { nombre: dup.nombre }
        });

        // Mantener el primer registro (más reciente) y eliminar los demás
        for (let i = 1; i < registros.length; i++) {
          await sequelize.query(`
            DELETE FROM sistemas_acueducto 
            WHERE id_sistema_acueducto = :id
          `, {
            replacements: { id: registros[i].id_sistema_acueducto }
          });
          console.log(`   ✅ Eliminado registro duplicado: ID ${registros[i].id_sistema_acueducto} - "${registros[i].nombre}"`);
        }
      }
    } else {
      console.log('✅ No se encontraron duplicados');
    }

    // 3. Verificar el estado actual antes del sync
    console.log('\n📊 Estado actual de la tabla:');
    const [estadoActual] = await sequelize.query(`
      SELECT COUNT(*) as total,
             COUNT(DISTINCT nombre) as nombres_unicos
      FROM sistemas_acueducto
    `);
    console.log(`   Total de registros: ${estadoActual[0].total}`);
    console.log(`   Nombres únicos: ${estadoActual[0].nombres_unicos}`);

    if (estadoActual[0].total !== estadoActual[0].nombres_unicos) {
      console.log('❌ Aún hay duplicados. Abortando sincronización.');
      return;
    }

    // 4. Intentar sincronizar con alter: true
    console.log('\n🔧 Sincronizando modelo...');
    await SistemaAcueducto.sync({ alter: true });
    console.log('✅ Modelo sincronizado exitosamente');

    // 5. Verificar que la restricción única se aplicó
    console.log('\n🔍 Verificando restricción única...');
    const [restricciones] = await sequelize.query(`
      SELECT constraint_name, column_name
      FROM information_schema.key_column_usage 
      WHERE table_name = 'sistemas_acueducto' 
      AND constraint_name LIKE '%unique%'
    `);
    
    if (restricciones.length > 0) {
      console.log('✅ Restricción única aplicada:');
      restricciones.forEach(rest => {
        console.log(`   - ${rest.constraint_name} en columna ${rest.column_name}`);
      });
    } else {
      console.log('⚠️ No se encontraron restricciones únicas explícitas');
    }

    // 6. Probar la restricción única con datos de prueba
    console.log('\n🧪 Probando restricción única...');
    const testName = `Test Único ${Date.now()}`;
    
    try {
      // Crear primer registro
      const sistema1 = await SistemaAcueducto.create({
        nombre: testName,
        descripcion: 'Primer sistema de prueba'
      });
      console.log('✅ Primer sistema creado exitosamente');

      // Intentar crear segundo registro con mismo nombre
      try {
        await SistemaAcueducto.create({
          nombre: testName,
          descripcion: 'Segundo sistema de prueba - debería fallar'
        });
        console.log('❌ ERROR: Se permitió crear registro duplicado');
      } catch (uniqueError) {
        if (uniqueError.name === 'SequelizeUniqueConstraintError') {
          console.log('✅ Restricción única funcionando correctamente');
        } else {
          console.log('⚠️ Error inesperado:', uniqueError.message);
        }
      }

      // Limpiar registro de prueba
      await sistema1.destroy();
      console.log('🧹 Registro de prueba eliminado');

    } catch (testError) {
      console.log('⚠️ Error durante la prueba:', testError.message);
    }

    // 7. Mostrar estado final
    console.log('\n📊 Estado final de la tabla:');
    const [estadoFinal] = await sequelize.query(`
      SELECT COUNT(*) as total,
             COUNT(DISTINCT nombre) as nombres_unicos
      FROM sistemas_acueducto
    `);
    console.log(`   Total de registros: ${estadoFinal[0].total}`);
    console.log(`   Nombres únicos: ${estadoFinal[0].nombres_unicos}`);

    console.log('\n🎉 Proceso completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n📪 Conexión cerrada');
  }
}

// Ejecutar el proceso
cleanAndSyncSistemaAcueducto();
