import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';
// Importar los modelos para que se registren en sequelize
import models from './src/models/index.js';

async function testModelsLoading() {
  console.log('🔍 Testing situacion civil creation...\n');

  // Test para verificar si el modelo se carga correctamente
  console.log('📋 Verificando modelos disponibles...');

  // Esperar a que los modelos se carguen completamente
  await sequelize.sync({ alter: false });

  console.log('Models loaded:', Object.keys(sequelize.models));

  if (sequelize.models.SituacionCivil) {
    console.log('✅ SituacionCivil model found');
  } else {
    console.log('❌ SituacionCivil model NOT found');
  }

  console.log('\n=================\n');
}

async function testSituacionCivilCreation(testData, testName) {
  console.log(`📝 ${testName}`);
  console.log('Input data:', JSON.stringify(testData, null, 2));
  
  try {
    const result = await SituacionCivilService.createSituacionCivil(testData);
    console.log('✅ Success:', {
      id: result.id_situacion_civil,
      nombre: result.nombre,
      descripcion: result.descripcion,
      codigo: result.codigo,
      orden: result.orden,
      activo: result.activo
    });
    return result;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  try {
    // Verificar modelos primero
    await testModelsLoading();
    
    // Test 1: Modo mínimo (solo nombre)
    await testSituacionCivilCreation({
      nombre: "Soltero(a)"
    }, "Test 1: Modo mínimo");

    console.log('\n==================================================\n');

    // Test 2: Modo simple (nombre + descripción)
    await testSituacionCivilCreation({
      nombre: "Casado(a)",
      descripcion: "Persona unida en matrimonio"
    }, "Test 2: Modo simple");

    console.log('\n==================================================\n');

    // Test 3: Datos inválidos (sin nombre) - debe fallar
    await testSituacionCivilCreation({
      descripcion: "Descripción sin nombre"
    }, "Test 3: Datos inválidos (sin nombre)");

    console.log('\n==================================================\n');

    // Test 4: Nombre vacío - debe fallar
    await testSituacionCivilCreation({
      nombre: "",
      descripcion: "Descripción con nombre vacío"
    }, "Test 4: Nombre vacío");

    console.log('\n==================================================\n');

    console.log('🏁 Testing completed!\n');
    console.log('✅ All tests completed');

  } catch (error) {
    console.error('❌ Error in tests:', error);
  } finally {
    process.exit(0);
  }
}

runTests();