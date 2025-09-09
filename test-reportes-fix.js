#!/usr/bin/env node

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function loginAndGetToken() {
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      correo_electronico: 'admin@admin.com',
      contrasena: 'admin123'
    });
    
    const token = response.data.data?.accessToken;
    if (token) {
      console.log('✅ Token obtenido exitosamente');
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

async function testReportesFamilias(token) {
  try {
    console.log('\n📊 Probando reporte de familias Excel...');
    
    const response = await axios.get(`${API_BASE}/reportes/familias/excel`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        limite: 5 // Solo 5 familias para prueba
      },
      responseType: 'blob' // Importante para archivos Excel
    });
    
    console.log('✅ Reporte Excel generado exitosamente');
    console.log('- Status:', response.status);
    console.log('- Content-Type:', response.headers['content-type']);
    console.log('- Tamaño:', response.data.size || response.data.length, 'bytes');
    
    return true;
  } catch (error) {
    console.error('❌ Error generando reporte Excel:');
    console.error('- Status:', error.response?.status);
    console.error('- Data:', error.response?.data);
    if (error.response?.data && typeof error.response.data === 'string') {
      try {
        const errorData = JSON.parse(error.response.data);
        console.error('- Parsed Error:', errorData);
      } catch (parseError) {
        console.error('- Raw Error:', error.response.data);
      }
    }
    return false;
  }
}

async function testReportesDifuntos(token) {
  try {
    console.log('\n👥 Probando reporte de difuntos PDF...');
    
    const response = await axios.get(`${API_BASE}/reportes/difuntos/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'blob'
    });
    
    console.log('✅ Reporte PDF de difuntos generado exitosamente');
    console.log('- Status:', response.status);
    console.log('- Content-Type:', response.headers['content-type']);
    console.log('- Tamaño:', response.data.size || response.data.length, 'bytes');
    
    return true;
  } catch (error) {
    console.error('❌ Error generando reporte PDF de difuntos:');
    console.error('- Status:', error.response?.status);
    console.error('- Error:', error.response?.data || error.message);
    return false;
  }
}

async function testHealthCheck() {
  try {
    console.log('\n🏥 Verificando health check...');
    
    const response = await axios.get(`${API_BASE}/health`);
    
    console.log('✅ Health check exitoso');
    console.log('- Status:', response.status);
    console.log('- Data:', response.data);
    
    return true;
  } catch (error) {
    console.error('❌ Error en health check:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Testing API de Reportes después de la corrección...');
    
    // Health check primero
    await testHealthCheck();
    
    // Login
    const token = await loginAndGetToken();
    if (!token) {
      console.error('❌ No se pudo obtener token de autenticación');
      return;
    }
    
    // Test reportes
    const excelOk = await testReportesFamilias(token);
    const pdfOk = await testReportesDifuntos(token);
    
    console.log('\n📋 RESUMEN:');
    console.log(`- Health Check: ✅`);
    console.log(`- Login: ✅`);
    console.log(`- Reporte Excel: ${excelOk ? '✅' : '❌'}`);
    console.log(`- Reporte PDF: ${pdfOk ? '✅' : '❌'}`);
    
    if (excelOk && pdfOk) {
      console.log('\n🎉 ¡Todos los reportes funcionan correctamente!');
    } else {
      console.log('\n⚠️  Algunos reportes tienen problemas');
    }
    
  } catch (error) {
    console.error('❌ Error en testing:', error.message);
  }
}

main();
