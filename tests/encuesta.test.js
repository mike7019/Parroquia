import request from 'supertest';
import app from '../src/app.js';
import sequelize from '../config/sequelize.js';

describe('Servicio de Encuestas', () => {
  let authToken;
  let testFamiliaId;

  beforeAll(async () => {
    // Configurar base de datos de prueba
    await sequelize.sync({ force: true });
    
    // Crear usuario de prueba y obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/encuesta', () => {
    it('debería crear una encuesta válida', async () => {
      const encuestaData = {
        informacionGeneral: {
          municipio: { id: 1, nombre: "Test Municipio" },
          parroquia: { id: 1, nombre: "Test Parroquia" },
          sector: { nombre: "Test Sector" },
          fecha: "2025-01-01",
          apellido_familiar: "Familia Test",
          direccion: "Calle Test 123",
          telefono: "3001234567",
          numero_contrato_epm: "TEST123",
          comunionEnCasa: false
        },
        vivienda: {
          tipo_vivienda: { id: 1, nombre: "Casa" },
          disposicion_basuras: {
            recolector: true,
            quemada: false,
            enterrada: false,
            recicla: true,
            aire_libre: false,
            no_aplica: false
          }
        },
        servicios_agua: {
          sistema_acueducto: { id: 1, nombre: "Acueducto Público" },
          aguas_residuales: { id: 1, nombre: "Alcantarillado" },
          pozo_septico: false,
          letrina: false,
          campo_abierto: false
        },
        observaciones: {
          sustento_familia: "Trabajo independiente",
          observaciones_encuestador: "Familia colaborativa",
          autorizacion_datos: true
        },
        familyMembers: [
          {
            nombres: "Juan Carlos Test",
            numeroIdentificacion: "1234567890",
            fechaNacimiento: "1990-01-01",
            sexo: { id: 1, nombre: "Masculino" },
            telefono: "3001234567"
          }
        ],
        deceasedMembers: [],
        metadata: {
          timestamp: new Date().toISOString(),
          completed: true,
          currentStage: 6
        }
      };

      const response = await request(app)
        .post('/api/encuesta')
        .set('Authorization', `Bearer ${authToken}`)
        .send(encuestaData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.familia_id).toBeDefined();
      expect(response.body.data.personas_creadas).toBe(1);
      
      testFamiliaId = response.body.data.familia_id;
    });

    it('debería rechazar encuesta con datos inválidos', async () => {
      const encuestaInvalida = {
        informacionGeneral: {
          // Falta apellido_familiar requerido
          direccion: "Calle Test 123",
          telefono: "3001234567"
        }
      };

      const response = await request(app)
        .post('/api/encuesta')
        .set('Authorization', `Bearer ${authToken}`)
        .send(encuestaInvalida)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.errors).toBeDefined();
    });

    it('debería rechazar identificaciones duplicadas', async () => {
      const encuestaConDuplicados = {
        informacionGeneral: {
          apellido_familiar: "Familia Duplicados",
          direccion: "Calle Test 456",
          telefono: "3009876543"
        },
        familyMembers: [
          {
            nombres: "Juan Test",
            numeroIdentificacion: "1111111111"
          },
          {
            nombres: "Pedro Test",
            numeroIdentificacion: "1111111111" // Duplicado
          }
        ]
      };

      const response = await request(app)
        .post('/api/encuesta')
        .set('Authorization', `Bearer ${authToken}`)
        .send(encuestaConDuplicados)
        .expect(400);

      expect(response.body.error_code).toBe('IDENTIFICACIONES_DUPLICADAS_EN_FAMILIA');
    });
  });

  describe('GET /api/encuesta', () => {
    it('debería obtener lista de encuestas con paginación', async () => {
      const response = await request(app)
        .get('/api/encuesta?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('debería filtrar encuestas por apellido familiar', async () => {
      const response = await request(app)
        .get('/api/encuesta?apellido_familiar=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/encuesta/:id', () => {
    it('debería obtener encuesta específica por ID', async () => {
      const response = await request(app)
        .get(`/api/encuesta/${testFamiliaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id_familia).toBe(testFamiliaId);
      expect(response.body.data.apellido_familiar).toBe('Familia Test');
    });

    it('debería retornar 404 para encuesta inexistente', async () => {
      const response = await request(app)
        .get('/api/encuesta/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/encuesta/:id', () => {
    it('debería actualizar campos específicos', async () => {
      const updateData = {
        telefono: '3009999999',
        email: 'nuevo@email.com'
      };

      const response = await request(app)
        .patch(`/api/encuesta/${testFamiliaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.exito).toBe(true);
      expect(response.body.campos_actualizados).toContain('telefono');
      expect(response.body.campos_actualizados).toContain('email');
    });
  });

  describe('DELETE /api/encuesta/:id', () => {
    it('debería eliminar encuesta existente', async () => {
      const response = await request(app)
        .delete(`/api/encuesta/${testFamiliaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.eliminacion_completada).toBe(true);
    });

    it('debería retornar 404 al intentar eliminar encuesta inexistente', async () => {
      const response = await request(app)
        .delete('/api/encuesta/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('ENCUESTA_NOT_FOUND');
    });
  });
});

describe('Validaciones de Encuesta', () => {
  describe('Validación de estructura', () => {
    it('debería validar campos requeridos', () => {
      const encuestaIncompleta = {
        informacionGeneral: {
          // Falta apellido_familiar
          direccion: "Test"
        }
      };

      // Test de validación aquí
    });

    it('debería validar formato de fechas', () => {
      const fechaInvalida = "fecha-invalida";
      // Test de validación de fecha
    });

    it('debería validar números de identificación', () => {
      const identificacionInvalida = "abc123def456ghi789jkl"; // Muy larga
      // Test de validación de identificación
    });
  });

  describe('Validación de integridad', () => {
    it('debería validar existencia de catálogos referenciados', async () => {
      // Test de validación de integridad referencial
    });

    it('debería validar unicidad de identificaciones', async () => {
      // Test de validación de unicidad
    });
  });
});

describe('Rendimiento de Encuestas', () => {
  it('debería manejar consultas grandes eficientemente', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/encuesta?limit=100')
      .set('Authorization', `Bearer ${authToken}`);
    
    const duration = Date.now() - startTime;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(2000); // Menos de 2 segundos
  });

  it('debería usar índices de base de datos correctamente', async () => {
    // Test de uso de índices
  });
});