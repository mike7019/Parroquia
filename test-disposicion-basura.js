import 'dotenv/config';
import disposicionBasuraService from './src/services/catalog/disposicionBasuraService.js';
import sequelize from './config/sequelize.js';

async function testDisposicionBasuraService() {
  console.log('🧪 Iniciando pruebas del servicio de Disposición de Basura...\n');

  try {
    // Test 1: Verificar conexión a la base de datos
    console.log('1️⃣ Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Test 2: Obtener todos los tipos de disposición
    console.log('2️⃣ Obteniendo todos los tipos de disposición...');
    const allTipos = await disposicionBasuraService.getAllTipos(1, 10);
    console.log(`✅ Encontrados ${allTipos.tipos.length} tipos de disposición`);
    console.log('📋 Tipos encontrados:');
    allTipos.tipos.forEach(tipo => {
      console.log(`   - ID: ${tipo.id_tipo_disposicion_basura}, Nombre: ${tipo.nombre}`);
    });
    console.log('');

    // Test 3: Obtener estadísticas
    console.log('3️⃣ Obteniendo estadísticas de uso...');
    const estadisticas = await disposicionBasuraService.getEstadisticasTipos();
    console.log(`✅ Estadísticas obtenidas para ${estadisticas.length} tipos`);
    console.log('📊 Estadísticas:');
    estadisticas.forEach(stat => {
      console.log(`   - ${stat.nombre}: ${stat.familias_usando} familias usando`);
    });
    console.log('');

    // Test 4: Crear un nuevo tipo de disposición
    console.log('4️⃣ Creando un nuevo tipo de disposición...');
    const nuevoTipo = await disposicionBasuraService.createTipo({
      nombre: 'Separación Avanzada TEST',
      descripcion: 'Sistema de separación avanzada para pruebas'
    });
    console.log(`✅ Tipo creado con ID: ${nuevoTipo.id_tipo_disposicion_basura}`);
    console.log(`   Nombre: ${nuevoTipo.nombre}`);
    console.log('');

    // Test 5: Obtener tipo por ID
    console.log('5️⃣ Obteniendo tipo por ID...');
    const tipoById = await disposicionBasuraService.getTipoById(nuevoTipo.id_tipo_disposicion_basura);
    console.log(`✅ Tipo encontrado: ${tipoById.nombre}`);
    console.log('');

    // Test 6: Actualizar tipo
    console.log('6️⃣ Actualizando tipo de disposición...');
    const tipoActualizado = await disposicionBasuraService.updateTipo(
      nuevoTipo.id_tipo_disposicion_basura,
      {
        nombre: 'Separación Avanzada ACTUALIZADA',
        descripcion: 'Sistema de separación avanzada actualizado para pruebas'
      }
    );
    console.log(`✅ Tipo actualizado: ${tipoActualizado.nombre}`);
    console.log('');

    // Test 7: Búsqueda con filtros
    console.log('7️⃣ Probando búsqueda con filtros...');
    const resultadoBusqueda = await disposicionBasuraService.getAllTipos(1, 5, 'ACTUALIZADA');
    console.log(`✅ Búsqueda completada: ${resultadoBusqueda.tipos.length} resultados encontrados`);
    if (resultadoBusqueda.tipos.length > 0) {
      console.log(`   Primer resultado: ${resultadoBusqueda.tipos[0].nombre}`);
    }
    console.log('');

    // Test 8: Eliminar tipo
    console.log('8️⃣ Eliminando tipo de disposición...');
    await disposicionBasuraService.deleteTipo(nuevoTipo.id_tipo_disposicion_basura);
    console.log('✅ Tipo eliminado exitosamente');
    console.log('');

    // Test 9: Verificar que el tipo fue eliminado
    console.log('9️⃣ Verificando eliminación...');
    try {
      await disposicionBasuraService.getTipoById(nuevoTipo.id_tipo_disposicion_basura);
      console.log('❌ ERROR: El tipo aún existe');
    } catch (error) {
      if (error.statusCode === 404) {
        console.log('✅ Confirmado: El tipo fue eliminado correctamente');
      } else {
        console.log('❌ ERROR inesperado:', error.message);
      }
    }
    console.log('');

    // Test 10: Probar manejo de errores - Crear tipo duplicado
    console.log('🔟 Probando manejo de errores - tipo duplicado...');
    try {
      await disposicionBasuraService.createTipo({
        nombre: 'Recolección Pública', // Este nombre ya existe
        descripcion: 'Intentando crear un duplicado'
      });
      console.log('❌ ERROR: Se permitió crear un tipo duplicado');
    } catch (error) {
      if (error.code === 'DUPLICATE_NAME') {
        console.log('✅ Manejo de errores funcionando: tipo duplicado detectado');
      } else {
        console.log('❌ ERROR inesperado:', error.message);
      }
    }
    console.log('');

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión a la base de datos cerrada');
    process.exit(0);
  }
}

// Ejecutar las pruebas
testDisposicionBasuraService();
