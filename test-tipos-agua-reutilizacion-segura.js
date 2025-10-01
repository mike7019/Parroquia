import TipoAguasResiduales from './src/models/catalog/TipoAguasResiduales.js';
import aguasResidualesService from './src/services/catalog/aguasResidualesService.js';
import sequelize from './config/sequelize.js';

async function testReutilizacionIDs() {
  try {
    console.log('🔄 Iniciando prueba de reutilización de IDs en tipos de agua...\n');

    // Revisar datos existentes
    console.log('📊 Revisando datos existentes...');
    const tiposExistentes = await aguasResidualesService.getAllTiposAguasResiduales();
    console.log(`   Encontrados ${tiposExistentes.total} tipos existentes`);
    
    if (tiposExistentes.total > 0) {
      console.log('   IDs existentes:');
      tiposExistentes.data.forEach(tipo => {
        console.log(`     ID ${tipo.id_tipo_aguas_residuales}: ${tipo.nombre}`);
      });
    }
    console.log('');

    // Crear un tipo de prueba
    console.log('📝 Creando tipo de agua de prueba...');
    const tipoPrueba1 = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Prueba Reutilización 1',
      descripcion: 'Tipo creado para probar reutilización de IDs'
    });
    console.log(`   ✅ Creado tipo ID ${tipoPrueba1.id_tipo_aguas_residuales}: ${tipoPrueba1.nombre}`);

    // Crear otro tipo de prueba
    const tipoPrueba2 = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Prueba Reutilización 2',
      descripcion: 'Segundo tipo para probar reutilización'
    });
    console.log(`   ✅ Creado tipo ID ${tipoPrueba2.id_tipo_aguas_residuales}: ${tipoPrueba2.nombre}`);

    // Crear tercer tipo de prueba
    const tipoPrueba3 = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Prueba Reutilización 3',
      descripcion: 'Tercer tipo para probar reutilización'
    });
    console.log(`   ✅ Creado tipo ID ${tipoPrueba3.id_tipo_aguas_residuales}: ${tipoPrueba3.nombre}\n`);

    // Mostrar estado actual
    const estadoActual = await aguasResidualesService.getAllTiposAguasResiduales();
    console.log('📊 Estado después de crear tipos de prueba:');
    estadoActual.data
      .filter(tipo => tipo.nombre.includes('Prueba Reutilización'))
      .forEach(tipo => {
        console.log(`   ID ${tipo.id_tipo_aguas_residuales}: ${tipo.nombre}`);
      });
    console.log('');

    // Eliminar el tipo del medio
    console.log(`🗑️ Eliminando tipo de agua con ID ${tipoPrueba2.id_tipo_aguas_residuales}...`);
    await aguasResidualesService.deleteTipoAguasResiduales(tipoPrueba2.id_tipo_aguas_residuales);
    console.log('   ✅ Eliminado correctamente\n');

    // Mostrar estado después de eliminación
    const estadoDespuesEliminacion = await aguasResidualesService.getAllTiposAguasResiduales();
    console.log('📊 Estado después de eliminar:');
    estadoDespuesEliminacion.data
      .filter(tipo => tipo.nombre.includes('Prueba Reutilización'))
      .forEach(tipo => {
        console.log(`   ID ${tipo.id_tipo_aguas_residuales}: ${tipo.nombre}`);
      });
    console.log('');

    // Crear un nuevo tipo - debería reutilizar el ID eliminado
    console.log(`➕ Creando nuevo tipo (debería reutilizar ID ${tipoPrueba2.id_tipo_aguas_residuales})...`);
    const nuevoTipo = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Prueba Reutilización Nuevo',
      descripcion: 'Nuevo tipo que debería reutilizar ID eliminado'
    });
    console.log(`   ✅ Nuevo tipo creado con ID ${nuevoTipo.id_tipo_aguas_residuales}: ${nuevoTipo.nombre}`);
    
    if (nuevoTipo.id_tipo_aguas_residuales === tipoPrueba2.id_tipo_aguas_residuales) {
      console.log(`   🎉 ¡Éxito! El ID ${tipoPrueba2.id_tipo_aguas_residuales} fue reutilizado correctamente\n`);
    } else {
      console.log(`   ❌ Error: Se esperaba ID ${tipoPrueba2.id_tipo_aguas_residuales}, pero se obtuvo ID ${nuevoTipo.id_tipo_aguas_residuales}\n`);
    }

    // Estado final de tipos de prueba
    const estadoFinal = await aguasResidualesService.getAllTiposAguasResiduales();
    console.log('📊 Estado final de tipos de prueba:');
    estadoFinal.data
      .filter(tipo => tipo.nombre.includes('Prueba Reutilización'))
      .forEach(tipo => {
        console.log(`   ID ${tipo.id_tipo_aguas_residuales}: ${tipo.nombre}`);
      });
    console.log('');

    // Limpiar tipos de prueba
    console.log('🧹 Limpiando tipos de prueba creados...');
    const tiposParaLimpiar = estadoFinal.data.filter(tipo => tipo.nombre.includes('Prueba Reutilización'));
    for (const tipo of tiposParaLimpiar) {
      try {
        await aguasResidualesService.deleteTipoAguasResiduales(tipo.id_tipo_aguas_residuales);
        console.log(`   ✅ Eliminado tipo ID ${tipo.id_tipo_aguas_residuales}`);
      } catch (error) {
        console.log(`   ⚠️ No se pudo eliminar tipo ID ${tipo.id_tipo_aguas_residuales}: ${error.message}`);
      }
    }

    console.log('\n✅ Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
testReutilizacionIDs();