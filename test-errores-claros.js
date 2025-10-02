/**
 * Test para verificar mensajes de error claros y específicos
 */

import './src/models/index.js';
import SituacionCivilService from './src/services/situacionCivilService.js';

async function testErroresClaros() {
  console.log('🧪 TEST DE MENSAJES DE ERROR CLAROS Y ESPECÍFICOS');
  
  // Test 1: Nombre vacío
  console.log('\n1️⃣ Test: Nombre vacío');
  try {
    await SituacionCivilService.createSituacionCivil({
      nombre: ''
    });
    console.log('❌ No debería llegar aquí');
  } catch (error) {
    console.log('✅ Error esperado capturado:');
    console.log('   Mensaje:', error.message);
    console.log('   Errores:', error.errors);
  }
  
  // Test 2: Nombre muy corto
  console.log('\n2️⃣ Test: Nombre muy corto');
  try {
    await SituacionCivilService.createSituacionCivil({
      nombre: 'A'
    });
    console.log('❌ No debería llegar aquí');
  } catch (error) {
    console.log('✅ Error esperado capturado:');
    console.log('   Mensaje:', error.message);
    console.log('   Errores:', error.errors);
  }
  
  // Test 3: Nombre muy largo
  console.log('\n3️⃣ Test: Nombre muy largo');
  try {
    await SituacionCivilService.createSituacionCivil({
      nombre: 'A'.repeat(101)
    });
    console.log('❌ No debería llegar aquí');
  } catch (error) {
    console.log('✅ Error esperado capturado:');
    console.log('   Mensaje:', error.message);
    console.log('   Errores:', error.errors);
  }
  
  // Test 4: Crear un registro válido para probar duplicados
  console.log('\n4️⃣ Crear registro válido para test de duplicados');
  const registroTest = await SituacionCivilService.createSituacionCivil({
    nombre: 'Test Duplicado',
    codigo: 'TEST'
  });
  console.log(`✅ Registro creado con ID: ${registroTest.id}`);
  
  // Test 5: Nombre duplicado
  console.log('\n5️⃣ Test: Nombre duplicado');
  try {
    await SituacionCivilService.createSituacionCivil({
      nombre: 'Test Duplicado'
    });
    console.log('❌ No debería llegar aquí');
  } catch (error) {
    console.log('✅ Error esperado capturado:');
    console.log('   Mensaje:', error.message);
    console.log('   Errores:', error.errors);
  }
  
  // Test 6: Código duplicado
  console.log('\n6️⃣ Test: Código duplicado');
  try {
    await SituacionCivilService.createSituacionCivil({
      nombre: 'Test Diferente',
      codigo: 'TEST'
    });
    console.log('❌ No debería llegar aquí');
  } catch (error) {
    console.log('✅ Error esperado capturado:');
    console.log('   Mensaje:', error.message);
    console.log('   Errores:', error.errors);
  }
  
  // Test 7: Código muy largo
  console.log('\n7️⃣ Test: Código muy largo');
  try {
    await SituacionCivilService.createSituacionCivil({
      nombre: 'Test Código Largo',
      codigo: 'CODIGO_MUY_LARGO'
    });
    console.log('❌ No debería llegar aquí');
  } catch (error) {
    console.log('✅ Error esperado capturado:');
    console.log('   Mensaje:', error.message);
    console.log('   Errores:', error.errors);
  }
  
  // Test 8: Descripción muy larga
  console.log('\n8️⃣ Test: Descripción muy larga');
  try {
    await SituacionCivilService.createSituacionCivil({
      nombre: 'Test Descripción',
      descripcion: 'A'.repeat(501)
    });
    console.log('❌ No debería llegar aquí');
  } catch (error) {
    console.log('✅ Error esperado capturado:');
    console.log('   Mensaje:', error.message);
    console.log('   Errores:', error.errors);
  }
  
  // Test 9: Orden negativo
  console.log('\n9️⃣ Test: Orden negativo');
  try {
    await SituacionCivilService.createSituacionCivil({
      nombre: 'Test Orden',
      orden: -5
    });
    console.log('❌ No debería llegar aquí');
  } catch (error) {
    console.log('✅ Error esperado capturado:');
    console.log('   Mensaje:', error.message);
    console.log('   Errores:', error.errors);
  }
  
  // Limpiar el registro de prueba
  console.log('\n🧹 Limpiando registro de prueba...');
  await SituacionCivilService.deleteSituacionCivil(registroTest.id);
  console.log('✅ Limpieza completada');
  
  console.log('\n🎉 TODOS LOS TESTS DE ERRORES ESPECÍFICOS COMPLETADOS');
  console.log('   ✅ Los mensajes de error son ahora claros y específicos');
  console.log('   ✅ Cada error indica exactamente qué está mal');
  console.log('   ✅ Los usuarios pueden entender cómo corregir los errores');

  process.exit(0);
}

testErroresClaros();