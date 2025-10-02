/**
 * Test completo del servicio corregido
 */

import './src/models/index.js';
import SituacionCivilService from './src/services/situacionCivilService.js';

async function testCompleto() {
  console.log('🧪 TEST COMPLETO DEL SERVICIO CORREGIDO');
  
  try {
    // Limpiar el registro de prueba
    console.log('\n1️⃣ Limpiando registro de prueba...');
    try {
      await SituacionCivilService.deleteSituacionCivil(12);
      console.log('✅ Registro de prueba eliminado');
    } catch (error) {
      console.log('ℹ️ No había registro de prueba que limpiar');
    }

    // Test 1: Crear nuevo registro
    console.log('\n2️⃣ Creando nuevo registro...');
    const nuevoRegistro = await SituacionCivilService.createSituacionCivil({
      nombre: 'Estado de Prueba Corregido',
      descripcion: 'Descripción de prueba para verificar corrección'
    });
    
    console.log('✅ Registro creado exitosamente:');
    console.log('   ID:', nuevoRegistro.id);
    console.log('   Nombre:', nuevoRegistro.nombre);

    // Test 2: Eliminar el registro (eliminación física)
    console.log('\n3️⃣ Eliminando registro físicamente...');
    await SituacionCivilService.deleteSituacionCivil(nuevoRegistro.id);
    console.log('✅ Registro eliminado exitosamente');

    // Test 3: Crear otro registro para verificar reutilización
    console.log('\n4️⃣ Creando otro registro para verificar reutilización...');
    const registroReutilizado = await SituacionCivilService.createSituacionCivil({
      nombre: 'Estado Reutilizado',
      descripcion: 'Este registro debería reutilizar el ID anterior'
    });
    
    console.log('✅ Registro con ID reutilizado creado:');
    console.log('   ID:', registroReutilizado.id);
    console.log('   Nombre:', registroReutilizado.nombre);
    
    if (registroReutilizado.id === nuevoRegistro.id) {
      console.log('🎉 ÉXITO: ID reutilizado correctamente!');
    } else {
      console.log('⚠️ ID no fue reutilizado - puede estar funcionando secuencialmente');
    }

    // Limpiar el último registro
    console.log('\n5️⃣ Limpiando registro final...');
    await SituacionCivilService.deleteSituacionCivil(registroReutilizado.id);
    console.log('✅ Test completado y limpiado');

  } catch (error) {
    console.error('💥 Error en test:', error.message);
  }

  process.exit(0);
}

testCompleto();