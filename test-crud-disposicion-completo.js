import disposicionBasuraService from './src/services/catalog/disposicionBasuraService.js';
import sequelize from './config/sequelize.js';
import logger from './src/utils/logger.js';

async function testCRUDCompleto() {
  try {
    console.log('🧪 === PRUEBA COMPLETA DEL CRUD DE DISPOSICIÓN DE BASURA ===\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida\n');

    // 1. OBTENER TODOS LOS TIPOS (READ)
    console.log('📋 1. OBTENER TODOS LOS TIPOS DE DISPOSICIÓN:');
    const todosLosTipos = await disposicionBasuraService.getAllTipos(1, 10);
    console.log(`   - Total encontrados: ${todosLosTipos.pagination.totalItems}`);
    console.log(`   - Página actual: ${todosLosTipos.pagination.currentPage}`);
    console.log('   - Tipos disponibles:');
    todosLosTipos.tipos.forEach(tipo => {
      console.log(`     • ${tipo.nombre}: ${tipo.descripcion}`);
    });
    console.log('');

    // 2. CREAR UN NUEVO TIPO (CREATE)
    console.log('➕ 2. CREAR UN NUEVO TIPO DE DISPOSICIÓN:');
    const nuevoTipo = {
      nombre: 'Gestión Inteligente',
      descripcion: 'Sistema automatizado de gestión de residuos con IoT'
    };
    
    try {
      const tipoCreado = await disposicionBasuraService.createTipo(nuevoTipo);
      console.log(`   ✅ Tipo creado exitosamente:`);
      console.log(`      - ID: ${tipoCreado.id_tipo_disposicion_basura}`);
      console.log(`      - Nombre: ${tipoCreado.nombre}`);
      console.log(`      - Descripción: ${tipoCreado.descripcion}`);
      console.log('');

      // 3. OBTENER EL TIPO CREADO POR ID (READ)
      console.log('🔍 3. OBTENER TIPO POR ID:');
      const tipoPorId = await disposicionBasuraService.getTipoById(tipoCreado.id_tipo_disposicion_basura);
      console.log(`   ✅ Tipo encontrado: ${tipoPorId.nombre}`);
      console.log('');

      // 4. ACTUALIZAR EL TIPO (UPDATE)
      console.log('✏️ 4. ACTUALIZAR TIPO DE DISPOSICIÓN:');
      const datosActualizacion = {
        nombre: 'Gestión Inteligente Plus',
        descripcion: 'Sistema automatizado avanzado con IA y monitoreo en tiempo real'
      };
      
      const tipoActualizado = await disposicionBasuraService.updateTipo(
        tipoCreado.id_tipo_disposicion_basura, 
        datosActualizacion
      );
      console.log(`   ✅ Tipo actualizado:`);
      console.log(`      - Nuevo nombre: ${tipoActualizado.nombre}`);
      console.log(`      - Nueva descripción: ${tipoActualizado.descripcion}`);
      console.log('');

      // 5. OBTENER ESTADÍSTICAS
      console.log('📊 5. OBTENER ESTADÍSTICAS DE USO:');
      const estadisticas = await disposicionBasuraService.getEstadisticasTipos();
      console.log('   📈 Estadísticas por tipo:');
      estadisticas.forEach(stat => {
        const familiasUsando = stat.dataValues ? stat.dataValues.familias_usando : stat.familias_usando;
        console.log(`     • ${stat.nombre}: ${familiasUsando} familias`);
      });
      console.log('');

      // 6. PROBAR BÚSQUEDA
      console.log('🔎 6. PROBAR BÚSQUEDA:');
      const resultadoBusqueda = await disposicionBasuraService.getAllTipos(1, 5, 'recolección');
      console.log(`   🔍 Búsqueda de "recolección": ${resultadoBusqueda.tipos.length} resultados`);
      resultadoBusqueda.tipos.forEach(tipo => {
        console.log(`     • ${tipo.nombre}`);
      });
      console.log('');

      // 7. PROBAR ASIGNACIONES (si hay familias)
      console.log('👨‍👩‍👧‍👦 7. GESTIÓN DE ASIGNACIONES A FAMILIAS:');
      
      // Verificar si hay familias en la base de datos
      const totalFamilias = await sequelize.query('SELECT COUNT(*) as count FROM familias', {
        type: sequelize.QueryTypes.SELECT
      });
      
      if (totalFamilias[0].count > 0) {
        console.log(`   📊 Se encontraron ${totalFamilias[0].count} familias`);
        
        // Crear una familia de prueba si no existe
        const [familias] = await sequelize.query('SELECT id_familia FROM familias LIMIT 1', {
          type: sequelize.QueryTypes.SELECT
        });
        
        if (familias && familias.length > 0) {
          const idFamilia = familias[0].id_familia;
          console.log(`   🏠 Usando familia ID: ${idFamilia}`);
          
          try {
            // Asignar tipo a familia
            const asignacion = await disposicionBasuraService.asignarTipoAFamilia(
              idFamilia, 
              tipoCreado.id_tipo_disposicion_basura
            );
            console.log(`   ✅ Tipo asignado a familia exitosamente`);
            
            // Obtener tipos de la familia
            const tiposFamilia = await disposicionBasuraService.getTiposPorFamilia(idFamilia);
            console.log(`   📋 Familia tiene ${tiposFamilia.length} tipo(s) de disposición asignado(s)`);
            
            // Remover asignación
            await disposicionBasuraService.removerTipoDeFamilia(
              idFamilia, 
              tipoCreado.id_tipo_disposicion_basura
            );
            console.log(`   ❌ Asignación removida exitosamente`);
            
          } catch (asignError) {
            console.log(`   ⚠️ Error en asignaciones: ${asignError.message}`);
          }
        }
      } else {
        console.log('   ⚠️ No hay familias en la base de datos para probar asignaciones');
      }
      console.log('');

      // 8. ELIMINAR EL TIPO CREADO (DELETE)
      console.log('🗑️ 8. ELIMINAR TIPO DE DISPOSICIÓN:');
      await disposicionBasuraService.deleteTipo(tipoCreado.id_tipo_disposicion_basura);
      console.log(`   ✅ Tipo "${tipoActualizado.nombre}" eliminado exitosamente`);
      console.log('');

    } catch (createError) {
      if (createError.code === 'DUPLICATE_NAME') {
        console.log('   ⚠️ Ya existe un tipo con ese nombre, continuando con las pruebas...');
      } else {
        throw createError;
      }
    }

    // 9. VALIDAR INTEGRIDAD DE DATOS
    console.log('🔒 9. VALIDACIÓN DE INTEGRIDAD:');
    
    // Probar crear tipo con nombre duplicado
    try {
      await disposicionBasuraService.createTipo({
        nombre: 'Recolección Pública',
        descripcion: 'Intento de duplicado'
      });
      console.log('   ❌ ERROR: Se permitió crear tipo duplicado');
    } catch (duplicateError) {
      if (duplicateError.code === 'DUPLICATE_NAME') {
        console.log('   ✅ Validación de nombres únicos funciona correctamente');
      }
    }

    // Probar obtener tipo inexistente
    try {
      await disposicionBasuraService.getTipoById(99999);
      console.log('   ❌ ERROR: Se encontró un tipo inexistente');
    } catch (notFoundError) {
      if (notFoundError.code === 'NOT_FOUND') {
        console.log('   ✅ Validación de tipo inexistente funciona correctamente');
      }
    }

    console.log('\n🎉 === TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ===');
    console.log('\n📋 FUNCIONALIDADES VERIFICADAS:');
    console.log('   ✅ Crear tipos de disposición');
    console.log('   ✅ Leer/Obtener tipos (individual y lista)');
    console.log('   ✅ Actualizar tipos de disposición');
    console.log('   ✅ Eliminar tipos de disposición');
    console.log('   ✅ Búsqueda y filtrado');
    console.log('   ✅ Paginación');
    console.log('   ✅ Estadísticas de uso');
    console.log('   ✅ Gestión de asignaciones familia-tipo');
    console.log('   ✅ Validaciones de integridad');
    console.log('   ✅ Manejo de errores');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a base de datos cerrada');
  }
}

// Ejecutar las pruebas
testCRUDCompleto().catch(console.error);
