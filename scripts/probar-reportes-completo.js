#!/usr/bin/env node

/**
 * Script de pruebas completas para el sistema de reportes
 * Prueba todos los endpoints disponibles
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}🧪 INICIANDO PRUEBAS DEL SISTEMA DE REPORTES${colors.reset}\n`);

// Variables para estadísticas
let totalPruebas = 0;
let pruebasExitosas = 0;
let pruebasFallidas = 0;
let token = null;

/**
 * Función helper para hacer peticiones HTTP
 */
async function hacerPeticion(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('application/vnd.openxmlformats') || 
               contentType?.includes('application/pdf')) {
      data = await response.buffer();
    } else {
      data = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
      success: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      error: error.message,
      success: false
    };
  }
}

/**
 * Función para registrar resultados de pruebas
 */
function registrarPrueba(nombre, exito, detalles = '') {
  totalPruebas++;
  if (exito) {
    pruebasExitosas++;
    console.log(`${colors.green}✅ ${nombre}${colors.reset} ${detalles}`);
  } else {
    pruebasFallidas++;
    console.log(`${colors.red}❌ ${nombre}${colors.reset} ${detalles}`);
  }
}

/**
 * Función para autenticarse y obtener token
 */
async function autenticar() {
  console.log(`${colors.blue}🔑 AUTENTICACIÓN${colors.reset}`);
  
  const loginData = {
    correo_electronico: 'admin@parroquia.com',
    contrasena: 'Admin123!'
  };

  const response = await hacerPeticion(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(loginData)
  });

  if (response.success && response.data.status === 'success' && response.data.data && response.data.data.accessToken) {
    token = response.data.data.accessToken;
    registrarPrueba('Login de usuario', true, `Token obtenido: ${token.substring(0, 20)}...`);
    return true;
  } else {
    registrarPrueba('Login de usuario', false, `Error: ${response.data?.message || response.statusText}`);
    return false;
  }
}

/**
 * Probar endpoint de información del sistema
 */
async function probarInfoSistema() {
  console.log(`\n${colors.blue}📋 INFORMACIÓN DEL SISTEMA${colors.reset}`);
  
  const response = await hacerPeticion(`${API_BASE}/reportes/info`);
  
  if (response.success) {
    registrarPrueba('GET /api/reportes/info', true, `Versión: ${response.data.datos?.version || 'N/A'}`);
    
    // Verificar estructura de respuesta
    const datos = response.data.datos;
    if (datos && datos.version && datos.tiposDisponibles && datos.configuracion) {
      registrarPrueba('Estructura de respuesta válida', true, 'Todos los campos presentes');
    } else {
      registrarPrueba('Estructura de respuesta válida', false, 'Campos faltantes en respuesta');
    }
  } else {
    registrarPrueba('GET /api/reportes/info', false, `Error: ${response.statusText}`);
  }
}

/**
 * Probar reportes de prueba (sin autenticación)
 */
async function probarReportesPrueba() {
  console.log(`\n${colors.blue}🧪 REPORTES DE PRUEBA${colors.reset}`);
  
  if (!token) {
    console.log(`${colors.yellow}⚠️  Saltando pruebas que requieren autenticación${colors.reset}`);
    return;
  }

  // Probar Excel de prueba
  const excelResponse = await hacerPeticion(`${API_BASE}/reportes/test/excel`);
  
  if (excelResponse.success) {
    registrarPrueba('GET /api/reportes/test/excel', true, `Tamaño: ${excelResponse.data.length} bytes`);
    
    // Guardar archivo de prueba
    try {
      const excelPath = path.join(process.cwd(), 'test_reports', 'prueba.xlsx');
      fs.mkdirSync(path.dirname(excelPath), { recursive: true });
      fs.writeFileSync(excelPath, excelResponse.data);
      registrarPrueba('Guardado de archivo Excel', true, `Guardado en: ${excelPath}`);
    } catch (error) {
      registrarPrueba('Guardado de archivo Excel', false, `Error: ${error.message}`);
    }
  } else {
    registrarPrueba('GET /api/reportes/test/excel', false, `Error: ${excelResponse.statusText}`);
  }

  // Probar PDF de prueba
  const pdfResponse = await hacerPeticion(`${API_BASE}/reportes/test/pdf`);
  
  if (pdfResponse.success) {
    registrarPrueba('GET /api/reportes/test/pdf', true, `Tamaño: ${pdfResponse.data.length} bytes`);
    
    // Guardar archivo de prueba
    try {
      const pdfPath = path.join(process.cwd(), 'test_reports', 'prueba.pdf');
      fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
      fs.writeFileSync(pdfPath, pdfResponse.data);
      registrarPrueba('Guardado de archivo PDF', true, `Guardado en: ${pdfPath}`);
    } catch (error) {
      registrarPrueba('Guardado de archivo PDF', false, `Error: ${error.message}`);
    }
  } else {
    registrarPrueba('GET /api/reportes/test/pdf', false, `Error: ${pdfResponse.statusText}`);
  }
}

