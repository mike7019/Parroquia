#!/usr/bin/env node

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function loginAndGetToken() {
  try {
    console.log('🔐 Intentando hacer login...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      correo_electronico: 'admin@admin.com',
      contrasena: 'admin123'
    });
    
    const token = response.data.data?.accessToken || response.data.datos?.token || response.data.data?.token || response.data.token;
    if (token) {
      console.log('✅ Login exitoso, token obtenido');
      return token;
    } else {
      console.error('❌ No se encontró token en la respuesta');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return null;
  }
}

async function testVeredaCreation(token) {
  try {
    console.log('\n🌾 Probando creación de vereda...');
    
    const veredaData = {
      nombre: 'Vereda Test API',
      codigo_vereda: 'API001',
      id_municipio: null
    };
    
    const response = await axios.post(`${API_BASE}/catalog/veredas`, veredaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Vereda creada exitosamente:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data.datos?.vereda || response.data.data?.vereda;
  } catch (error) {
    console.error('❌ Error creando vereda:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    return null;
  }
}

async function testVeredaList(token) {
  try {
    console.log('\n📋 Obteniendo lista de veredas...');
    
    const response = await axios.get(`${API_BASE}/catalog/veredas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Lista de veredas:');
    const veredas = response.data.datos || response.data.data || [];
    console.log(`Total: ${Array.isArray(veredas) ? veredas.length : 'N/A'}`);
    
    if (Array.isArray(veredas) && veredas.length > 0) {
      console.log('Últimas 3 veredas:');
      veredas.slice(-3).forEach(vereda => {
        console.log(`  - ID: ${vereda.id_vereda}, Nombre: ${vereda.nombre}, Código: ${vereda.codigo_vereda}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo veredas:', error.response?.data || error.message);
  }
}

async function cleanupTestVereda(token, veredaId) {
  try {
    if (!veredaId) return;
    
    console.log('\n🧹 Limpiando vereda de prueba...');
    
    await axios.delete(`${API_BASE}/catalog/veredas/${veredaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Vereda de prueba eliminada');
  } catch (error) {
    console.log('⚠️  No se pudo eliminar la vereda de prueba:', error.response?.data?.error || error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Testing API de Veredas...');
    
    const token = await loginAndGetToken();
    if (!token) {
      console.error('❌ No se pudo obtener token de autenticación');
      return;
    }
    
    await testVeredaList(token);
    const createdVereda = await testVeredaCreation(token);
    await testVeredaList(token);
    
    if (createdVereda) {
      await cleanupTestVereda(token, createdVereda.id_vereda);
    }
    
    console.log('\n✅ Testing completado');
    
  } catch (error) {
    console.error('❌ Error en testing:', error.message);
  }
}

main();
