/**
 * Prueba rápida de todas las rutas de reportes
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
let token = null;

async function login() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    })
  });
  
  const data = await response.json();
  token = data.data.accessToken;
  console.log('🔑 Token obtenido');
}

async function probarRuta(metodo, ruta, descripcion, body = null) {
  try {
    const opciones = {
      method: metodo,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      opciones.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${ruta}`, opciones);
    
    if (response.ok) {
      const size = response.headers.get('content-length') || 'N/A';
      console.log(`✅ ${metodo} ${ruta} - ${descripcion} (${size} bytes)`);
    } else {
      console.log(`❌ ${metodo} ${ruta} - Error ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ${metodo} ${ruta} - Error: ${error.message}`);
  }
}

async function main() {
  console.log('🧪 PROBANDO TODAS LAS RUTAS DE REPORTES\n');
  
  await login();
  
  console.log('\n📋 RUTAS ORIGINALES (POST):');
  await probarRuta('POST', '/api/reportes/excel/familias', 'Excel Familias', {
    tipo: 'familias',
    filtros: { limit: 5 }
  });
  
  await probarRuta('POST', '/api/reportes/pdf/difuntos', 'PDF Difuntos', {
    tipo: 'difuntos',
    filtros: { limit: 5 }
  });
  
  console.log('\n🔄 RUTAS NUEVAS (GET):');
  await probarRuta('GET', '/api/reportes/familias/excel?incluir_estadisticas=false&formato_avanzado=false', 'Excel Familias (GET)');
  await probarRuta('GET', '/api/reportes/difuntos/pdf?incluir_estadisticas=false&formato_detallado=false', 'PDF Difuntos (GET)');
  
  console.log('\n🧪 RUTAS DE PRUEBA:');
  await probarRuta('GET', '/api/reportes/test/excel', 'Test Excel');
  await probarRuta('GET', '/api/reportes/test/pdf', 'Test PDF');
  
  console.log('\n✅ Pruebas completadas!');
}

main().catch(console.error);
