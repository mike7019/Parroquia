/**
 * Script para probar la API de parentescos
 * Obtiene un token de autenticación y luego consulta los parentescos
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function probarAPIParentescos() {
  try {
    console.log('🧪 Probando API de Parentescos');
    console.log('================================');
    
    // Primero intentar obtener un token (asumiendo que hay un usuario admin)
    console.log('\n1️⃣ Intentando autenticación...');
    
    let token = null;
    try {
      // Intentar login con credenciales de prueba
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'admin@test.com',
        password: 'admin123'
      });
      
      token = loginResponse.data.token;
      console.log('✅ Autenticación exitosa');
    } catch (error) {
      console.log('❌ Autenticación falló (esperado si no hay usuarios)');
      console.log('   Probando sin autenticación...');
    }

    // Probar endpoint de estadísticas (si está disponible)
    console.log('\n2️⃣ Probando estadísticas de parentescos...');
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const statsResponse = await axios.get(`${BASE_URL}/api/catalog/parentescos/stats`, { headers });
      
      console.log('✅ Estadísticas obtenidas:');
      console.log(`   Total: ${statsResponse.data.total}`);
      console.log(`   Activos: ${statsResponse.data.activos}`);
      console.log(`   Inactivos: ${statsResponse.data.inactivos}`);
    } catch (error) {
      console.log('❌ Error obteniendo estadísticas:');
      console.log(`   ${error.response?.data?.message || error.message}`);
    }

    // Probar listado de parentescos
    console.log('\n3️⃣ Probando listado de parentescos...');
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const listResponse = await axios.get(`${BASE_URL}/api/catalog/parentescos?limit=5`, { headers });
      
      console.log('✅ Listado obtenido:');
      if (listResponse.data.data && listResponse.data.data.length > 0) {
        listResponse.data.data.forEach((parentesco, index) => {
          console.log(`   ${index + 1}. ${parentesco.nombre} - ${parentesco.descripcion}`);
        });
        console.log(`   Total en respuesta: ${listResponse.data.total}`);
      } else {
        console.log('   No se encontraron datos en la respuesta');
      }
    } catch (error) {
      console.log('❌ Error obteniendo listado:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Mensaje: ${error.response?.data?.message || error.message}`);
    }

    // Probar ruta directa
    console.log('\n4️⃣ Probando ruta directa (/api/parentescos)...');
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const directResponse = await axios.get(`${BASE_URL}/api/parentescos?limit=3`, { headers });
      
      console.log('✅ Ruta directa funciona:');
      if (directResponse.data.data && directResponse.data.data.length > 0) {
        directResponse.data.data.forEach((parentesco, index) => {
          console.log(`   ${index + 1}. ${parentesco.nombre}`);
        });
      }
    } catch (error) {
      console.log('❌ Error en ruta directa:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Mensaje: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎉 Pruebas completadas');
    
  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
probarAPIParentescos();
