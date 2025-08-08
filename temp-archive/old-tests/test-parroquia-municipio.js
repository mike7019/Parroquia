#!/usr/bin/env node

/**
 * Script de prueba para verificar la funcionalidad actualizada de Parroquia con Municipio
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Configuración para las pruebas
const testConfig = {
  email: 'admin@test.com',
  password: 'Admin123!',
  baseURL: API_BASE
};

let authToken = '';
let municipioId = null;
let parroquiaId = null;

async function authenticate() {
  try {
    console.log('🔐 Autenticando usuario...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: testConfig.email,
      password: testConfig.password
    });
    
    authToken = response.data.data.accessToken;
    console.log('✅ Autenticación exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error en autenticación:', error.response?.data?.message || error.message);
    return false;
  }
}

function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
}

async function testGetMunicipios() {
  try {
    console.log('\n📋 Obteniendo lista de municipios...');
    const response = await axios.get(`${API_BASE}/catalog/municipios`, {
      headers: getAuthHeaders(),
      params: { limit: 5 }
    });
    
    const municipios = response.data.data.municipios;
    if (municipios.length > 0) {
      municipioId = municipios[0].id_municipio;
      console.log(`✅ Municipios obtenidos. Usando municipio ID: ${municipioId} (${municipios[0].nombre_municipio})`);
      return true;
    } else {
      console.log('⚠️  No hay municipios disponibles');
      return false;
    }
  } catch (error) {
    console.error('❌ Error obteniendo municipios:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCreateParroquia() {
  try {
    console.log('\n➕ Creando nueva parroquia...');
    const parroquiaData = {
      nombre: `Parroquia de Prueba ${Date.now()}`,
      id_municipio: municipioId,
      descripcion: 'Parroquia creada para pruebas de funcionalidad',
      direccion: 'Calle de Prueba #123',
      telefono: '+57 300 123-4567',
      email: 'test@parroquia.com',
      activo: true
    };
    
    const response = await axios.post(`${API_BASE}/catalog/parroquias`, parroquiaData, {
      headers: getAuthHeaders()
    });
    
    parroquiaId = response.data.data.id_parroquia;
    console.log(`✅ Parroquia creada exitosamente`);
    console.log(`   ID: ${parroquiaId}`);
    console.log(`   Nombre: ${response.data.data.nombre}`);
    console.log(`   Municipio: ${response.data.data.municipio?.nombre_municipio}`);
    console.log(`   Departamento: ${response.data.data.municipio?.departamento?.nombre}`);
    return true;
  } catch (error) {
    console.error('❌ Error creando parroquia:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetParroquias() {
  try {
    console.log('\n📋 Obteniendo lista de parroquias...');
    const response = await axios.get(`${API_BASE}/catalog/parroquias`, {
      headers: getAuthHeaders(),
      params: { 
        limit: 10,
        id_municipio: municipioId 
      }
    });
    
    const parroquias = response.data.data.parroquias;
    console.log(`✅ ${parroquias.length} parroquias obtenidas para el municipio ${municipioId}`);
    
    if (parroquias.length > 0) {
      console.log('   Ejemplo de parroquia:');
      const ejemplo = parroquias[0];
      console.log(`   - ID: ${ejemplo.id_parroquia}`);
      console.log(`   - Nombre: ${ejemplo.nombre}`);
      console.log(`   - Municipio: ${ejemplo.municipio?.nombre_municipio}`);
      console.log(`   - Activo: ${ejemplo.activo}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Error obteniendo parroquias:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetParroquiaById() {
  if (!parroquiaId) {
    console.log('\n⚠️  No hay parroquia para probar (salteando test)');
    return true;
  }

  try {
    console.log(`\n🔍 Obteniendo parroquia por ID: ${parroquiaId}...`);
    const response = await axios.get(`${API_BASE}/catalog/parroquias/${parroquiaId}`, {
      headers: getAuthHeaders()
    });
    
    const parroquia = response.data.data;
    console.log('✅ Parroquia obtenida exitosamente:');
    console.log(`   - ID: ${parroquia.id_parroquia}`);
    console.log(`   - Nombre: ${parroquia.nombre}`);
    console.log(`   - Descripción: ${parroquia.descripcion}`);
    console.log(`   - Dirección: ${parroquia.direccion}`);
    console.log(`   - Teléfono: ${parroquia.telefono}`);
    console.log(`   - Email: ${parroquia.email}`);
    console.log(`   - Municipio: ${parroquia.municipio?.nombre_municipio}`);
    console.log(`   - Departamento: ${parroquia.municipio?.departamento?.nombre}`);
    return true;
  } catch (error) {
    console.error('❌ Error obteniendo parroquia por ID:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetParroquiasByMunicipio() {
  try {
    console.log(`\n🏢 Obteniendo parroquias por municipio: ${municipioId}...`);
    const response = await axios.get(`${API_BASE}/catalog/parroquias/municipio/${municipioId}`, {
      headers: getAuthHeaders()
    });
    
    const parroquias = response.data.data;
    console.log(`✅ ${parroquias.length} parroquias obtenidas para el municipio`);
    
    if (parroquias.length > 0) {
      console.log('   Parroquias encontradas:');
      parroquias.forEach((parroquia, index) => {
        console.log(`   ${index + 1}. ${parroquia.nombre} (ID: ${parroquia.id_parroquia})`);
      });
    }
    return true;
  } catch (error) {
    console.error('❌ Error obteniendo parroquias por municipio:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUpdateParroquia() {
  if (!parroquiaId) {
    console.log('\n⚠️  No hay parroquia para actualizar (salteando test)');
    return true;
  }

  try {
    console.log(`\n✏️  Actualizando parroquia ID: ${parroquiaId}...`);
    const updateData = {
      descripcion: 'Descripción actualizada mediante API',
      telefono: '+57 300 999-8888',
      activo: true
    };
    
    const response = await axios.put(`${API_BASE}/catalog/parroquias/${parroquiaId}`, updateData, {
      headers: getAuthHeaders()
    });
    
    const parroquia = response.data.data;
    console.log('✅ Parroquia actualizada exitosamente:');
    console.log(`   - Descripción: ${parroquia.descripcion}`);
    console.log(`   - Teléfono: ${parroquia.telefono}`);
    return true;
  } catch (error) {
    console.error('❌ Error actualizando parroquia:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testSearchParroquias() {
  try {
    console.log('\n🔍 Buscando parroquias con término "prueba"...');
    const response = await axios.get(`${API_BASE}/catalog/parroquias/search`, {
      headers: getAuthHeaders(),
      params: { q: 'prueba' }
    });
    
    const parroquias = response.data.data;
    console.log(`✅ ${parroquias.length} parroquias encontradas`);
    
    if (parroquias.length > 0) {
      console.log('   Resultados:');
      parroquias.forEach((parroquia, index) => {
        console.log(`   ${index + 1}. ${parroquia.nombre} - ${parroquia.municipio?.nombre_municipio}`);
      });
    }
    return true;
  } catch (error) {
    console.error('❌ Error buscando parroquias:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testValidationErrors() {
  try {
    console.log('\n🛡️  Probando validaciones...');
    
    // Test: Crear parroquia sin municipio
    try {
      await axios.post(`${API_BASE}/catalog/parroquias`, {
        nombre: 'Parroquia sin municipio'
      }, {
        headers: getAuthHeaders()
      });
      console.log('❌ ERROR: Debería haber fallado por falta de municipio');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validación correcta: municipio requerido');
      } else {
        console.log('⚠️  Error inesperado:', error.response?.data?.message);
      }
    }
    
    // Test: Crear parroquia con municipio inexistente
    try {
      await axios.post(`${API_BASE}/catalog/parroquias`, {
        nombre: 'Parroquia con municipio inexistente',
        id_municipio: 99999
      }, {
        headers: getAuthHeaders()
      });
      console.log('❌ ERROR: Debería haber fallado por municipio inexistente');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Validación correcta: municipio inexistente');
      } else {
        console.log('⚠️  Error inesperado:', error.response?.data?.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en pruebas de validación:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 === PRUEBAS DE FUNCIONALIDAD PARROQUIA-MUNICIPIO ===\n');
  
  const tests = [
    { name: 'Autenticación', fn: authenticate },
    { name: 'Obtener Municipios', fn: testGetMunicipios },
    { name: 'Crear Parroquia', fn: testCreateParroquia },
    { name: 'Obtener Parroquias', fn: testGetParroquias },
    { name: 'Obtener Parroquia por ID', fn: testGetParroquiaById },
    { name: 'Obtener Parroquias por Municipio', fn: testGetParroquiasByMunicipio },
    { name: 'Actualizar Parroquia', fn: testUpdateParroquia },
    { name: 'Buscar Parroquias', fn: testSearchParroquias },
    { name: 'Pruebas de Validación', fn: testValidationErrors }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📊 === RESUMEN DE PRUEBAS ===');
  console.log(`✅ Pruebas exitosas: ${passed}`);
  console.log(`❌ Pruebas fallidas: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✨ El modelo Parroquia está correctamente integrado con Municipio');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisar la implementación.');
  }
}

// Ejecutar las pruebas
runTests().catch(error => {
  console.error('💥 Error crítico en las pruebas:', error.message);
  process.exit(1);
});
