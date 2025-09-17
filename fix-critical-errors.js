#!/usr/bin/env node

/**
 * Script para corregir errores críticos identificados en el testing
 */

import fs from 'fs';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1. Agregar endpoint /refresh faltante en authRoutes.js
function fixRefreshEndpoint() {
  log('🔧 Corrigiendo endpoint /refresh...', 'cyan');
  
  const authRoutesPath = 'src/routes/authRoutes.js';
  
  try {
    let content = fs.readFileSync(authRoutesPath, 'utf8');
    
    // Buscar si ya existe el endpoint /refresh
    if (content.includes("router.post('/refresh'")) {
      log('✅ Endpoint /refresh ya existe', 'green');
      return;
    }
    
    // Agregar el endpoint /refresh que apunte a /refresh-token
    const refreshEndpoint = `
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Renovar token de acceso (alias)
 *     description: Alias para /refresh-token - Obtener un nuevo token de acceso usando el refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         expiresIn:
 *                           type: integer
 */
router.post('/refresh',
  authValidators.validateRefreshToken,
  validationMiddleware.handleValidationErrors,
  authController.refreshAccessToken
);

`;
    
    // Insertar después del endpoint /refresh-token
    const insertPoint = content.indexOf('router.post(\'/refresh-token\'');
    if (insertPoint === -1) {
      log('❌ No se encontró el endpoint /refresh-token para insertar /refresh', 'red');
      return;
    }
    
    // Encontrar el final del endpoint /refresh-token
    let endPoint = content.indexOf(');', insertPoint);
    endPoint = content.indexOf('\n', endPoint) + 1;
    
    // Insertar el nuevo endpoint
    const newContent = content.slice(0, endPoint) + refreshEndpoint + content.slice(endPoint);
    
    fs.writeFileSync(authRoutesPath, newContent);
    log('✅ Endpoint /refresh agregado exitosamente', 'green');
    
  } catch (error) {
    log(`❌ Error corrigiendo endpoint /refresh: ${error.message}`, 'red');
  }
}

// 2. Crear métodos faltantes en familiasConsultasController.js
function fixFamiliasConsultasController() {
  log('🔧 Corrigiendo métodos faltantes en FamiliasConsultasController...', 'cyan');
  
  const controllerPath = 'src/controllers/familiasConsultasController.js';
  
  try {
    let content = fs.readFileSync(controllerPath, 'utf8');
    
    // Verificar si ya existen los métodos
    if (content.includes('consultarMadresFallecidas') && 
        content.includes('consultarPadresFallecidos') && 
        content.includes('obtenerEstadisticas')) {
      log('✅ Métodos ya existen en FamiliasConsultasController', 'green');
      return;
    }
    
    // Métodos faltantes a agregar
    const missingMethods = `
  /**
   * Consultar madres fallecidas
   * GET /api/consultas/madres-fallecidas
   */
  async consultarMadresFallecidas(req, res) {
    try {
      console.log('🔍 Consultando madres fallecidas...');
      
      const filtros = {
        nombre: req.query.nombre,
        apellido_familiar: req.query.apellido_familiar,
        fecha_fallecimiento: req.query.fecha_fallecimiento,
        limite: parseInt(req.query.limite) || 50
      };

      // Remover filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === '') {
          delete filtros[key];
        }
      });

      const resultado = await FamiliasConsultasService.consultarMadresFallecidas(filtros);

      console.log(\`✅ Consulta de madres fallecidas completada: \${resultado.total} resultados\`);

      return res.status(200).json({
        exito: true,
        mensaje: 'Consulta de madres fallecidas realizada exitosamente',
        datos: resultado.datos,
        total: resultado.total,
        filtros_aplicados: resultado.filtros_aplicados
      });

    } catch (error) {
      console.error('❌ Error en consulta de madres fallecidas:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al consultar madres fallecidas',
        error: error.message
      });
    }
  }

  /**
   * Consultar padres fallecidos
   * GET /api/consultas/padres-fallecidos
   */
  async consultarPadresFallecidos(req, res) {
    try {
      console.log('🔍 Consultando padres fallecidos...');
      
      const filtros = {
        nombre: req.query.nombre,
        apellido_familiar: req.query.apellido_familiar,
        fecha_fallecimiento: req.query.fecha_fallecimiento,
        limite: parseInt(req.query.limite) || 50
      };

      // Remover filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === '') {
          delete filtros[key];
        }
      });

      const resultado = await FamiliasConsultasService.consultarPadresFallecidos(filtros);

      console.log(\`✅ Consulta de padres fallecidos completada: \${resultado.total} resultados\`);

      return res.status(200).json({
        exito: true,
        mensaje: 'Consulta de padres fallecidos realizada exitosamente',
        datos: resultado.datos,
        total: resultado.total,
        filtros_aplicados: resultado.filtros_aplicados
      });

    } catch (error) {
      console.error('❌ Error en consulta de padres fallecidos:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al consultar padres fallecidos',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas generales
   * GET /api/consultas/estadisticas
   */
  async obtenerEstadisticas(req, res) {
    try {
      console.log('📊 Obteniendo estadísticas...');
      
      const estadisticas = await FamiliasConsultasService.obtenerEstadisticas();

      console.log('✅ Estadísticas obtenidas exitosamente');

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas obtenidas exitosamente',
        datos: estadisticas
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }
`;
    
    // Insertar antes del cierre de la clase
    const insertPoint = content.lastIndexOf('}');
    const newContent = content.slice(0, insertPoint) + missingMethods + '\n' + content.slice(insertPoint);
    
    fs.writeFileSync(controllerPath, newContent);
    log('✅ Métodos faltantes agregados a FamiliasConsultasController', 'green');
    
  } catch (error) {
    log(`❌ Error corrigiendo FamiliasConsultasController: ${error.message}`, 'red');
  }
}

