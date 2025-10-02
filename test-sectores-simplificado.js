import sectorService from './src/services/catalog/sectorService.js';

async function testSectorService() {
  console.log('🧪 Probando servicio de sectores simplificado...\n');

  try {
    // Test 1: Crear un sector solo con nombre e id_municipio
    console.log('1️⃣ Creando sector con solo nombre e id_municipio...');
    const nuevoSector = await sectorService.createSector({
      nombre: 'Sector Centro Test',
      id_municipio: 1
    });
    console.log('✅ Sector creado:', {
      id: nuevoSector.id_sector,
      nombre: nuevoSector.nombre,
      id_municipio: nuevoSector.id_municipio,
      municipio: nuevoSector.municipio?.nombre_municipio
    });

    // Test 2: Obtener todos los sectores
    console.log('\n2️⃣ Obteniendo todos los sectores...');
    const todosLosSectores = await sectorService.getAllSectors();
    console.log(`✅ Se encontraron ${todosLosSectores.total} sectores`);
    console.log('Primer sector:', todosLosSectores.data[0] ? {
      id: todosLosSectores.data[0].id_sector,
      nombre: todosLosSectores.data[0].nombre,
      municipio: todosLosSectores.data[0].municipio?.nombre_municipio
    } : 'No hay sectores');

    // Test 3: Obtener sector por ID
    console.log('\n3️⃣ Obteniendo sector por ID...');
    const sectorPorId = await sectorService.getSectorById(nuevoSector.id_sector);
    console.log('✅ Sector obtenido:', {
      id: sectorPorId.id_sector,
      nombre: sectorPorId.nombre,
      municipio: sectorPorId.municipio?.nombre_municipio
    });

    // Test 4: Actualizar sector
    console.log('\n4️⃣ Actualizando sector...');
    const sectorActualizado = await sectorService.updateSector(nuevoSector.id_sector, {
      nombre: 'Sector Centro Test Actualizado'
    });
    console.log('✅ Sector actualizado:', {
      id: sectorActualizado.id_sector,
      nombre: sectorActualizado.nombre,
      municipio: sectorActualizado.municipio?.nombre_municipio
    });

    // Test 5: Eliminar sector
    console.log('\n5️⃣ Eliminando sector...');
    await sectorService.deleteSector(nuevoSector.id_sector);
    console.log('✅ Sector eliminado correctamente');

    console.log('\n🎉 Todas las pruebas pasaron correctamente');
    console.log('✨ El servicio funciona solo con nombre e id_municipio');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testSectorService();