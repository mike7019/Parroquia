/**
 * PRE-CHECK DE PRODUCCIÓN
 * ========================
 * 
 * Script rápido para verificar que el servidor de producción
 * está disponible y listo para testing.
 */

import axios from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const PRODUCTION_URL = process.env.PRODUCTION_API_URL || 'http://206.62.139.11:3000';
const API_URL = `${PRODUCTION_URL}/api`;

console.log(chalk.cyan.bold('\n🔍 PRE-CHECK DE SERVIDOR DE PRODUCCIÓN\n'));
console.log(chalk.blue(`📍 URL: ${PRODUCTION_URL}\n`));

async function checkHealth() {
  try {
    console.log(chalk.yellow('1. Verificando endpoint /api/health...'));
    
    const response = await axios.get(`${API_URL}/health`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      console.log(chalk.green('   ✅ Servidor disponible'));
      console.log(chalk.gray(`   Response: ${JSON.stringify(response.data)}`));
    } else {
      console.log(chalk.red(`   ❌ Status inesperado: ${response.status}`));
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ Error: ${error.message}`));
    
    if (error.code === 'ECONNREFUSED') {
      console.log(chalk.yellow('\n   Posibles causas:'));
      console.log(chalk.yellow('   - Servidor no está corriendo'));
      console.log(chalk.yellow('   - Firewall bloqueando conexión'));
      console.log(chalk.yellow('   - URL incorrecta en .env'));
    }
    
    return false;
  }
  
  return true;
}

async function checkDatabase() {
  try {
    console.log(chalk.yellow('\n2. Verificando conexión a base de datos...'));
    
    // Intentar hacer una consulta simple que requiere DB
    const response = await axios.get(`${API_URL}/catalog/municipios`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      const data = response.data.data || response.data.datos;
      console.log(chalk.green('   ✅ Base de datos accesible'));
      console.log(chalk.gray(`   Municipios encontrados: ${Array.isArray(data) ? data.length : 'N/A'}`));
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ Error: ${error.message}`));
    
    if (error.response?.status === 401) {
      console.log(chalk.yellow('   ℹ️  Endpoint requiere autenticación (esperado)'));
      return true; // No es un error, solo requiere login
    }
    
    return false;
  }
  
  return true;
}

async function checkResponseTime() {
  try {
    console.log(chalk.yellow('\n3. Midiendo tiempo de respuesta...'));
    
    const inicio = Date.now();
    await axios.get(`${API_URL}/health`, { timeout: 10000 });
    const tiempo = Date.now() - inicio;
    
    if (tiempo < 500) {
      console.log(chalk.green(`   ✅ Tiempo de respuesta: ${tiempo}ms (Excelente)`));
    } else if (tiempo < 1000) {
      console.log(chalk.yellow(`   ⚠️  Tiempo de respuesta: ${tiempo}ms (Aceptable)`));
    } else {
      console.log(chalk.red(`   🔴 Tiempo de respuesta: ${tiempo}ms (Lento)`));
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ Error: ${error.message}`));
    return false;
  }
  
  return true;
}

async function checkEnvironment() {
  console.log(chalk.yellow('\n4. Verificando variables de entorno...'));
  
  const checks = [
    { name: 'PRODUCTION_API_URL', value: process.env.PRODUCTION_API_URL },
    { name: 'ADMIN_EMAIL', value: process.env.ADMIN_EMAIL },
    { name: 'ADMIN_PASSWORD', value: process.env.ADMIN_PASSWORD ? '***' : undefined }
  ];
  
  let allOk = true;
  
  checks.forEach(({ name, value }) => {
    if (value) {
      console.log(chalk.green(`   ✅ ${name}: ${value}`));
    } else {
      console.log(chalk.red(`   ❌ ${name}: NO CONFIGURADA`));
      allOk = false;
    }
  });
  
  return allOk;
}

async function runPreCheck() {
  console.log(chalk.cyan('═'.repeat(60)));
  
  const results = {
    health: await checkHealth(),
    database: await checkDatabase(),
    responseTime: await checkResponseTime(),
    environment: await checkEnvironment()
  };
  
  console.log(chalk.cyan('\n═'.repeat(60)));
  console.log(chalk.cyan.bold('\n📊 RESUMEN DEL PRE-CHECK\n'));
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  const percentage = ((passed / total) * 100).toFixed(0);
  
  console.log(`   Total de verificaciones: ${total}`);
  console.log(chalk.green(`   ✅ Exitosas: ${passed}`));
  console.log(chalk.red(`   ❌ Fallidas: ${total - passed}`));
  console.log(chalk.cyan(`   📈 Porcentaje: ${percentage}%\n`));
  
  if (passed === total) {
    console.log(chalk.green.bold('✅ SERVIDOR LISTO PARA TESTING\n'));
    console.log(chalk.blue('Puedes ejecutar: node test-produccion-encuestas.js\n'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold('❌ SERVIDOR NO ESTÁ LISTO\n'));
    console.log(chalk.yellow('Por favor, corrige los problemas antes de ejecutar tests.\n'));
    
    // Mostrar recomendaciones
    console.log(chalk.yellow('🔧 RECOMENDACIONES:\n'));
    
    if (!results.health) {
      console.log('   1. Verifica que el servidor esté corriendo:');
      console.log(chalk.gray('      ssh ubuntu@206.62.139.11 "docker-compose ps"'));
    }
    
    if (!results.database) {
      console.log('   2. Verifica la base de datos:');
      console.log(chalk.gray('      ssh ubuntu@206.62.139.11 "docker-compose logs postgres"'));
    }
    
    if (!results.environment) {
      console.log('   3. Configura las variables de entorno en .env:');
      console.log(chalk.gray('      PRODUCTION_API_URL=http://206.62.139.11:3000'));
      console.log(chalk.gray('      ADMIN_EMAIL=admin@parroquia.com'));
      console.log(chalk.gray('      ADMIN_PASSWORD=tu_password'));
    }
    
    console.log();
    process.exit(1);
  }
}

// Ejecutar
runPreCheck().catch((error) => {
  console.error(chalk.red('\n💥 Error fatal:'), error.message);
  process.exit(1);
});