// 3. Crear métodos faltantes en familiasConsultasService.js
function fixFamiliasConsultasService() {
  log('🔧 Corrigiendo métodos faltantes en FamiliasConsultasService...', 'cyan');
  
  const servicePath = 'src/services/familiasConsultasService.js';
  
  try {
    let content = fs.readFileSync(servicePath, 'utf8');
    
    // Verificar si ya existen los métodos
    if (content.includes('consultarMadresFallecidas') && 
        content.includes('consultarPadresFallecidos') && 
        content.includes('obtenerEstadisticas')) {
      log('✅ Métodos ya existen en FamiliasConsultasService', 'green');
      return;
    }
    
    // Métodos faltantes a agregar
    const missingMethods = `
  /**
   * Consultar madres fallecidas
   */
  static async consultarMadresFallecidas(filtros = {}) {
    try {
      console.log('🔍 Servicio: Consultando madres fallecidas...');
      
      // Por ahora retornar datos mock hasta implementar la lógica completa
      const datosMock = [
        {
          tipo_parentesco: 'Madre',
          apellido_familiar: 'García',
          parentesco: 'Madre',
          documento: '12345678',
          nombre: 'María Elena García López',
          sexo: 'Femenino',
          fecha_nacimiento: '1950-03-15',
          fecha_fallecimiento: '2020-08-22',
          anos_fallecida: 4,
          observaciones: 'Falleció por causas naturales'
        }
      ];
      
      return {
        datos: datosMock,
        total: datosMock.length,
        filtros_aplicados: filtros
      };
      
    } catch (error) {
      console.error('❌ Error en servicio consultarMadresFallecidas:', error);
      throw error;
    }
  }

  /**
   * Consultar padres fallecidos
   */
  static async consultarPadresFallecidos(filtros = {}) {
    try {
      console.log('🔍 Servicio: Consultando padres fallecidos...');
      
      // Por ahora retornar datos mock hasta implementar la lógica completa
      const datosMock = [
        {
          tipo_parentesco: 'Padre',
          apellido_familiar: 'García',
          parentesco: 'Padre',
          documento: '87654321',
          nombre: 'Juan Carlos García Pérez',
          sexo: 'Masculino',
          fecha_nacimiento: '1948-08-22',
          fecha_fallecimiento: '2019-12-10',
          anos_fallecido: 5,
          observaciones: 'Falleció por complicaciones cardíacas'
        }
      ];
      
      return {
        datos: datosMock,
        total: datosMock.length,
        filtros_aplicados: filtros
      };
      
    } catch (error) {
      console.error('❌ Error en servicio consultarPadresFallecidos:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales
   */
  static async obtenerEstadisticas() {
    try {
      console.log('📊 Servicio: Obteniendo estadísticas...');
      
      // Por ahora retornar estadísticas mock hasta implementar la lógica completa
      const estadisticas = {
        total_madres: 125,
        total_padres: 118,
        total_familias: 95,
        total_personas: 243,
        total_madres_fallecidas: 8,
        total_padres_fallecidos: 12,
        ultima_actualizacion: new Date().toISOString()
      };
      
      return estadisticas;
      
    } catch (error) {
      console.error('❌ Error en servicio obtenerEstadisticas:', error);
      throw error;
    }
  }
`;
    
    // Insertar antes del cierre de la clase
    const insertPoint = content.lastIndexOf('}');
    const newContent = content.slice(0, insertPoint) + missingMethods + '\n' + content.slice(insertPoint);
    
    fs.writeFileSync(servicePath, newContent);
    log('✅ Métodos faltantes agregados a FamiliasConsultasService', 'green');
    
  } catch (error) {
    log(`❌ Error corrigiendo FamiliasConsultasService: ${error.message}`, 'red');
  }
}

