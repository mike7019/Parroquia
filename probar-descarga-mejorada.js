/**
 * Prueba del nuevo sistema de descarga de reportes
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

async function probarDescargaDirecta() {
  console.log('\n📥 PROBANDO DESCARGA DIRECTA...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/reportes/familias/excel?incluir_estadisticas=false&formato_avanzado=false`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const contentDisposition = response.headers.get('content-disposition');
      const contentLength = response.headers.get('content-length');
      console.log(`✅ Descarga directa funciona`);
      console.log(`   Content-Disposition: ${contentDisposition}`);
      console.log(`   Tamaño: ${contentLength} bytes`);
    } else {
      console.log(`❌ Error en descarga directa: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function probarGuardadoEnServidor() {
  console.log('\n💾 PROBANDO GUARDADO EN SERVIDOR...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/reportes/download/familias-excel`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filtros: { limit: 10 },
        incluir_estadisticas: false,
        formato_avanzado: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Archivo guardado en servidor`);
      console.log(`   Archivo: ${data.archivo}`);
      console.log(`   Registros: ${data.registros}`);
      console.log(`   Ruta descarga: ${data.ruta_descarga}`);
      
      // Probar descarga del archivo guardado
      await probarDescargaArchivo(data.archivo);
      
    } else {
      console.log(`❌ Error guardando en servidor: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function probarDescargaArchivo(filename) {
  console.log(`\n📂 PROBANDO DESCARGA DE ARCHIVO: ${filename}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/reportes/download/file/${filename}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const contentDisposition = response.headers.get('content-disposition');
      console.log(`✅ Descarga de archivo funciona`);
      console.log(`   Content-Disposition: ${contentDisposition}`);
    } else {
      console.log(`❌ Error descargando archivo: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🧪 PROBANDO SISTEMA DE DESCARGA MEJORADO\n');
  
  await login();
  await probarDescargaDirecta();
  await probarGuardadoEnServidor();
  
  console.log('\n✅ Pruebas completadas!');
}

main().catch(console.error);
