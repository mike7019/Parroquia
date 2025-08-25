/**
 * Script de prueba para las consultas de difuntos
 * 
 * Este script demuestra cómo usar las nuevas consultas de difuntos implementadas
 */

import 'dotenv/config';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Función para hacer peticiones HTTP
async function makeRequest(endpoint, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    console.log(`\n🔍 Haciendo petición a: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Error ${response.status}:`, data);
      return null;
    }
    
    console.log(`✅ Respuesta exitosa:`, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`❌ Error de red:`, error.message);
    return null;
  }
}

// Función para login y obtener token
async function login() {
  console.log('\n🔐 Iniciando sesión...');
  
  const loginData = {
    email: process.env.TEST_USER_EMAIL || 'admin@parroquia.com',
    password: process.env.TEST_USER_PASSWORD || 'Admin123!'
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error de login:', data);
      return null;
    }
    
    console.log('✅ Login exitoso');
    return data.data?.access_token || data.accessToken;
  } catch (error) {
    console.error('❌ Error de login:', error.message);
    return null;
  }
}

// Función principal de pruebas
async function testDifuntosEndpoints() {
  console.log('🚀 Iniciando pruebas de endpoints de difuntos');
  console.log('=========================================');
  
  // Login
  const token = await login();
  if (!token) {
    console.error('❌ No se pudo obtener el token de autenticación');
    return;
  }
  
  console.log('\n📊 Probando endpoints de difuntos...');
  
  // 1. Consulta de madres difuntas
  console.log('\n1️⃣ Consulta de madres difuntas');
  await makeRequest('/difuntos/consultas/madres', token);
  
  // 2. Consulta de madres difuntas con filtros
  console.log('\n2️⃣ Consulta de madres difuntas con filtros');
  await makeRequest('/difuntos/consultas/madres?sector=Centro&apellido_familiar=García', token);
  
  // 3. Consulta de padres difuntos
  console.log('\n3️⃣ Consulta de padres difuntos');
  await makeRequest('/difuntos/consultas/padres', token);
  
  // 4. Consulta de todos los difuntos
  console.log('\n4️⃣ Consulta de todos los difuntos');
  await makeRequest('/difuntos/consultas/todos', token);
  
  // 5. Consulta de todos los difuntos con filtros
  console.log('\n5️⃣ Consulta de todos los difuntos con filtros');
  await makeRequest('/difuntos/consultas/todos?nombre=María', token);
  
  // 6. Consulta por rango de fechas
  console.log('\n6️⃣ Consulta por rango de fechas');
  await makeRequest('/difuntos/consultas/rango-fechas?fecha_inicio=2020-01-01&fecha_fin=2023-12-31', token);
  
  // 7. Consulta por rango de fechas con filtros adicionales
  console.log('\n7️⃣ Consulta por rango de fechas con filtros');
  await makeRequest('/difuntos/consultas/rango-fechas?fecha_inicio=2020-01-01&fecha_fin=2023-12-31&sector=Centro', token);
  
  // 8. Estadísticas de difuntos
  console.log('\n8️⃣ Estadísticas de difuntos');
  await makeRequest('/difuntos/estadisticas', token);
  
  console.log('\n✅ Pruebas completadas');
  console.log('======================');
}

// Función para mostrar ejemplos de uso
function showUsageExamples() {
  console.log('\n📚 EJEMPLOS DE USO DE LAS CONSULTAS DE DIFUNTOS');
  console.log('===============================================');
  
  console.log('\n🔸 1. Consulta de madres difuntas:');
  console.log('   GET /api/difuntos/consultas/madres');
  console.log('   Filtros opcionales: ?sector=X&apellido_familiar=Y&nombre=Z&fecha_aniversario=YYYY-MM-DD');
  
  console.log('\n🔸 2. Consulta de padres difuntos:');
  console.log('   GET /api/difuntos/consultas/padres');
  console.log('   Filtros opcionales: ?sector=X&apellido_familiar=Y&nombre=Z&fecha_aniversario=YYYY-MM-DD');
  
  console.log('\n🔸 3. Consulta de todos los difuntos:');
  console.log('   GET /api/difuntos/consultas/todos');
  console.log('   Filtros opcionales: ?sector=X&apellido_familiar=Y&nombre=Z&fecha_aniversario=YYYY-MM-DD');
  
  console.log('\n🔸 4. Consulta por rango de fechas:');
  console.log('   GET /api/difuntos/consultas/rango-fechas?fecha_inicio=2020-01-01&fecha_fin=2023-12-31');
  console.log('   Filtros adicionales: &sector=X&apellido_familiar=Y&nombre=Z');
  
  console.log('\n🔸 5. Estadísticas:');
  console.log('   GET /api/difuntos/estadisticas');
  
  console.log('\n📋 FORMATO DE RESPUESTA:');
  console.log('========================');
  console.log(`{
  "status": "success",
  "message": "Consulta obtenida exitosamente",
  "data": {
    "consultas": [
      {
        "sector_vereda": "Vereda La Esperanza",
        "apellido_familiar": "García",
        "parentesco": "Madre",
        "nombre": "María García Sánchez",
        "fecha_aniversario": "2020-03-15"
      }
    ],
    "total": 1,
    "filtros_aplicados": {
      "sector": "La Esperanza"
    }
  }
}`);
  
  console.log('\n🔑 AUTENTICACIÓN REQUERIDA:');
  console.log('==========================');
  console.log('Todas las consultas requieren autenticación con Bearer Token');
  console.log('Header: Authorization: Bearer <token>');
}

// Ejecutar las pruebas si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  showUsageExamples();
  
  // Preguntar si quiere ejecutar las pruebas
  console.log('\n❓ ¿Desea ejecutar las pruebas automáticas? (Requiere servidor en funcionamiento)');
  console.log('   Para ejecutar las pruebas, configure las variables de entorno:');
  console.log('   - TEST_USER_EMAIL: email del usuario de prueba');
  console.log('   - TEST_USER_PASSWORD: contraseña del usuario de prueba');
  console.log('   - API_BASE_URL: URL base de la API (opcional, default: http://localhost:5000/api)');
  
  if (process.env.RUN_TESTS === 'true') {
    testDifuntosEndpoints().catch(console.error);
  }
}

export { testDifuntosEndpoints, makeRequest, login };