/**
 * Probar reportes de familias
 */
async function probarReportesFamilias() {
  console.log(`\n${colors.blue}👨‍👩‍👧‍👦 REPORTES DE FAMILIAS${colors.reset}`);
  
  if (!token) {
    console.log(`${colors.yellow}⚠️  Saltando pruebas que requieren autenticación${colors.reset}`);
    return;
  }

  // Datos de prueba para el reporte
  const datosReporte = {
    tipo: 'familias',
    filtros: {
      municipio_id: null,
      departamento_id: null,
      sector: null,
      fecha_inicio: null,
      fecha_fin: null
    }
  };

  const response = await hacerPeticion(`${API_BASE}/reportes/excel/familias`, {
    method: 'POST',
    body: JSON.stringify(datosReporte)
  });

  if (response.success) {
    registrarPrueba('POST /api/reportes/excel/familias', true, `Tamaño: ${response.data.length} bytes`);
    
    // Verificar headers de respuesta
    const headers = response.headers;
    if (headers['content-type']?.includes('spreadsheetml.sheet')) {
      registrarPrueba('Content-Type correcto', true, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else {
      registrarPrueba('Content-Type correcto', false, `Recibido: ${headers['content-type']}`);
    }

    // Guardar archivo
    try {
      const filePath = path.join(process.cwd(), 'test_reports', 'familias.xlsx');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, response.data);
      registrarPrueba('Guardado de reporte familias', true, `Guardado en: ${filePath}`);
    } catch (error) {
      registrarPrueba('Guardado de reporte familias', false, `Error: ${error.message}`);
    }
  } else {
    registrarPrueba('POST /api/reportes/excel/familias', false, `Error: ${response.statusText}`);
  }
}

/**
 * Probar reportes de difuntos
 */
async function probarReportesDifuntos() {
  console.log(`\n${colors.blue}🕊️ REPORTES DE DIFUNTOS${colors.reset}`);
  
  if (!token) {
    console.log(`${colors.yellow}⚠️  Saltando pruebas que requieren autenticación${colors.reset}`);
    return;
  }

  // Datos de prueba para el reporte
  const datosReporte = {
    tipo: 'difuntos',
    filtros: {
      municipio_id: null,
      departamento_id: null,
      sector: null,
      fecha_inicio: null,
      fecha_fin: null
    }
  };

  const response = await hacerPeticion(`${API_BASE}/reportes/pdf/difuntos`, {
    method: 'POST',
    body: JSON.stringify(datosReporte)
  });

  if (response.success) {
    registrarPrueba('POST /api/reportes/pdf/difuntos', true, `Tamaño: ${response.data.length} bytes`);
    
    // Verificar headers de respuesta
    const headers = response.headers;
    if (headers['content-type']?.includes('application/pdf')) {
      registrarPrueba('Content-Type PDF correcto', true, 'application/pdf');
    } else {
      registrarPrueba('Content-Type PDF correcto', false, `Recibido: ${headers['content-type']}`);
    }

    // Guardar archivo
    try {
      const filePath = path.join(process.cwd(), 'test_reports', 'difuntos.pdf');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, response.data);
      registrarPrueba('Guardado de reporte difuntos', true, `Guardado en: ${filePath}`);
    } catch (error) {
      registrarPrueba('Guardado de reporte difuntos', false, `Error: ${error.message}`);
    }
  } else {
    registrarPrueba('POST /api/reportes/pdf/difuntos', false, `Error: ${response.statusText}`);
  }
}

/**
 * Probar casos de error
 */
