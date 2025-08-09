// Test para verificar que el endpoint de enfermedades no tiene paginación
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testEnfermedadesEndpoint() {
  console.log('🔍 Probando endpoint de enfermedades sin paginación...');
  
  try {
    // Simular un token de autenticación (esto debería ajustarse según el sistema de auth)
    const response = await fetch(`${BASE_URL}/api/catalog/enfermedades`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-token-here' // Descomentar si se necesita auth
      }
    });

    if (!response.ok) {
      console.log(`❌ Error HTTP: ${response.status} - ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    console.log('✅ Respuesta exitosa:');
    console.log('📊 Estructura de la respuesta:');
    console.log(`- success: ${data.success}`);
    console.log(`- message: ${data.message}`);
    
    if (data.data) {
      console.log('📈 Datos:');
      console.log(`- Total de enfermedades: ${data.data.totalCount || 'No especificado'}`);
      console.log(`- Número de enfermedades en la respuesta: ${data.data.enfermedades?.length || 0}`);
      
      // Verificar que NO hay información de paginación
      if (data.data.pagination) {
        console.log('⚠️  ADVERTENCIA: Aún se detecta información de paginación:');
        console.log(data.data.pagination);
      } else {
        console.log('✅ CORRECTO: No hay información de paginación');
      }
      
      // Mostrar las primeras 3 enfermedades como ejemplo
      if (data.data.enfermedades && data.data.enfermedades.length > 0) {
        console.log('\n🩺 Primeras enfermedades (máximo 3):');
        data.data.enfermedades.slice(0, 3).forEach((enfermedad, index) => {
          console.log(`  ${index + 1}. ${enfermedad.nombre} - ${enfermedad.descripcion || 'Sin descripción'}`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Sugerencia: Asegúrate de que el servidor esté corriendo en el puerto 3000');
      console.log('   Puedes iniciarlo con: npm start o node index.js');
    }
  }
}

// Test con búsqueda
async function testEnfermedadesSearch() {
  console.log('\n🔍 Probando búsqueda de enfermedades...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/catalog/enfermedades?search=diabetes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.log(`❌ Error HTTP en búsqueda: ${response.status} - ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log('✅ Búsqueda exitosa:');
    console.log(`- Enfermedades encontradas: ${data.data.enfermedades?.length || 0}`);
    
    if (data.data.enfermedades && data.data.enfermedades.length > 0) {
      console.log('🔎 Resultados de búsqueda:');
      data.data.enfermedades.forEach((enfermedad, index) => {
        console.log(`  ${index + 1}. ${enfermedad.nombre}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Error en búsqueda:', error.message);
  }
}

// Ejecutar las pruebas
async function runTests() {
  await testEnfermedadesEndpoint();
  await testEnfermedadesSearch();
  
  console.log('\n🏁 Pruebas completadas');
}

runTests();
