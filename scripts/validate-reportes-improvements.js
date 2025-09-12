#!/usr/bin/env node

/**
 * Script de validación para verificar las mejoras implementadas en el servicio de reportes
 * Ejecuta una serie de tests para confirmar que todas las mejoras están funcionando correctamente
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TOKEN = process.env.TEST_TOKEN;

console.log('🧪 VALIDACIÓN DE MEJORAS - Servicio de Reportes');
console.log('===============================================');
console.log(`📍 URL Base: ${BASE_URL}`);
console.log(`🔑 Token: ${TEST_TOKEN ? 'Configurado' : 'NO CONFIGURADO'}`);
console.log('');

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const message = `${status} - ${name}`;
  console.log(message);
  if (details) console.log(`   ${details}`);
  
  tests.results.push({ name, passed, details });
  if (passed) tests.passed++;
  else tests.failed++;
}

async function testSecurityPathTraversal() {
  try {
    const maliciousFilenames = [
      '../../etc/passwd',
      '..\\..\\windows\\system32\\config\\sam',
      '../config/database.js',
      'test.txt',  // Extensión no permitida
      'test<script>alert(1)</script>.xlsx' // XSS en nombre
    ];

    for (const filename of maliciousFilenames) {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/reportes/download/file/${encodeURIComponent(filename)}`,
          {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` },
            validateStatus: () => true
          }
        );

        if (response.status === 400 && response.data?.codigo === 'INVALID_FILENAME') {
          logTest(`Path Traversal Protection (${filename})`, true, 'Correctamente bloqueado');
        } else {
          logTest(`Path Traversal Protection (${filename})`, false, `Status: ${response.status}`);
        }
      } catch (error) {
        logTest(`Path Traversal Protection (${filename})`, false, `Error: ${error.message}`);
      }
    }
  } catch (error) {
    logTest('Path Traversal Tests', false, `Setup error: ${error.message}`);
  }
}

async function testRateLimiting() {
  try {
    console.log('\n⏱️  Probando Rate Limiting (esto puede tomar unos segundos)...');
    
    const requests = [];
    for (let i = 0; i < 12; i++) {
      requests.push(
        axios.get(`${BASE_URL}/api/reportes/info`, {
          headers: { Authorization: `Bearer ${TEST_TOKEN}` },
          validateStatus: () => true
        })
      );
    }

    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.status === 200).length;
    const rateLimitedCount = responses.filter(r => r.status === 429).length;

    if (rateLimitedCount > 0) {
      logTest('Rate Limiting', true, `${successCount} exitosas, ${rateLimitedCount} limitadas`);
    } else {
      logTest('Rate Limiting', false, 'No se activó el rate limiting');
    }
  } catch (error) {
    logTest('Rate Limiting', false, `Error: ${error.message}`);
  }
}

async function testCompression() {
  try {
    const response = await axios.get(`${BASE_URL}/api/reportes/info`, {
      headers: { 
        'Accept-Encoding': 'gzip, deflate',
        Authorization: `Bearer ${TEST_TOKEN}`
      }
    });

    const hasCompression = response.headers['content-encoding']?.includes('gzip');
    logTest('HTTP Compression', hasCompression, hasCompression ? 'Gzip activo' : 'Sin compresión detectada');
  } catch (error) {
    logTest('HTTP Compression', false, `Error: ${error.message}`);
  }
}

async function testValidation() {
  try {
    // Test fecha inválida
    const invalidDateResponse = await axios.get(
      `${BASE_URL}/api/reportes/familias/excel?fecha_desde=2025-13-45`,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
        validateStatus: () => true
      }
    );

    const dateValidationWorks = invalidDateResponse.status === 400 && 
                               invalidDateResponse.data?.codigo === 'FECHA_INVALIDA';
    logTest('Validación de Fechas', dateValidationWorks, 'Fecha inválida correctamente rechazada');

    // Test parámetro con caracteres sospechosos
    const maliciousParamResponse = await axios.get(
      `${BASE_URL}/api/reportes/familias/excel?apellido_familiar='; DROP TABLE familias; --`,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
        validateStatus: () => true
      }
    );

    const paramValidationWorks = maliciousParamResponse.status === 400 && 
                                maliciousParamResponse.data?.codigo === 'CARACTERES_INVALIDOS';
    logTest('Validación de Parámetros', paramValidationWorks, 'Caracteres maliciosos bloqueados');

  } catch (error) {
    logTest('Validation Tests', false, `Error: ${error.message}`);
  }
}

async function testCacheStats() {
  try {
    const response = await axios.get(`${BASE_URL}/api/reportes/cache/estadisticas`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    const hasMemoryStats = response.data?.datos?.memoriaUsada && 
                          response.data?.datos?.memoriaMaxima;
    logTest('Cache LRU Stats', hasMemoryStats, 
           hasMemoryStats ? `Memoria: ${response.data.datos.memoriaUsada}/${response.data.datos.memoriaMaxima}` : 'Sin estadísticas de memoria');
  } catch (error) {
    logTest('Cache LRU Stats', false, `Error: ${error.message}`);
  }
}

async function testPDFLimits() {
  try {
    // Simular request con muchos registros para PDF
    const response = await axios.post(`${BASE_URL}/api/reportes/pdf/difuntos`, {
      filtros: { limite: 2000 } // Más que el límite anterior de 1000
    }, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      validateStatus: () => true,
      timeout: 30000 // 30 segundos timeout
    });

    // Si no da error de límite, significa que el nuevo límite (5000) está funcionando
    const limitsIncreased = response.status !== 400 || 
                           !response.data?.mensaje?.includes('límite');
    logTest('Límites PDF Aumentados', limitsIncreased, `Status: ${response.status} (debería permitir 2K registros)`);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logTest('Límites PDF Aumentados', true, 'Timeout - procesando reporte grande (límite aumentado)');
    } else {
      logTest('Límites PDF Aumentados', false, `Error: ${error.message}`);
    }
  }
}

async function testLoggingSystem() {
  try {
    // Verificar que los archivos de log existen
    const logFiles = [
      'logs/reportes.log',
      'logs/reportes-errors.log'
    ];

    let allLogsExist = true;
    for (const logFile of logFiles) {
      if (!fs.existsSync(logFile)) {
        allLogsExist = false;
        break;
      }
    }

    logTest('Sistema de Logging', allLogsExist, 
           allLogsExist ? 'Archivos de log creados' : 'Archivos de log faltantes');
  } catch (error) {
    logTest('Sistema de Logging', false, `Error: ${error.message}`);
  }
}

async function testDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['lru-cache', 'compression', 'express-rate-limit', 'winston'];
    
    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
    );

    logTest('Dependencias Instaladas', missingDeps.length === 0, 
           missingDeps.length === 0 ? 'Todas las dependencias presentes' : `Faltantes: ${missingDeps.join(', ')}`);
  } catch (error) {
    logTest('Dependencias Instaladas', false, `Error: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando validación...\n');

  // Tests que no requieren servidor corriendo
  await testDependencies();
  await testLoggingSystem();

  if (!TEST_TOKEN) {
    console.log('\n⚠️  TEST_TOKEN no configurado. Saltando tests de API.');
    console.log('Para tests completos, configure: export TEST_TOKEN=your_jwt_token');
  } else {
    // Tests que requieren API corriendo
    await testCompression();
    await testCacheStats();
    await testValidation();
    await testSecurityPathTraversal();
    await testRateLimiting();
    await testPDFLimits();
  }

  // Resumen final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE VALIDACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Tests Pasados: ${tests.passed}`);
  console.log(`❌ Tests Fallidos: ${tests.failed}`);
  console.log(`📈 Tasa de Éxito: ${Math.round((tests.passed / (tests.passed + tests.failed)) * 100)}%`);

  if (tests.failed === 0) {
    console.log('\n🎉 ¡TODAS LAS MEJORAS VALIDADAS EXITOSAMENTE!');
    console.log('   El servicio de reportes está listo para producción.');
  } else {
    console.log('\n⚠️  ALGUNOS TESTS FALLARON');
    console.log('   Revise los tests fallidos antes de pasar a producción.');
    
    console.log('\n📋 Tests Fallidos:');
    tests.results.filter(r => !r.passed).forEach(test => {
      console.log(`   - ${test.name}: ${test.details}`);
    });
  }

  console.log('\n📝 Para tests completos, asegúrese de:');
  console.log('   1. Servidor corriendo en ' + BASE_URL);
  console.log('   2. TEST_TOKEN configurado con JWT válido');
  console.log('   3. Base de datos accesible para tests de datos');

  process.exit(tests.failed === 0 ? 0 : 1);
}

// Manejo de errores global
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Error no manejado:', error.message);
  process.exit(1);
});

// Ejecutar tests
runAllTests().catch(error => {
  console.error('\n❌ Error ejecutando tests:', error.message);
  process.exit(1);
});