async function probarCasosError() {
  console.log(`\n${colors.blue}⚠️ CASOS DE ERROR${colors.reset}`);
  
  // Probar endpoint protegido sin token
  const tokenOriginal = token;
  token = null; // Sin token
  
  const sinTokenResponse = await hacerPeticion(`${API_BASE}/reportes/test/excel`);
  
  if (sinTokenResponse.status === 401) {
    registrarPrueba('Protección sin token', true, 'Retorna 401 Unauthorized');
  } else {
    registrarPrueba('Protección sin token', false, `Retorna: ${sinTokenResponse.status}`);
  }

  // Probar con token inválido
  token = 'token_invalido';
  
  const tokenInvalidoResponse = await hacerPeticion(`${API_BASE}/reportes/test/excel`);
  
  if (tokenInvalidoResponse.status === 401) {
    registrarPrueba('Protección con token inválido', true, 'Retorna 401 Unauthorized');
  } else {
    registrarPrueba('Protección con token inválido', false, `Retorna: ${tokenInvalidoResponse.status}`);
  }
  
  // Restaurar token original
  token = tokenOriginal;

  // Probar endpoint inexistente
  const noExisteResponse = await hacerPeticion(`${API_BASE}/reportes/no-existe`);
  
  if (noExisteResponse.status === 404) {
    registrarPrueba('Endpoint inexistente', true, 'Retorna 404 Not Found');
  } else {
    registrarPrueba('Endpoint inexistente', false, `Retorna: ${noExisteResponse.status}`);
  }
}

/**
 * Probar documentación Swagger
 */
async function probarDocumentacion() {
  console.log(`\n${colors.blue}📖 DOCUMENTACIÓN SWAGGER${colors.reset}`);
  
  // Probar con redirect (agregar barra final)
  const response = await hacerPeticion(`${BASE_URL}/api-docs/`);
  
  if (response.success) {
    registrarPrueba('GET /api-docs', true, 'Documentación accesible');
    
    // Verificar que contiene información de reportes
    const html = response.data.toString();
    if (html.includes('Reportes') || html.includes('reportes') || html.includes('"Reportes"')) {
      registrarPrueba('Documentación de reportes', true, 'Sección de reportes encontrada');
    } else {
      registrarPrueba('Documentación de reportes', false, 'Sección de reportes no encontrada');
    }
  } else {
    registrarPrueba('GET /api-docs', false, `Error: ${response.statusText}`);
  }
}

/**
 * Mostrar resumen final
 */
function mostrarResumen() {
  console.log(`\n${colors.bold}📊 RESUMEN DE PRUEBAS${colors.reset}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const porcentajeExito = totalPruebas > 0 ? Math.round((pruebasExitosas / totalPruebas) * 100) : 0;
  
  console.log(`${colors.bold}Total de pruebas:${colors.reset} ${totalPruebas}`);
  console.log(`${colors.green}Exitosas:${colors.reset} ${pruebasExitosas}`);
  console.log(`${colors.red}Fallidas:${colors.reset} ${pruebasFallidas}`);
  console.log(`${colors.blue}Porcentaje de éxito:${colors.reset} ${porcentajeExito}%`);
  
  if (porcentajeExito >= 90) {
    console.log(`\n${colors.green}🎉 ¡EXCELENTE! Sistema de reportes funcionando correctamente${colors.reset}`);
  } else if (porcentajeExito >= 70) {
    console.log(`\n${colors.yellow}⚠️  BUENO - Algunas pruebas fallaron, revisar errores${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ CRÍTICO - Múltiples fallas, sistema necesita revisión${colors.reset}`);
  }
  
  console.log('\n📁 Archivos de prueba guardados en: ./test_reports/');
  console.log(`📖 Documentación: ${BASE_URL}/api-docs`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * Función principal que ejecuta todas las pruebas
 */
async function ejecutarPruebas() {
  try {
    // Verificar que el servidor está corriendo
    console.log(`${colors.blue}🔍 Verificando servidor en ${BASE_URL}...${colors.reset}`);
    const healthResponse = await hacerPeticion(`${API_BASE}/health`);
    
    if (!healthResponse.success) {
      console.log(`${colors.red}❌ Servidor no responde en ${BASE_URL}${colors.reset}`);
      console.log(`${colors.yellow}💡 Asegúrate de que el servidor esté corriendo: npm run dev${colors.reset}`);
      return;
    }
    
    registrarPrueba('Servidor disponible', true, `Respondiendo en ${BASE_URL}`);

    // Ejecutar todas las pruebas
    await autenticar();
    await probarInfoSistema();
    await probarReportesPrueba();
    await probarReportesFamilias();
    await probarReportesDifuntos();
    await probarCasosError();
    await probarDocumentacion();
    
    // Mostrar resumen
    mostrarResumen();

  } catch (error) {
    console.error(`${colors.red}❌ Error fatal ejecutando pruebas:${colors.reset}`, error);
  }
}

// Ejecutar pruebas
ejecutarPruebas().catch(console.error);
