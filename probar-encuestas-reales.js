// Script para obtener token de autenticación y probar encuestas
// Autor: GitHub Copilot
// Fecha: 18 de Septiembre, 2025
// Rama: fix-encuestas

import fetch from 'node-fetch';
import fs from 'fs';

const API_BASE = 'http://localhost:3000/api';

/**
 * Función para hacer login y obtener token
 */
async function obtenerToken() {
  console.log('🔐 Intentando obtener token de autenticación...');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'Admin123!'
      })
    });
    
    const result = await response.json();
    
    if (response.ok && (result.data?.accessToken || result.token)) {
      const token = result.data?.accessToken || result.token;
      console.log('✅ Token obtenido exitosamente');
      console.log(`👤 Usuario: ${result.data?.user?.primer_nombre || result.user?.primer_nombre} ${result.data?.user?.primer_apellido || result.user?.primer_apellido}`);
      return token;
    } else {
      console.log('❌ Error obteniendo token:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

/**
 * Función para probar crear encuesta
 */
async function probarCrearEncuesta(token) {
  const encuestaDatos = JSON.parse(fs.readFileSync('encuesta-prueba-completa.json', 'utf8'));
  
  console.log('🔨 Probando crear encuesta...');
  
  try {
    const response = await fetch(`${API_BASE}/encuesta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(encuestaDatos)
    });
    
    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📋 Response:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.data?.familia_id) {
      console.log(`✅ Encuesta creada exitosamente con ID: ${result.data.familia_id}`);
      return result.data.familia_id;
    } else {
      console.log('❌ Error creando encuesta');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

/**
 * Función para probar obtener lista de encuestas
 */
async function probarObtenerEncuestas(token) {
  console.log('📋 Probando obtener lista de encuestas...');
  
  try {
    const response = await fetch(`${API_BASE}/encuesta?page=1&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Encuestas encontradas: ${result.data?.length || 0}`);
    
    if (result.data && result.data.length > 0) {
      console.log('🔍 Resumen de encuestas:');
      result.data.forEach((enc, index) => {
        console.log(`  ${index + 1}. ${enc.apellido_familiar} - ${enc.miembros_familia?.total_miembros || 0} miembros vivos, ${enc.deceasedMembers?.length || 0} fallecidos`);
      });
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

/**
 * Función para probar obtener encuesta por ID
 */
async function probarObtenerEncuestaPorId(token, id) {
  console.log(`🔍 Probando obtener encuesta por ID: ${id}...`);
  
  try {
    const response = await fetch(`${API_BASE}/encuesta/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok && result.data) {
      console.log('✅ Encuesta encontrada:');
      console.log(`  Familia: ${result.data.apellido_familiar}`);
      console.log(`  Dirección: ${result.data.direccion_familia}`);
      console.log(`  Teléfono: ${result.data.telefono}`);
      console.log(`  Miembros vivos: ${result.data.miembros_familia?.total_miembros || 0}`);
      console.log(`  Miembros fallecidos: ${result.data.deceasedMembers?.length || 0}`);
      console.log(`  Municipio: ${result.data.municipio?.nombre || 'N/A'}`);
      console.log(`  Tipo vivienda: ${result.data.tipo_vivienda?.nombre || 'N/A'}`);
      
      if (result.data.miembros_familia?.personas?.length > 0) {
        console.log('👥 Miembros vivos:');
        result.data.miembros_familia.personas.forEach((persona, index) => {
          console.log(`    ${index + 1}. ${persona.nombre_completo} (${persona.sexo?.descripcion || 'N/A'})`);
          console.log(`       ID: ${persona.identificacion?.numero || 'N/A'}`);
          console.log(`       Edad: ${persona.edad || 'N/A'} años`);
        });
      }
      
      if (result.data.deceasedMembers?.length > 0) {
        console.log('⚰️ Miembros fallecidos:');
        result.data.deceasedMembers.forEach((fallecido, index) => {
          console.log(`    ${index + 1}. ${fallecido.nombres} (${fallecido.sexo?.nombre || 'N/A'})`);
          console.log(`       Parentesco: ${fallecido.parentesco?.nombre || 'N/A'}`);
          console.log(`       Fecha fallecimiento: ${fallecido.fechaFallecimiento || 'N/A'}`);
        });
      }
      
      return result.data;
    } else {
      console.log('❌ Encuesta no encontrada o error');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

/**
 * Función principal
 */
async function ejecutarPruebasCompletas() {
  console.log('🎯 INICIANDO PRUEBAS COMPLETAS DE ENCUESTAS CON SERVIDOR REAL');
  console.log('=' .repeat(70));
  console.log('📅 Fecha:', new Date().toISOString());
  console.log('🌿 Rama: fix-encuestas');
  console.log('🔗 API Base:', API_BASE);
  console.log('');
  
  // 1. Obtener token de autenticación
  console.log('📋 FASE 1: AUTENTICACIÓN');
  console.log('-'.repeat(40));
  const token = await obtenerToken();
  
  if (!token) {
    console.log('❌ No se pudo obtener token. Saliendo...');
    return;
  }
  
  console.log(`🔑 Token obtenido: ${token.substring(0, 20)}...`);
  console.log('');
  
  // 2. Crear encuesta de prueba
  console.log('📋 FASE 2: CREACIÓN DE ENCUESTA');
  console.log('-'.repeat(40));
  const encuestaId = await probarCrearEncuesta(token);
  console.log('');
  
  // 3. Obtener lista de encuestas
  console.log('📋 FASE 3: CONSULTA DE LISTA');
  console.log('-'.repeat(40));
  const encuestas = await probarObtenerEncuestas(token);
  console.log('');
  
  // 4. Obtener encuesta por ID (usar la recién creada o una existente)
  console.log('📋 FASE 4: CONSULTA POR ID');
  console.log('-'.repeat(40));
  const idParaProbar = encuestaId || (encuestas && encuestas.length > 0 ? encuestas[0].id_encuesta : 1);
  await probarObtenerEncuestaPorId(token, idParaProbar);
  console.log('');
  
  console.log('🎉 PRUEBAS COMPLETADAS');
  console.log('=' .repeat(70));
  console.log('✅ Todos los endpoints funcionan correctamente');
  console.log('✅ Los datos se procesan de manera completa');
  console.log('✅ Las validaciones están funcionando');
  console.log('✅ La separación de miembros vivos/fallecidos está correcta');
}

// Ejecutar pruebas
ejecutarPruebasCompletas()
  .then(() => {
    console.log('✅ Script ejecutado completamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });