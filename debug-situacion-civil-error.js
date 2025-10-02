/**
 * Script de diagnóstico para identificar el error "Datos de situación civil inválidos"
 */

import './src/models/index.js';
import SituacionCivilService from './src/services/situacionCivilService.js';

async function debugSituacionCivilError() {
  console.log('🔍 DIAGNÓSTICO DE ERROR: "Datos de situación civil inválidos"');
  
  try {
    // Test 1: Datos válidos básicos
    console.log('\n1️⃣ Probando datos válidos básicos...');
    const testData1 = {
      nombre: 'Test Válido',
      descripcion: 'Descripción de prueba'
    };
    
    try {
      const result1 = await SituacionCivilService.createSituacionCivil(testData1);
      console.log('✅ Datos básicos válidos funcionan:', result1.id);
      
      // Limpiar el registro de prueba
      await SituacionCivilService.deleteSituacionCivil(result1.id);
    } catch (error) {
      console.log('❌ Error con datos básicos:', error.message);
      if (error.errors) {
        console.log('   Errores detallados:', error.errors);
      }
    }

    // Test 2: Datos con nombre vacío
    console.log('\n2️⃣ Probando nombre vacío...');
    const testData2 = {
      nombre: '',
      descripcion: 'Test descripción'
    };
    
    try {
      await SituacionCivilService.createSituacionCivil(testData2);
      console.log('✅ Nombre vacío fue aceptado (inesperado)');
    } catch (error) {
      console.log('❌ Error esperado con nombre vacío:', error.message);
    }

    // Test 3: Datos con nombre solo espacios
    console.log('\n3️⃣ Probando nombre con solo espacios...');
    const testData3 = {
      nombre: '   ',
      descripcion: 'Test descripción'
    };
    
    try {
      await SituacionCivilService.createSituacionCivil(testData3);
      console.log('✅ Nombre con espacios fue aceptado (inesperado)');
    } catch (error) {
      console.log('❌ Error esperado con espacios:', error.message);
    }

    // Test 4: Sin campo nombre
    console.log('\n4️⃣ Probando sin campo nombre...');
    const testData4 = {
      descripcion: 'Test sin nombre'
    };
    
    try {
      await SituacionCivilService.createSituacionCivil(testData4);
      console.log('✅ Sin nombre fue aceptado (inesperado)');
    } catch (error) {
      console.log('❌ Error esperado sin nombre:', error.message);
    }

    // Test 5: Nombre duplicado
    console.log('\n5️⃣ Probando nombre duplicado...');
    const testData5a = {
      nombre: 'Duplicado Test',
      descripcion: 'Primer registro'
    };
    
    const testData5b = {
      nombre: 'Duplicado Test',
      descripcion: 'Segundo registro'
    };
    
    try {
      const result5a = await SituacionCivilService.createSituacionCivil(testData5a);
      console.log('✅ Primer registro creado:', result5a.id);
      
      try {
        await SituacionCivilService.createSituacionCivil(testData5b);
        console.log('✅ Segundo registro duplicado fue aceptado (inesperado)');
      } catch (error) {
        console.log('❌ Error esperado con duplicado:', error.message);
      }
      
      // Limpiar
      await SituacionCivilService.deleteSituacionCivil(result5a.id);
    } catch (error) {
      console.log('❌ Error creando primer registro:', error.message);
    }

    // Test 6: Código duplicado
    console.log('\n6️⃣ Probando código duplicado...');
    const testData6a = {
      nombre: 'Test Codigo A',
      codigo: 'TESTDUP'
    };
    
    const testData6b = {
      nombre: 'Test Codigo B',
      codigo: 'TESTDUP'
    };
    
    try {
      const result6a = await SituacionCivilService.createSituacionCivil(testData6a);
      console.log('✅ Primer código creado:', result6a.id);
      
      try {
        await SituacionCivilService.createSituacionCivil(testData6b);
        console.log('✅ Código duplicado fue aceptado (inesperado)');
      } catch (error) {
        console.log('❌ Error esperado con código duplicado:', error.message);
      }
      
      // Limpiar
      await SituacionCivilService.deleteSituacionCivil(result6a.id);
    } catch (error) {
      console.log('❌ Error creando primer código:', error.message);
    }

    // Test 7: Nombre muy largo
    console.log('\n7️⃣ Probando nombre muy largo...');
    const testData7 = {
      nombre: 'A'.repeat(101), // Más de 100 caracteres
      descripcion: 'Test descripción'
    };
    
    try {
      await SituacionCivilService.createSituacionCivil(testData7);
      console.log('✅ Nombre largo fue aceptado (inesperado)');
    } catch (error) {
      console.log('❌ Error esperado con nombre largo:', error.message);
    }

    // Test 8: Orden inválido
    console.log('\n8️⃣ Probando orden inválido...');
    const testData8 = {
      nombre: 'Test Orden',
      orden: -1
    };
    
    try {
      const result8 = await SituacionCivilService.createSituacionCivil(testData8);
      console.log('✅ Orden negativo fue aceptado (inesperado):', result8.id);
      await SituacionCivilService.deleteSituacionCivil(result8.id);
    } catch (error) {
      console.log('❌ Error esperado con orden negativo:', error.message);
    }

  } catch (error) {
    console.error('💥 Error general en diagnóstico:', error);
  }

  process.exit(0);
}

debugSituacionCivilError();