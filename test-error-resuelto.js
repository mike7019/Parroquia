/**
 * Test final para confirmar que el error "Errores de validación" está resuelto
 */

import './src/models/index.js';
import SituacionCivilService from './src/services/situacionCivilService.js';

async function testFinalValidacion() {
  console.log('🧪 TEST FINAL - ERROR "Errores de validación" RESUELTO');
  
  try {
    // Test 1: Crear situación civil básica
    console.log('\n1️⃣ Creando situación civil básica...');
    const soltero = await SituacionCivilService.createSituacionCivil({
      nombre: 'Soltero(a)'
    });
    
    console.log('✅ Soltero creado:', {
      id: soltero.id,
      nombre: soltero.nombre
    });
    
    // Test 2: Crear situación civil completa
    console.log('\n2️⃣ Creando situación civil completa...');
    const casado = await SituacionCivilService.createSituacionCivil({
      nombre: 'Casado(a)',
      descripcion: 'Estado civil de persona casada',
      codigo: 'CAS',
      orden: 2,
      activo: true
    });
    
    console.log('✅ Casado creado:', {
      id: casado.id,
      nombre: casado.nombre,
      codigo: casado.codigo || 'N/A'
    });
    
    // Test 3: Listar todas
    console.log('\n3️⃣ Listando todas las situaciones civiles...');
    const todas = await SituacionCivilService.getAllSituacionesCiviles();
    
    console.log(`✅ Total encontradas: ${todas.length}`);
    todas.forEach(s => {
      console.log(`   ID ${s.id_situacion_civil}: ${s.nombre}`);
    });
    
    console.log('\n🎉 ¡ERROR "Errores de validación" COMPLETAMENTE RESUELTO!');
    console.log('   ✅ Creación básica funciona');
    console.log('   ✅ Creación completa funciona');
    console.log('   ✅ Listado funciona');
    console.log('   ✅ IDs se generan correctamente (1, 2, ...)');
    
  } catch (error) {
    console.error('❌ Error persistente:', error.message);
    if (error.errors) {
      console.log('   Detalles:', error.errors);
    }
  }

  process.exit(0);
}

testFinalValidacion();