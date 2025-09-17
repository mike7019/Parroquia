#!/usr/bin/env node

/**
 * Script simple para verificar que el servidor esté funcionando
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function checkServer() {
  console.log('🔍 Verificando servidor...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor funcionando correctamente');
      console.log(`📊 Status: ${data.status || 'OK'}`);
      console.log(`🕐 Timestamp: ${data.timestamp || new Date().toISOString()}`);
      
      if (data.services) {
        console.log('🔧 Servicios:');
        Object.entries(data.services).forEach(([service, status]) => {
          console.log(`   ${service}: ${status}`);
        });
      }
      
      return true;
    } else {
      console.log(`❌ Servidor respondió con error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ No se pudo conectar al servidor: ${error.message}`);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose con: npm run dev');
    return false;
  }
}

checkServer().then(success => {
  process.exit(success ? 0 : 1);
});