import TipoAguasResiduales from './src/models/catalog/TipoAguasResiduales.js';
import aguasResidualesService from './src/services/catalog/aguasResidualesService.js';
import sequelize from './config/sequelize.js';

async function testReutilizacionIDs() {
  try {
    console.log('🔄 Iniciando prueba de reutilización de IDs en tipos de agua...\n');

    // No limpiar datos existentes para evitar problemas de FK
    console.log('📊 Revisando datos existentes...');
    let todosLosTipos = await aguasResidualesService.getAllTiposAguasResiduales();
    console.log(`   Encontrados ${todosLosTipos.total} tipos existentes\n`);

    // Crear varios tipos de agua
    console.log('📝 Creando tipos de agua para prueba...');
    const tipo1 = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Alcantarillado Municipal',
      descripcion: 'Sistema público de alcantarillado'
    });
    console.log(`   ✅ Creado tipo ID ${tipo1.id_tipo_aguas_residuales}: ${tipo1.nombre}`);

    const tipo2 = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Pozo Séptico',
      descripcion: 'Sistema individual de tratamiento'
    });
    console.log(`   ✅ Creado tipo ID ${tipo2.id_tipo_aguas_residuales}: ${tipo2.nombre}`);

    const tipo3 = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Laguna de Oxidación',
      descripcion: 'Sistema natural de tratamiento'
    });
    console.log(`   ✅ Creado tipo ID ${tipo3.id_tipo_aguas_residuales}: ${tipo3.nombre}`);

    const tipo4 = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Planta de Tratamiento',
      descripcion: 'Sistema avanzado de tratamiento'
    });
    console.log(`   ✅ Creado tipo ID ${tipo4.id_tipo_aguas_residuales}: ${tipo4.nombre}`);

    const tipo5 = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Campo de Infiltración',
      descripcion: 'Sistema de infiltración en suelo'
    });
    console.log(`   ✅ Creado tipo ID ${tipo5.id_tipo_aguas_residuales}: ${tipo5.nombre}\n`);

    // Mostrar estado actual
    let todosLosTipos = await aguasResidualesService.getAllTiposAguasResiduales();
    console.log('📊 Estado actual:');
    todosLosTipos.data.forEach(tipo => {
      console.log(`   ID ${tipo.id_tipo_aguas_residuales}: ${tipo.nombre}`);
    });
    console.log(`   Total: ${todosLosTipos.total} registros\n`);

    // Eliminar el tipo con ID 3 (del medio)
    console.log('🗑️ Eliminando tipo de agua con ID 3...');
    await aguasResidualesService.deleteTipoAguasResiduales(tipo3.id_tipo_aguas_residuales);
    console.log('   ✅ Eliminado correctamente\n');

    // Mostrar estado después de eliminación
    todosLosTipos = await aguasResidualesService.getAllTiposAguasResiduales();
    console.log('📊 Estado después de eliminar ID 3:');
    todosLosTipos.data.forEach(tipo => {
      console.log(`   ID ${tipo.id_tipo_aguas_residuales}: ${tipo.nombre}`);
    });
    console.log(`   Total: ${todosLosTipos.total} registros\n`);

    // Crear un nuevo tipo - debería reutilizar el ID 3
    console.log('➕ Creando nuevo tipo (debería reutilizar ID 3)...');
    const nuevoTipo = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Biodigestor',
      descripcion: 'Sistema de tratamiento anaeróbico'
    });
    console.log(`   ✅ Nuevo tipo creado con ID ${nuevoTipo.id_tipo_aguas_residuales}: ${nuevoTipo.nombre}`);
    
    if (nuevoTipo.id_tipo_aguas_residuales === 3) {
      console.log('   🎉 ¡Éxito! El ID 3 fue reutilizado correctamente\n');
    } else {
      console.log(`   ❌ Error: Se esperaba ID 3, pero se obtuvo ID ${nuevoTipo.id_tipo_aguas_residuales}\n`);
    }

    // Eliminar ID 2 ahora
    console.log('🗑️ Eliminando tipo de agua con ID 2...');
    await aguasResidualesService.deleteTipoAguasResiduales(tipo2.id_tipo_aguas_residuales);
    console.log('   ✅ Eliminado correctamente\n');

    // Crear otro tipo - debería reutilizar el ID 2
    console.log('➕ Creando otro tipo (debería reutilizar ID 2)...');
    const otroTipo = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Humedal Artificial',
      descripcion: 'Sistema de tratamiento con plantas'
    });
    console.log(`   ✅ Otro tipo creado con ID ${otroTipo.id_tipo_aguas_residuales}: ${otroTipo.nombre}`);
    
    if (otroTipo.id_tipo_aguas_residuales === 2) {
      console.log('   🎉 ¡Éxito! El ID 2 fue reutilizado correctamente\n');
    } else {
      console.log(`   ❌ Error: Se esperaba ID 2, pero se obtuvo ID ${otroTipo.id_tipo_aguas_residuales}\n`);
    }

    // Estado final
    todosLosTipos = await aguasResidualesService.getAllTiposAguasResiduales();
    console.log('📊 Estado final:');
    todosLosTipos.data.forEach(tipo => {
      console.log(`   ID ${tipo.id_tipo_aguas_residuales}: ${tipo.nombre}`);
    });
    console.log(`   Total: ${todosLosTipos.total} registros\n`);

    console.log('✅ Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
testReutilizacionIDs();