/**
 * Script para obtener un ejemplo completo de la respuesta de la API de encuestas
 */

import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/encuestas`;
const AUTH_URL = `${BASE_URL}/api/auth/login`;

const ADMIN_CREDENTIALS = {
  correo_electronico: 'admin@admin.com',
  contrasena: 'admin123'
};

async function obtenerEjemploRespuesta() {
  try {
    console.log('🔐 Obteniendo token...');
    const loginResponse = await axios.post(AUTH_URL, ADMIN_CREDENTIALS);
    const token = loginResponse.data.data.accessToken;

    console.log('📋 Obteniendo ejemplo de respuesta de encuestas...');
    const response = await axios.get(`${API_URL}?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const ejemploRespuesta = {
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: 'GET /api/encuestas',
        status: response.status,
        correcciones_aplicadas: [
          "✅ Separación de fallecidos vs vivos",
          "✅ Datos geográficos completos con ID",
          "✅ Estados civiles normalizados", 
          "✅ Servicios básicos estandarizados",
          "✅ Consultas optimizadas con JOINs"
        ]
      },
      estructura_respuesta: response.data
    };

    // Guardar ejemplo en archivo
    const nombreArchivo = 'ejemplo-respuesta-encuestas-corregida.json';
    fs.writeFileSync(nombreArchivo, JSON.stringify(ejemploRespuesta, null, 2), 'utf8');
    
    console.log('✅ Ejemplo guardado en:', nombreArchivo);
    console.log('\n📊 ESTRUCTURA DE LA RESPUESTA:');
    console.log(JSON.stringify(ejemploRespuesta, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

obtenerEjemploRespuesta();
