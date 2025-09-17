#!/usr/bin/env node

/**
 * Script para debuggear la creación de sectores
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

async function getAuthToken() {
  const loginData = {
    correo_electronico: 'admin@parroquia.com',
    contrasena: 'Admin123!'
  };
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  });
  
  const result = await response.json();
  
  if (result.status === 'success' && result.data?.accessToken) {
    return result.data.accessToken;
  } else {
    throw new Error('No se pudo obtener token: ' + JSON.stringify(result));
  }
}

async function debugCreateSector() {
  console.log('🔍 Debuggeando creación de sectores...');
  
  const token = await getAuthToken();
  console.log('✅ Token obtenido');
  
  // Primero, verificar que hay municipios disponibles
  console.log('\n📍 Verificando municipios disponibles...');
  const municipiosResponse = await fetch(`${API_URL}/catalog/municipios`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const municipiosResult = await municipiosResponse.json();
  console.log('Municipios response:', JSON.stringify(municipiosResult, null, 2));
  
  if (municipiosResult.data && municipiosResult.data.length > 0) {
    const firstMunicipio = municipiosResult.data[0];
    console.log(`✅ Municipio disponible: ${firstMunicipio.nombre_municipio} (ID: ${firstMunicipio.id_municipio})`);
    
    // Intentar crear sector
    console.log('\n➕ Intentando crear sector...');
    
    const sectorData = {
      nombre: 'Sector Debug Test ' + Date.now(),
      id_municipio: parseInt(firstMunicipio.id_municipio) // Convertir a número
    };
    
    console.log('Datos a enviar:', JSON.stringify(sectorData, null, 2));
    
    const createResponse = await fetch(`${API_URL}/catalog/sectores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sectorData)
    });
    
    console.log(`Status: ${createResponse.status}`);
    console.log(`Status Text: ${createResponse.statusText}`);
    
    const createResult = await createResponse.text();
    console.log('Response body:', createResult);
    
    try {
      const jsonResult = JSON.parse(createResult);
      console.log('Parsed JSON:', JSON.stringify(jsonResult, null, 2));
    } catch (e) {
      console.log('No es JSON válido');
    }
    
  } else {
    console.log('❌ No hay municipios disponibles');
  }
}

debugCreateSector().catch(console.error);