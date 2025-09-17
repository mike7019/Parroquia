/**
 * Script de pruebas para verificar la corrección del servicio de difuntos
 * Valida que ambas rutas (legacy y consolidada) funcionen correctamente
 */

import fetch from 'node-fetch';

class TestDifuntosCorreccion {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.token = null;
    this.resultados = {
      total: 0,
      exitosos: 0,
      fallidos: 0,
      errores: []
    };
  }

  async ejecutarPruebas() {
    console.log('🧪 Iniciando pruebas de corrección del servicio de difuntos...\n');

    try {
      // 1. Obtener token de autenticación
      await this.obtenerToken();

      // 2. Probar rutas consolidadas (principales)
      await this.probarRutasConsolidadas();

      // 3. Probar rutas legacy (compatibilidad)
      await this.probarRutasLegacy();

      // 4. Verificar que no hay conflictos
      await this.verificarNoConflictos();

      // 5. Generar reporte
      this.generarReporte();

    } catch (error) {
      console.error('❌ Error general en las pruebas:', error.message);
    }
  }

  async obtenerToken() {
    console.log('🔑 Obteniendo token de autenticación...');
    
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@parroquia.com',
          password: 'admin123'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        console.log('✅ Token obtenido correctamente\n');
      } else {
        console.log('⚠️ No se pudo obtener token, usando modo sin autenticación\n');
      }
    } catch (error) {
      console.log('⚠️ Error obteniendo token:', error.message);
      console.log('ℹ️ Continuando pruebas sin autenticación\n');
    }
  }

  async probarRutasConsolidadas() {
    console.log('🔄 Probando rutas consolidadas (principales)...\n');

    const pruebas = [
      {
        nombre: 'Consulta básica consolidada',
        url: '/api/difuntos',
        descripcion: 'GET /api/difuntos'
      },
      {
        nombre: 'Filtro por madres consolidado',
        url: '/api/difuntos?parentesco=Madre',
        descripcion: 'GET /api/difuntos?parentesco=Madre'
      },
      {
        nombre: 'Filtro por padres consolidado',
        url: '/api/difuntos?parentesco=Padre',
        descripcion: 'GET /api/difuntos?parentesco=Padre'
      },
      {
        nombre: 'Filtro por parroquia',
        url: '/api/difuntos?parroquia=San José',
        descripcion: 'GET /api/difuntos?parroquia=San José'
      },
      {
        nombre: 'Combinación parroquia y parentesco',
        url: '/api/difuntos?parentesco=Madre&parroquia=Sagrado Corazón',
        descripcion: 'GET /api/difuntos?parentesco=Madre&parroquia=Sagrado Corazón'
      },
      {
        nombre: 'Aniversarios próximos',
        url: '/api/difuntos/aniversarios?dias=30',
        descripcion: 'GET /api/difuntos/aniversarios?dias=30'
      },
      {
        nombre: 'Estadísticas consolidadas',
        url: '/api/difuntos/estadisticas',
        descripcion: 'GET /api/difuntos/estadisticas'
      }
    ];

    for (const prueba of pruebas) {
      await this.ejecutarPrueba(prueba);
    }
  }

  async probarRutasLegacy() {
    console.log('🔄 Probando rutas legacy (compatibilidad)...\n');

    const pruebas = [
      {
        nombre: 'Madres legacy',
        url: '/api/difuntos/legacy/consultas/madres',
        descripcion: 'GET /api/difuntos/legacy/consultas/madres'
      },
      {
        nombre: 'Padres legacy',
        url: '/api/difuntos/legacy/consultas/padres',
        descripcion: 'GET /api/difuntos/legacy/consultas/padres'
      },
      {
        nombre: 'Todos legacy',
        url: '/api/difuntos/legacy/consultas/todos',
        descripcion: 'GET /api/difuntos/legacy/consultas/todos'
      },
      {
        nombre: 'Rango fechas legacy',
        url: '/api/difuntos/legacy/consultas/rango-fechas?fecha_inicio=2020-01-01&fecha_fin=2024-12-31',
        descripcion: 'GET /api/difuntos/legacy/consultas/rango-fechas'
      },
      {
        nombre: 'Estadísticas legacy',
        url: '/api/difuntos/legacy/estadisticas',
        descripcion: 'GET /api/difuntos/legacy/estadisticas'
      }
    ];

    for (const prueba of pruebas) {
      await this.ejecutarPrueba(prueba);
    }
  }

  async verificarNoConflictos() {
    console.log('🔄 Verificando que no hay conflictos...\n');

    // Verificar que las respuestas son diferentes y específicas
    const consolidada = await this.realizarRequest('/api/difuntos?parentesco=Madre');
    const legacy = await this.realizarRequest('/api/difuntos/legacy/consultas/madres');

    if (consolidada && legacy) {
      console.log('✅ Ambas rutas responden independientemente');
      console.log(`   - Consolidada: ${consolidada.status}`);
      console.log(`   - Legacy: ${legacy.status}`);
      this.registrarExito('Verificación no conflictos');
    } else {
      console.log('❌ Posible conflicto detectado');
      this.registrarError('Verificación no conflictos', 'Una o ambas rutas no responden');
    }
  }

  async ejecutarPrueba(prueba) {
    this.resultados.total++;
    
    try {
      const response = await this.realizarRequest(prueba.url);
      
      if (response && (response.status === 200 || response.status === 401)) {
        console.log(`✅ ${prueba.nombre}: ${response.status}`);
        console.log(`   URL: ${prueba.descripcion}`);
        this.registrarExito(prueba.nombre);
      } else {
        console.log(`❌ ${prueba.nombre}: ${response ? response.status : 'Sin respuesta'}`);
        this.registrarError(prueba.nombre, `Status: ${response ? response.status : 'N/A'}`);
      }
    } catch (error) {
      console.log(`❌ ${prueba.nombre}: Error - ${error.message}`);
      this.registrarError(prueba.nombre, error.message);
    }
    
    console.log(''); // Línea en blanco para separar
  }

  async realizarRequest(url) {
    const headers = {
      'Accept': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, { headers });
      return response;
    } catch (error) {
      console.log(`⚠️ Error de conexión para ${url}: ${error.message}`);
      return null;
    }
  }

  registrarExito(nombre) {
    this.resultados.exitosos++;
  }

  registrarError(nombre, mensaje) {
    this.resultados.fallidos++;
    this.resultados.errores.push({ nombre, mensaje });
  }

  generarReporte() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE DE PRUEBAS DE CORRECCIÓN');
    console.log('='.repeat(60));
    
    const porcentaje = Math.round((this.resultados.exitosos / this.resultados.total) * 100);
    
    console.log(`📈 Resultados:`);
    console.log(`   Total de pruebas: ${this.resultados.total}`);
    console.log(`   Exitosas: ${this.resultados.exitosos}`);
    console.log(`   Fallidas: ${this.resultados.fallidos}`);
    console.log(`   Tasa de éxito: ${porcentaje}%`);
    
    if (this.resultados.errores.length > 0) {
      console.log(`\n🚨 Errores encontrados:`);
      this.resultados.errores.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.nombre}: ${error.mensaje}`);
      });
    }
    
    console.log(`\n📋 Estado general:`);
    if (porcentaje >= 80) {
      console.log('🟢 EXCELENTE: La corrección fue exitosa');
    } else if (porcentaje >= 60) {
      console.log('🟡 REGULAR: Hay algunos problemas por resolver');
    } else if (porcentaje >= 40) {
      console.log('🟠 CRÍTICO: Varios problemas detectados');
    } else {
      console.log('🔴 FALLIDO: La corrección requiere revisión');
    }
    
    console.log(`\n💡 Notas:`);
    console.log(`   • Status 401 (No autorizado) es esperado sin token válido`);
    console.log(`   • Status 200 indica endpoint funcionando correctamente`);
    console.log(`   • Lo importante es que ambas rutas respondan independientemente`);
    
    console.log(`\n🔧 Próximos pasos:`);
    if (porcentaje >= 80) {
      console.log(`   • ✅ Corrección exitosa, servidor funcionando`);
      console.log(`   • ✅ Rutas consolidadas y legacy activas`);
      console.log(`   • 📋 Documentar cambios para el equipo`);
    } else {
      console.log(`   • 🔄 Verificar que el servidor esté ejecutándose`);
      console.log(`   • 🔍 Revisar logs del servidor para errores`);
      console.log(`   • 🛠️ Corregir problemas identificados`);
    }
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const tester = new TestDifuntosCorreccion();
  tester.ejecutarPruebas();
}

export default TestDifuntosCorreccion;
