import axios from 'axios';

// Configuración del servidor
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

// Headers comunes
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`
};

/**
 * Script de prueba para endpoints de consultas de difuntos
 */
class DifuntosTestSuite {
  constructor() {
    this.baseUrl = BASE_URL;
    this.headers = headers;
    this.results = [];
  }

  /**
   * Log de resultados
   */
  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log('Data:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Test de consulta de madres difuntas
   */
  async testMadresDifuntas() {
    try {
      this.log('🔍 Testing: Consulta de madres difuntas...');
      
      const response = await axios.get(`${this.baseUrl}/difuntos/consultas/madres`, {
        headers: this.headers,
        params: {
          sector: 'La Esperanza',
          apellido_familiar: 'García'
        }
      });

      this.log('✅ SUCCESS: Madres difuntas', {
        status: response.status,
        total: response.data.data?.total || 0,
        sample: response.data.data?.consultas?.slice(0, 2) || []
      });

      this.results.push({
        test: 'madres_difuntas',
        status: 'success',
        total: response.data.data?.total || 0
      });

    } catch (error) {
      this.log('❌ ERROR: Madres difuntas', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });

      this.results.push({
        test: 'madres_difuntas',
        status: 'error',
        error: error.response?.data?.message || error.message
      });
    }
  }

  /**
   * Test de consulta de padres difuntos
   */
  async testPadresDifuntos() {
    try {
      this.log('🔍 Testing: Consulta de padres difuntos...');
      
      const response = await axios.get(`${this.baseUrl}/difuntos/consultas/padres`, {
        headers: this.headers,
        params: {
          sector: 'El Centro'
        }
      });

      this.log('✅ SUCCESS: Padres difuntos', {
        status: response.status,
        total: response.data.data?.total || 0,
        sample: response.data.data?.consultas?.slice(0, 2) || []
      });

      this.results.push({
        test: 'padres_difuntos',
        status: 'success',
        total: response.data.data?.total || 0
      });

    } catch (error) {
      this.log('❌ ERROR: Padres difuntos', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });

      this.results.push({
        test: 'padres_difuntos',
        status: 'error',
        error: error.response?.data?.message || error.message
      });
    }
  }

  /**
   * Test de consulta de todos los difuntos
   */
  async testTodosDifuntos() {
    try {
      this.log('🔍 Testing: Consulta de todos los difuntos...');
      
      const response = await axios.get(`${this.baseUrl}/difuntos/consultas/todos`, {
        headers: this.headers,
        params: {
          apellido_familiar: 'López'
        }
      });

      this.log('✅ SUCCESS: Todos los difuntos', {
        status: response.status,
        total: response.data.data?.total || 0,
        sample: response.data.data?.consultas?.slice(0, 2) || []
      });

      this.results.push({
        test: 'todos_difuntos',
        status: 'success',
        total: response.data.data?.total || 0
      });

    } catch (error) {
      this.log('❌ ERROR: Todos los difuntos', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });

      this.results.push({
        test: 'todos_difuntos',
        status: 'error',
        error: error.response?.data?.message || error.message
      });
    }
  }

  /**
   * Test de consulta por rango de fechas
   */
  async testDifuntosPorRangoFechas() {
    try {
      this.log('🔍 Testing: Consulta por rango de fechas...');
      
      const response = await axios.get(`${this.baseUrl}/difuntos/consultas/rango-fechas`, {
        headers: this.headers,
        params: {
          fecha_inicio: '2020-01-01',
          fecha_fin: '2023-12-31',
          sector: 'La Paz'
        }
      });

      this.log('✅ SUCCESS: Difuntos por rango de fechas', {
        status: response.status,
        total: response.data.data?.total || 0,
        rango: response.data.data?.rango_fechas || {},
        sample: response.data.data?.consultas?.slice(0, 2) || []
      });

      this.results.push({
        test: 'difuntos_rango_fechas',
        status: 'success',
        total: response.data.data?.total || 0
      });

    } catch (error) {
      this.log('❌ ERROR: Difuntos por rango de fechas', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });

      this.results.push({
        test: 'difuntos_rango_fechas',
        status: 'error',
        error: error.response?.data?.message || error.message
      });
    }
  }

  /**
   * Test de estadísticas de difuntos
   */
  async testEstadisticasDifuntos() {
    try {
      this.log('🔍 Testing: Estadísticas de difuntos...');
      
      const response = await axios.get(`${this.baseUrl}/difuntos/estadisticas`, {
        headers: this.headers
      });

      this.log('✅ SUCCESS: Estadísticas de difuntos', {
        status: response.status,
        estadisticas: response.data.data || {}
      });

      this.results.push({
        test: 'estadisticas_difuntos',
        status: 'success',
        total: response.data.data?.total || 0
      });

    } catch (error) {
      this.log('❌ ERROR: Estadísticas de difuntos', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });

      this.results.push({
        test: 'estadisticas_difuntos',
        status: 'error',
        error: error.response?.data?.message || error.message
      });
    }
  }

  /**
   * Ejecutar todos los tests
   */
  async runAllTests() {
    this.log('🚀 Iniciando suite de pruebas para consultas de difuntos...');
    this.log(`📡 Base URL: ${this.baseUrl}`);
    this.log(`🔑 Auth Token: ${AUTH_TOKEN ? 'Configured' : 'Not configured'}`);
    
    console.log('\n' + '='.repeat(80));
    
    // Ejecutar tests
    await this.testMadresDifuntas();
    console.log('\n' + '-'.repeat(80));
    
    await this.testPadresDifuntos();
    console.log('\n' + '-'.repeat(80));
    
    await this.testTodosDifuntos();
    console.log('\n' + '-'.repeat(80));
    
    await this.testDifuntosPorRangoFechas();
    console.log('\n' + '-'.repeat(80));
    
    await this.testEstadisticasDifuntos();
    
    console.log('\n' + '='.repeat(80));
    this.printSummary();
  }

  /**
   * Imprimir resumen de resultados
   */
  printSummary() {
    this.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log('='.repeat(80));
    
    const successful = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Exitosos: ${successful}`);
    console.log(`❌ Fallidos: ${failed}`);
    console.log(`📈 Total: ${this.results.length}`);
    
    console.log('\nDetalle de resultados:');
    this.results.forEach((result, index) => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${index + 1}. ${result.test}: ${result.status}`);
      if (result.total !== undefined) {
        console.log(`   📊 Total registros: ${result.total}`);
      }
      if (result.error) {
        console.log(`   🔍 Error: ${result.error}`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    
    if (failed === 0) {
      this.log('🎉 ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');
    } else {
      this.log('⚠️  Algunas pruebas fallaron. Revise los errores anteriores.');
    }
  }
}

// Ejecutar tests
const testSuite = new DifuntosTestSuite();

// Ejecutar la suite de pruebas
testSuite.runAllTests().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error fatal en la suite de pruebas:', error);
  process.exit(1);
});
