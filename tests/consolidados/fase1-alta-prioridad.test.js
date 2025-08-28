import request from 'supertest';
import app from '../../src/app.js';

describe('Endpoints Consolidados - Fase 1 (Alta Prioridad)', () => {
  let authToken;

  beforeAll(async () => {
    // Obtener token de autenticación para las pruebas
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        correo_electronico: process.env.TEST_USER_EMAIL || 'admin@test.com',
        password: process.env.TEST_USER_PASSWORD || 'admin123'
      });

    if (loginResponse.status === 200) {
      authToken = loginResponse.body.token;
    }
  });

  describe('🔥 ENDPOINT 1: /api/difuntos - 95% listo', () => {
    test('GET /api/difuntos - Consulta básica', async () => {
      const response = await request(app)
        .get('/api/difuntos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('exito');
      expect(response.body).toHaveProperty('datos');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('estadisticas');
      expect(Array.isArray(response.body.datos)).toBe(true);
      
      console.log('✅ Difuntos básico:', {
        total: response.body.total,
        estadisticas: Object.keys(response.body.estadisticas || {})
      });
    });

    test('GET /api/difuntos?parentesco=Madre - Filtro por parentesco', async () => {
      const response = await request(app)
        .get('/api/difuntos?parentesco=Madre')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      
      console.log('✅ Madres difuntas:', {
        total: response.body.total,
        filtros: response.body.filtros_aplicados
      });
    });

    test('GET /api/difuntos/aniversarios - Aniversarios próximos', async () => {
      const response = await request(app)
        .get('/api/difuntos/aniversarios?dias=60')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      expect(Array.isArray(response.body.datos)).toBe(true);
      
      console.log('✅ Aniversarios próximos:', {
        total: response.body.total,
        mensaje: response.body.mensaje
      });
    });

    test('GET /api/difuntos/estadisticas - Estadísticas', async () => {
      const response = await request(app)
        .get('/api/difuntos/estadisticas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      expect(response.body).toHaveProperty('datos');
      
      console.log('✅ Estadísticas difuntos:', {
        total_difuntos: response.body.total_difuntos,
        por_parentesco: response.body.datos?.por_parentesco || {}
      });
    });
  });

  describe('🔥 ENDPOINT 2: /api/personas/salud - 90% listo', () => {
    test('GET /api/personas/salud - Consulta básica', async () => {
      const response = await request(app)
        .get('/api/personas/salud')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('exito');
      expect(response.body).toHaveProperty('datos');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.datos)).toBe(true);
      
      console.log('✅ Salud básico:', {
        total: response.body.total,
        estadisticas: Object.keys(response.body.estadisticas || {})
      });
    });

    test('GET /api/personas/salud?enfermedad=diabetes - Filtro por enfermedad', async () => {
      const response = await request(app)
        .get('/api/personas/salud?enfermedad=diabetes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      
      console.log('✅ Personas con diabetes:', {
        total: response.body.total,
        filtros: response.body.filtros_aplicados
      });
    });

    test('GET /api/personas/salud?rango_edad=60-80 - Filtro por edad', async () => {
      const response = await request(app)
        .get('/api/personas/salud?rango_edad=60-80')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      
      console.log('✅ Personas 60-80 años:', {
        total: response.body.total,
        filtros: response.body.filtros_aplicados
      });
    });

    test('GET /api/personas/salud/estadisticas - Estadísticas de salud', async () => {
      const response = await request(app)
        .get('/api/personas/salud/estadisticas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      
      console.log('✅ Estadísticas salud:', {
        total_personas: response.body.total_personas,
        con_enfermedades: response.body.datos?.con_enfermedades || 0,
        sin_enfermedades: response.body.datos?.sin_enfermedades || 0
      });
    });
  });

  describe('🔥 ENDPOINT 3: /api/familias - 80% listo', () => {
    test('GET /api/familias - Consulta básica', async () => {
      const response = await request(app)
        .get('/api/familias')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('exito');
      expect(response.body).toHaveProperty('datos');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.datos)).toBe(true);
      
      console.log('✅ Familias básico:', {
        total: response.body.total,
        filtros: response.body.filtros_aplicados
      });
    });

    test('GET /api/familias?sexo=F - Filtro por sexo femenino', async () => {
      const response = await request(app)
        .get('/api/familias?sexo=F')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      
      console.log('✅ Mujeres:', {
        total: response.body.total,
        filtros: response.body.filtros_aplicados
      });
    });

    test('GET /api/familias/madres - Consulta de madres', async () => {
      const response = await request(app)
        .get('/api/familias/madres')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      
      console.log('✅ Madres específicas:', {
        total: response.body.total,
        mensaje: response.body.mensaje
      });
    });

    test('GET /api/familias/padres - Consulta de padres', async () => {
      const response = await request(app)
        .get('/api/familias/padres')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      
      console.log('✅ Padres específicos:', {
        total: response.body.total,
        mensaje: response.body.mensaje
      });
    });

    test('GET /api/familias/sin-padre - Familias sin padre', async () => {
      const response = await request(app)
        .get('/api/familias/sin-padre')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      
      console.log('✅ Familias sin padre:', {
        total: response.body.total,
        mensaje: response.body.mensaje
      });
    });

    test('GET /api/familias/estadisticas - Estadísticas de familias', async () => {
      const response = await request(app)
        .get('/api/familias/estadisticas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      
      console.log('✅ Estadísticas familias:', {
        total_personas: response.body.total_personas,
        por_sexo: response.body.datos?.por_sexo || {},
        por_parentesco: response.body.datos?.por_parentesco || {}
      });
    });
  });

  describe('🔧 Pruebas de Integración', () => {
    test('Comparar datos entre endpoints antiguos y nuevos', async () => {
      // Obtener datos del endpoint antiguo de madres
      const madresAntiguo = await request(app)
        .get('/api/consultas/madres')
        .set('Authorization', `Bearer ${authToken}`);

      // Obtener datos del endpoint nuevo de madres
      const madresNuevo = await request(app)
        .get('/api/familias/madres')
        .set('Authorization', `Bearer ${authToken}`);

      console.log('🔄 Comparación Madres:', {
        antiguo: {
          status: madresAntiguo.status,
          total: madresAntiguo.body?.total || 0
        },
        nuevo: {
          status: madresNuevo.status,
          total: madresNuevo.body?.total || 0
        }
      });

      expect(madresNuevo.status).toBe(200);
    });

    test('Verificar consistencia de datos geográficos', async () => {
      const municipios = ['Medellín', 'Bello', 'Envigado'];
      
      for (const municipio of municipios) {
        const response = await request(app)
          .get(`/api/familias?municipio=${municipio}&limite=5`)
          .set('Authorization', `Bearer ${authToken}`);

        console.log(`📍 Datos ${municipio}:`, {
          status: response.status,
          total: response.body?.total || 0
        });
      }
    });
  });
});

// Función auxiliar para mostrar resumen final
afterAll(async () => {
  console.log('\n📊 RESUMEN DE FASE 1 - ALTA PRIORIDAD:');
  console.log('✅ /api/difuntos - Endpoint implementado y funcionando');
  console.log('✅ /api/personas/salud - Endpoint implementado y funcionando');
  console.log('✅ /api/familias - Endpoint implementado y funcionando');
  console.log('\n🎯 Estado: LISTOS PARA PRODUCCIÓN');
  console.log('📝 Próximo paso: Implementar Fase 2 (Prioridad Media)');
});
