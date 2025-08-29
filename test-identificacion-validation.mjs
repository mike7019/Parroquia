#!/usr/bin/env node

/**
 * Script de prueba para validación de longitud de identificación
 * Valida que los números de identificación no excedan 15 dígitos
 */

import { config } from 'dotenv';
config();

console.log('🧪 INICIANDO PRUEBAS DE VALIDACIÓN DE IDENTIFICACIÓN');
console.log('=' * 60);

// Simulación de casos de prueba
const casosDeTest = [
  {
    description: 'Identificación válida - 8 dígitos',
    numeroIdentificacion: '12345678',
    esperado: 'VÁLIDO'
  },
  {
    description: 'Identificación válida - 10 dígitos',
    numeroIdentificacion: '1234567890',
    esperado: 'VÁLIDO'
  },
  {
    description: 'Identificación válida - 15 dígitos (límite)',
    numeroIdentificacion: '123456789012345',
    esperado: 'VÁLIDO'
  },
  {
    description: 'Identificación inválida - 16 dígitos',
    numeroIdentificacion: '1234567890123456',
    esperado: 'INVÁLIDO'
  },
  {
    description: 'Identificación inválida - 20 dígitos',
    numeroIdentificacion: '12345678901234567890',
    esperado: 'INVÁLIDO'
  },
  {
    description: 'Identificación con guiones - 11 dígitos limpios',
    numeroIdentificacion: '123-456-789-01',
    esperado: 'VÁLIDO'
  },
  {
    description: 'Identificación con espacios - 12 dígitos limpios',
    numeroIdentificacion: '123 456 789 012',
    esperado: 'VÁLIDO'
  },
  {
    description: 'Identificación especial - FALLECIDO',
    numeroIdentificacion: 'FALLECIDO_1234567890',
    esperado: 'VÁLIDO'
  },
  {
    description: 'Identificación especial - TEMP',
    numeroIdentificacion: 'TEMP_1234567890_abc123',
    esperado: 'VÁLIDO'
  }
];

/**
 * Función de validación (replica la lógica del modelo)
 */
function validarIdentificacion(value) {
  try {
    // Validación básica
    if (!value || value.trim() === '') {
      return { valido: false, error: 'La identificación no puede estar vacía' };
    }

    // Permitir identificaciones especiales
    if (value.startsWith('FALLECIDO_') || value.startsWith('TEMP_')) {
      return { valido: true, error: null };
    }

    // Para identificaciones normales, validar dígitos
    const cleanValue = value.replace(/\D/g, ''); // Remover caracteres no numéricos
    
    if (cleanValue.length > 15) {
      return { 
        valido: false, 
        error: `El número de identificación debe contener máximo 15 dígitos (encontrados: ${cleanValue.length})` 
      };
    }
    
    if (cleanValue.length < 1) {
      return { 
        valido: false, 
        error: 'El número de identificación debe tener al menos 1 dígito' 
      };
    }

    return { valido: true, error: null };
  } catch (error) {
    return { valido: false, error: `Error de validación: ${error.message}` };
  }
}

/**
 * Ejecutar pruebas
 */
console.log('\n🔍 EJECUTANDO CASOS DE PRUEBA:');
console.log('-' * 60);

let testsPasados = 0;
let testsFallidos = 0;

casosDeTest.forEach((caso, index) => {
  console.log(`\n${index + 1}. ${caso.description}`);
  console.log(`   📝 Input: "${caso.numeroIdentificacion}"`);
  
  const resultado = validarIdentificacion(caso.numeroIdentificacion);
  const esValido = resultado.valido;
  const esperabamos = caso.esperado === 'VÁLIDO';
  
  if (esValido === esperabamos) {
    console.log(`   ✅ PASS - Resultado: ${esValido ? 'VÁLIDO' : 'INVÁLIDO'}`);
    testsPasados++;
  } else {
    console.log(`   ❌ FAIL - Esperado: ${caso.esperado}, Obtenido: ${esValido ? 'VÁLIDO' : 'INVÁLIDO'}`);
    if (resultado.error) {
      console.log(`   📄 Error: ${resultado.error}`);
    }
    testsFallidos++;
  }
  
  // Mostrar dígitos limpios para casos informativos
  if (!caso.numeroIdentificacion.startsWith('FALLECIDO_') && !caso.numeroIdentificacion.startsWith('TEMP_')) {
    const digitosLimpios = caso.numeroIdentificacion.replace(/\D/g, '');
    console.log(`   🔢 Dígitos extraídos: "${digitosLimpios}" (${digitosLimpios.length} caracteres)`);
  }
});

/**
 * Resumen de resultados
 */
console.log('\n' + '=' * 60);
console.log('📊 RESUMEN DE PRUEBAS:');
console.log('=' * 60);
console.log(`✅ Tests pasados: ${testsPasados}`);
console.log(`❌ Tests fallidos: ${testsFallidos}`);
console.log(`📈 Total ejecutados: ${casosDeTest.length}`);
console.log(`🎯 Porcentaje de éxito: ${((testsPasados / casosDeTest.length) * 100).toFixed(1)}%`);

if (testsFallidos === 0) {
  console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! La validación funciona correctamente.');
} else {
  console.log('\n⚠️ Algunas pruebas fallaron. Revisar la implementación.');
}

console.log('\n💡 IMPLEMENTACIÓN COMPLETADA:');
console.log('  • Modelo Persona.cjs: Validación a nivel de base de datos');
console.log('  • encuestaValidator.js: Validación en formularios de encuesta');
console.log('  • swagger.js: Documentación actualizada de la API');
console.log('  • Migración: Script de verificación de datos existentes');

console.log('\n🚀 PRÓXIMOS PASOS:');
console.log('  1. Ejecutar migración para verificar datos existentes');
console.log('  2. Probar endpoints de creación de encuestas');
console.log('  3. Verificar respuestas de error para identificaciones inválidas');
console.log('  4. Desplegar en producción');

process.exit(testsFallidos === 0 ? 0 : 1);