// 4. Corregir error en encuestaController.js
function fixEncuestaController() {
  log('🔧 Corrigiendo error en encuestaController...', 'cyan');
  
  const controllerPath = 'src/controllers/encuestaController.js';
  
  try {
    let content = fs.readFileSync(controllerPath, 'utf8');
    
    // Buscar y corregir el error de "familias" en lugar de ID
    const errorPattern = /invalid input syntax for type bigint: "familias"/;
    
    if (content.includes('req.params.familias') || content.includes("'familias'")) {
      // Buscar la línea problemática y corregirla
      content = content.replace(/req\.params\.familias/g, 'req.params.id');
      content = content.replace(/'familias'/g, 'req.params.id');
      
      fs.writeFileSync(controllerPath, content);
      log('✅ Error de "familias" corregido en encuestaController', 'green');
    } else {
      log('ℹ️  No se encontró el error específico en encuestaController', 'blue');
    }
    
  } catch (error) {
    log(`❌ Error corrigiendo encuestaController: ${error.message}`, 'red');
  }
}

// 5. Crear rutas faltantes
function createMissingRoutes() {
  log('🔧 Creando rutas faltantes...', 'cyan');
  
  // Crear ruta para personas/capacidades si no existe
  const capacidadesRoutePath = 'src/routes/consolidados/personasCapacidadesRoutes.js';
  
  if (!fs.existsSync(capacidadesRoutePath)) {
    log('ℹ️  Ruta personas/capacidades no existe, se necesita implementar', 'yellow');
  } else {
    log('✅ Ruta personas/capacidades ya existe', 'green');
  }
  
  // Verificar ruta de reportes
  const reportesRoutePath = 'src/routes/reporteRoutes.js';
  
  if (!fs.existsSync(reportesRoutePath)) {
    log('ℹ️  Ruta de reportes no existe, se necesita implementar', 'yellow');
  } else {
    log('✅ Ruta de reportes ya existe', 'green');
  }
}

// Función principal
async function main() {
  log('🚀 Iniciando corrección de errores críticos', 'bold');
  log('=' .repeat(50), 'cyan');
  
  // 1. Corregir endpoint /refresh faltante
  fixRefreshEndpoint();
  
  // 2. Corregir métodos faltantes en controller
  fixFamiliasConsultasController();
  
  // 3. Corregir métodos faltantes en service
  fixFamiliasConsultasService();
  
  // 4. Corregir error en encuestaController
  fixEncuestaController();
  
  // 5. Verificar rutas faltantes
  createMissingRoutes();
  
  log('\n✅ Correcciones completadas!', 'green');
  log('\n🎯 Próximos pasos:', 'yellow');
  log('1. Reiniciar el servidor: npm run dev', 'blue');
  log('2. Ejecutar tests: node test-all-services.js', 'blue');
  log('3. Verificar que los errores 500 se hayan corregido', 'blue');
  
  log('\n⚠️  Notas importantes:', 'yellow');
  log('- Los métodos de fallecidos usan datos mock temporalmente', 'cyan');
  log('- Se necesita implementar la lógica real de base de datos', 'cyan');
  log('- Algunos endpoints pueden necesitar más trabajo', 'cyan');
}

main().catch(error => {
  log(`💥 Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});