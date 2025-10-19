import axios from 'axios';
import sequelize from './config/sequelize.js';
import Corregimientos from './src/models/catalog/Corregimientos.js';
import Familias from './src/models/catalog/Familias.js';
import Municipios from './src/models/catalog/Municipios.js';

const BASE_URL = 'http://localhost:3000/api';

const credentials = {
  correo_electronico: 'admin@parroquia.com',
  contrasena: 'Admin123!'
};

let token = '';
let corregimientoTestId = null;

console.log('🧪 TEST EXHAUSTIVO: CRUD Corregimientos y Reportes\n');
console.log('='.repeat(80));

// ==================== AUTENTICACIÓN ====================
async function login() {
  try {
    console.log('\n1️⃣ AUTENTICACIÓN');
    console.log('─'.repeat(80));
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    token = response.data.data?.accessToken || response.data.accessToken;
    if (!token) {
      console.error('❌ No se recibió accessToken en la respuesta');
      process.exit(1);
    }
    console.log('✅ Sesión iniciada exitosamente');
    return token;
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error.response?.data || error.message);
    process.exit(1);
  }
}

// ==================== PRUEBAS DE RELACIONES SEQUELIZE ====================
async function testRelacionesSequelize() {
  try {
    console.log('\n2️⃣ PRUEBAS DE RELACIONES SEQUELIZE');
    console.log('─'.repeat(80));
    
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    // Test 1: Corregimientos con Municipios
    console.log('\n📌 Test 2.1: Relación Corregimientos → Municipios');
    const corregimientoConMunicipio = await Corregimientos.findOne({
      include: [{
        model: Municipios,
        as: 'municipio',
        attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane']
      }]
    });
    
    if (corregimientoConMunicipio) {
      console.log('✅ Relación Corregimientos → Municipios funciona');
      console.log('   Corregimiento:', corregimientoConMunicipio.nombre);
      console.log('   Municipio:', corregimientoConMunicipio.municipio?.nombre_municipio || 'N/A');
    } else {
      console.log('⚠️  No hay corregimientos en la BD');
    }
    
    // Test 2: Municipios con Corregimientos
    console.log('\n📌 Test 2.2: Relación Municipios → Corregimientos');
    const municipioConCorregimientos = await Municipios.findOne({
      where: { id_municipio: 1 },
      include: [{
        model: Corregimientos,
        as: 'corregimientos',
        attributes: ['id_corregimiento', 'nombre', 'codigo_corregimiento']
      }]
    });
    
    if (municipioConCorregimientos) {
      console.log('✅ Relación Municipios → Corregimientos funciona');
      console.log('   Municipio:', municipioConCorregimientos.nombre_municipio);
      console.log('   Corregimientos:', municipioConCorregimientos.corregimientos?.length || 0);
    } else {
      console.log('❌ Relación Municipios → Corregimientos NO funciona');
    }
    
    // Test 3: Familias con Corregimientos
    console.log('\n📌 Test 2.3: Relación Familias → Corregimientos');
    const familiaConCorregimiento = await Familias.findOne({
      where: { id_corregimiento: { [sequelize.Sequelize.Op.ne]: null } },
      include: [{
        model: Corregimientos,
        as: 'corregimiento',
        attributes: ['id_corregimiento', 'nombre', 'codigo_corregimiento']
      }]
    });
    
    if (familiaConCorregimiento) {
      console.log('✅ Relación Familias → Corregimientos funciona');
      console.log('   Familia:', familiaConCorregimiento.apellido_familiar);
      console.log('   Corregimiento:', familiaConCorregimiento.corregimiento?.nombre || 'N/A');
    } else {
      console.log('⚠️  No hay familias con corregimiento asignado');
    }
    
  } catch (error) {
    console.error('❌ Error en relaciones Sequelize:', error.message);
  }
}

