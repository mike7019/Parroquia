import sequelize from './config/sequelize.js';
import tipoViviendaService from './src/services/catalog/tipoViviendaService.js';

async function testReutilizacionIDsTipoVivienda() {
  try {
    console.log('🔄 Iniciando prueba de reutilización de IDs en tipos de vivienda...\n');

    // Revisar datos existentes
    console.log('📊 Revisando tipos de vivienda existentes...');
    const tiposExistentes = await tipoViviendaService.getAllTipos();
    console.log(`   Encontrados ${tiposExistentes.total} tipos existentes`);
    
    if (tiposExistentes.total > 0) {
      console.log('   IDs existentes:');
      tiposExistentes.data.forEach(tipo => {
        console.log(`     ID ${tipo.id_tipo_vivienda}: ${tipo.nombre}`);
      });
    }
    console.log('');

    // Crear tipos de prueba
    console.log('📝 Creando tipos de vivienda de prueba...');
    const tipoPrueba1 = await tipoViviendaService.createTipo({
      nombre: 'Prueba Reutilización Casa 1',
      descripcion: 'Tipo creado para probar reutilización de IDs',
      activo: true
    });
    console.log(`   ✅ Creado tipo ID ${tipoPrueba1.id_tipo_vivienda}: ${tipoPrueba1.nombre}`);

    const tipoPrueba2 = await tipoViviendaService.createTipo({
      nombre: 'Prueba Reutilización Casa 2',
      descripcion: 'Segundo tipo para probar reutilización',
      activo: true
    });
    console.log(`   ✅ Creado tipo ID ${tipoPrueba2.id_tipo_vivienda}: ${tipoPrueba2.nombre}`);

    const tipoPrueba3 = await tipoViviendaService.createTipo({
      nombre: 'Prueba Reutilización Casa 3',
      descripcion: 'Tercer tipo para probar reutilización',
      activo: true
    });
    console.log(`   ✅ Creado tipo ID ${tipoPrueba3.id_tipo_vivienda}: ${tipoPrueba3.nombre}\n`);

    // Mostrar estado actual
    const estadoActual = await tipoViviendaService.getAllTipos();
    console.log('📊 Estado después de crear tipos de prueba:');
    estadoActual.data
      .filter(tipo => tipo.nombre.includes('Prueba Reutilización'))
      .forEach(tipo => {
        console.log(`   ID ${tipo.id_tipo_vivienda}: ${tipo.nombre}`);
      });
    console.log('');

    // Eliminar el tipo del medio
    console.log(`🗑️ Eliminando tipo de vivienda con ID ${tipoPrueba2.id_tipo_vivienda}...`);
    await tipoViviendaService.deleteTipo(tipoPrueba2.id_tipo_vivienda);
    console.log('   ✅ Eliminado correctamente\n');

    // Mostrar estado después de eliminación
    const estadoDespuesEliminacion = await tipoViviendaService.getAllTipos();
    console.log('📊 Estado después de eliminar:');
    estadoDespuesEliminacion.data
      .filter(tipo => tipo.nombre.includes('Prueba Reutilización'))
      .forEach(tipo => {
        console.log(`   ID ${tipo.id_tipo_vivienda}: ${tipo.nombre}`);
      });
    console.log('');

    // Crear un nuevo tipo - debería reutilizar el ID eliminado
    console.log(`➕ Creando nuevo tipo (debería reutilizar ID ${tipoPrueba2.id_tipo_vivienda})...`);
    const nuevoTipo = await tipoViviendaService.createTipo({
      nombre: 'Prueba Reutilización Casa Nueva',
      descripcion: 'Nuevo tipo que debería reutilizar ID eliminado',
      activo: true
    });
    console.log(`   ✅ Nuevo tipo creado con ID ${nuevoTipo.id_tipo_vivienda}: ${nuevoTipo.nombre}`);
    
    if (nuevoTipo.id_tipo_vivienda === tipoPrueba2.id_tipo_vivienda) {
      console.log(`   🎉 ¡Éxito! El ID ${tipoPrueba2.id_tipo_vivienda} fue reutilizado correctamente\n`);
    } else {
      console.log(`   ❌ Error: Se esperaba ID ${tipoPrueba2.id_tipo_vivienda}, pero se obtuvo ID ${nuevoTipo.id_tipo_vivienda}\n`);
    }

    // Estado final de tipos de prueba
    const estadoFinal = await tipoViviendaService.getAllTipos();
    console.log('📊 Estado final de tipos de prueba:');
    estadoFinal.data
      .filter(tipo => tipo.nombre.includes('Prueba Reutilización'))
      .forEach(tipo => {
        console.log(`   ID ${tipo.id_tipo_vivienda}: ${tipo.nombre}`);
      });
    console.log('');

    // Eliminar el primer ID ahora
    console.log(`🗑️ Eliminando tipo de vivienda con ID ${tipoPrueba1.id_tipo_vivienda}...`);
    await tipoViviendaService.deleteTipo(tipoPrueba1.id_tipo_vivienda);
    console.log('   ✅ Eliminado correctamente\n');

    // Crear otro tipo - debería reutilizar el primer ID
    console.log(`➕ Creando otro tipo (debería reutilizar ID ${tipoPrueba1.id_tipo_vivienda})...`);
    const otroTipo = await tipoViviendaService.createTipo({
      nombre: 'Prueba Reutilización Casa Final',
      descripcion: 'Último tipo para validar reutilización',
      activo: true
    });
    console.log(`   ✅ Otro tipo creado con ID ${otroTipo.id_tipo_vivienda}: ${otroTipo.nombre}`);
    
    if (otroTipo.id_tipo_vivienda === tipoPrueba1.id_tipo_vivienda) {
      console.log(`   🎉 ¡Éxito! El ID ${tipoPrueba1.id_tipo_vivienda} fue reutilizado correctamente\n`);
    } else {
      console.log(`   ❌ Error: Se esperaba ID ${tipoPrueba1.id_tipo_vivienda}, pero se obtuvo ID ${otroTipo.id_tipo_vivienda}\n`);
    }

    // Limpiar tipos de prueba
    console.log('🧹 Limpiando tipos de prueba creados...');
    const tiposParaLimpiar = (await tipoViviendaService.getAllTipos()).data
      .filter(tipo => tipo.nombre.includes('Prueba Reutilización'));
    
    for (const tipo of tiposParaLimpiar) {
      try {
        await tipoViviendaService.deleteTipo(tipo.id_tipo_vivienda);
        console.log(`   ✅ Eliminado tipo ID ${tipo.id_tipo_vivienda}: ${tipo.nombre}`);
      } catch (error) {
        console.log(`   ⚠️ No se pudo eliminar tipo ID ${tipo.id_tipo_vivienda}: ${error.message}`);
      }
    }

    console.log('\n✅ Prueba de reutilización de IDs en tipos de vivienda completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
testReutilizacionIDsTipoVivienda();