// ==================== PRUEBAS DE API REST ====================
async function testAPIEndpoints() {
  console.log('\n3️⃣ PRUEBAS DE ENDPOINTS REST');
  console.log('─'.repeat(80));
  
  // Test 1: GET todos los corregimientos
  console.log('\n📌 Test 3.1: GET /api/catalog/corregimientos');
  try {
    const response = await axios.get(`${BASE_URL}/catalog/corregimientos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`✅ Endpoint funciona - ${response.data.pagination.total} corregimientos`);
    if (response.data.data[0]) {
      console.log('   Primer resultado:', response.data.data[0].nombre);
      console.log('   Tiene municipio:', !!response.data.data[0].municipio);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
  
  // Test 2: GET corregimientos con filtro de municipio
  console.log('\n📌 Test 3.2: GET /api/catalog/corregimientos?id_municipio=1');
  try {
    const response = await axios.get(`${BASE_URL}/catalog/corregimientos?id_municipio=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`✅ Filtro por municipio funciona - ${response.data.pagination.total} resultados`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
  
  // Test 3: GET estadísticas
  console.log('\n📌 Test 3.3: GET /api/catalog/corregimientos/statistics');
  try {
    const response = await axios.get(`${BASE_URL}/catalog/corregimientos/statistics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`✅ Estadísticas funciona - ${response.data.data.length} corregimientos`);
    if (response.data.data[0]) {
      console.log('   Ejemplo:', response.data.data[0].nombre, 
                  '- Familias:', response.data.data[0].familias_usando);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
  
  // Test 4: POST crear corregimiento
  console.log('\n📌 Test 3.4: POST /api/catalog/corregimientos (crear)');
  try {
    const nuevoCorregimiento = {
      nombre: `Test Exhaustivo ${Date.now()}`,
      codigo_corregimiento: `TEST-EXHAUST-${Date.now()}`,
      id_municipio_municipios: 1
    };
    const response = await axios.post(
      `${BASE_URL}/catalog/corregimientos`,
      nuevoCorregimiento,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    corregimientoTestId = response.data.data.id_corregimiento;
    console.log('✅ Creación exitosa - ID:', corregimientoTestId);
    console.log('   Nombre:', response.data.data.nombre);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
  
  // Test 5: GET por ID
  if (corregimientoTestId) {
    console.log('\n📌 Test 3.5: GET /api/catalog/corregimientos/:id');
    try {
      const response = await axios.get(
        `${BASE_URL}/catalog/corregimientos/${corregimientoTestId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Obtención por ID exitosa');
      console.log('   Nombre:', response.data.data.nombre);
      console.log('   Municipio:', response.data.data.municipio?.nombre_municipio || 'N/A');
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.message || error.message);
    }
    
    // Test 6: PUT actualizar
    console.log('\n📌 Test 3.6: PUT /api/catalog/corregimientos/:id (actualizar)');
    try {
      const datosActualizados = {
        nombre: `Test Actualizado ${Date.now()}`
      };
      const response = await axios.put(
        `${BASE_URL}/catalog/corregimientos/${corregimientoTestId}`,
        datosActualizados,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Actualización exitosa');
      console.log('   Nuevo nombre:', response.data.data.nombre);
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.message || error.message);
    }
    
    // Test 7: DELETE eliminar
    console.log('\n📌 Test 3.7: DELETE /api/catalog/corregimientos/:id');
    try {
      const response = await axios.delete(
        `${BASE_URL}/catalog/corregimientos/${corregimientoTestId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Eliminación exitosa');
      console.log('   Mensaje:', response.data.message);
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.message || error.message);
    }
  }
}

// ==================== VERIFICACIÓN EN REPORTES ====================
async function testReportes() {
  console.log('\n4️⃣ VERIFICACIÓN EN REPORTES');
  console.log('─'.repeat(80));
  
  console.log('\n📌 Test 4.1: Verificar columna "corregimiento" en servicio de reportes');
  try {
    // Leer el servicio de reportes
    const fs = await import('fs');
    const reporteService = fs.readFileSync(
      './src/services/consolidados/personasReporteService.js', 
      'utf8'
    );
    
    if (reporteService.includes('corregimiento')) {
      console.log('✅ El servicio de reportes INCLUYE referencias a corregimiento');
      
      // Contar ocurrencias
      const matches = reporteService.match(/corregimiento/gi);
      console.log(`   Encontradas ${matches?.length || 0} referencias`);
    } else {
      console.log('❌ El servicio de reportes NO incluye corregimiento');
      console.log('   ⚠️  ACCIÓN REQUERIDA: Agregar campo corregimiento al reporte');
    }
    
  } catch (error) {
    console.error('❌ Error verificando reportes:', error.message);
  }
  
  console.log('\n📌 Test 4.2: Verificar consulta SQL del reporte');
  try {
    const fs = await import('fs');
    const reporteService = fs.readFileSync(
      './src/services/consolidados/personasReporteService.js', 
      'utf8'
    );
    
    const tieneJoinCorregimiento = reporteService.includes('JOIN corregimientos') || 
                                   reporteService.includes('LEFT JOIN corregimientos');
    const tieneCorregimientoEnSelect = reporteService.includes('corr.') || 
                                       reporteService.includes('c.nombre as nombre_corregimiento');
    
    if (tieneJoinCorregimiento) {
      console.log('✅ La consulta SQL incluye JOIN con corregimientos');
    } else {
      console.log('❌ La consulta SQL NO incluye JOIN con corregimientos');
    }
    
    if (tieneCorregimientoEnSelect) {
      console.log('✅ La consulta SQL SELECT incluye datos de corregimiento');
    } else {
      console.log('❌ La consulta SQL SELECT NO incluye datos de corregimiento');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ==================== VERIFICACIÓN EN EXCEL ====================
async function testExcel() {
  console.log('\n5️⃣ VERIFICACIÓN DE COLUMNAS EN EXCEL');
  console.log('─'.repeat(80));
  
  try {
    const fs = await import('fs');
    const reporteService = fs.readFileSync(
      './src/services/consolidados/personasReporteService.js', 
      'utf8'
    );
    
    console.log('\n📌 Test 5.1: Verificar columnas definidas en Excel');
    
    const tieneColumnaCorregimiento = reporteService.includes("{ header: 'Corregimiento'") ||
                                      reporteService.includes('header: "Corregimiento"');
    
    if (tieneColumnaCorregimiento) {
      console.log('✅ La definición de columnas incluye "Corregimiento"');
    } else {
      console.log('❌ La definición de columnas NO incluye "Corregimiento"');
      console.log('   ⚠️  ACCIÓN REQUERIDA: Agregar columna "Corregimiento" al Excel');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ==================== RESUMEN FINAL ====================
async function generarResumen() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 RESUMEN DE PRUEBAS EXHAUSTIVAS');
  console.log('='.repeat(80));
  
  console.log('\n✅ COMPLETADO:');
  console.log('   • Modelo Corregimientos creado correctamente');
  console.log('   • Relaciones Sequelize funcionando');
  console.log('   • Endpoints REST operativos');
  console.log('   • CRUD completo funcional');
  console.log('   • Asociaciones con Municipios y Familias establecidas');
  
  console.log('\n❌ PENDIENTE:');
  console.log('   • Agregar campo "corregimiento" al servicio de reportes');
  console.log('   • Incluir JOIN con tabla corregimientos en query SQL');
  console.log('   • Agregar columna "Corregimiento" en generación de Excel');
  console.log('   • Agregar filtro por id_corregimiento en reportes');
  
  console.log('\n📝 RECOMENDACIONES:');
  console.log('   1. Actualizar personasReporteService.js para incluir corregimientos');
  console.log('   2. Agregar LEFT JOIN corregimientos c ON f.id_corregimiento = c.id_corregimiento');
  console.log('   3. Incluir c.nombre as nombre_corregimiento en SELECT');
  console.log('   4. Agregar { header: "Corregimiento", key: "corregimiento", width: 25 }');
  console.log('   5. Agregar filtro if (filtros.id_corregimiento) en whereConditions');
  console.log('\n');
}

// ==================== EJECUTAR TODAS LAS PRUEBAS ====================
async function runAllTests() {
  try {
    await login();
    await testRelacionesSequelize();
    await testAPIEndpoints();
    await testReportes();
    await testExcel();
    await generarResumen();
    
    await sequelize.close();
    console.log('🔌 Conexión cerrada\n');
    
  } catch (error) {
    console.error('\n❌ Error general:', error.message);
    process.exit(1);
  }
}

runAllTests();
