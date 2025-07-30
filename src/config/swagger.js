import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger configuration using ES6 modules
 */
const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Parroquia API',
      version: '1.0.0',
      description: 'Sistema de gestión parroquial - API REST completa con autenticación y gestión de usuarios',
      contact: {
        name: 'API Support',
        email: 'support@parroquia.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'http://206.62.139.100:3000/',
        description: 'Test server'
      },
      {
        url: 'https://api.parroquia.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario',
              example: 1
            },
            firstName: {
              type: 'string',
              description: 'Primer nombre del usuario',
              example: 'Juan'
            },
            lastName: {
              type: 'string',
              description: 'Apellido del usuario',
              example: 'Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico único',
              example: 'juan.perez@yopmail.com'
            },
            phone: {
              type: 'string',
              description: 'Número de teléfono del usuario',
              example: '+57 300 123 4567'
            },
            role: {
              type: 'string',
              enum: ['admin', 'coordinator', 'surveyor'],
              description: 'Rol del usuario en el sistema',
              example: 'surveyor'
            },
            isActive: {
              type: 'boolean',
              description: 'Estado activo del usuario',
              example: true
            },
            emailVerified: {
              type: 'boolean',
              description: 'Si el email ha sido verificado',
              example: true
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora del último login',
              example: '2025-07-16T10:30:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
              example: '2025-07-16T08:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
              example: '2025-07-16T10:30:00.000Z'
            }
          }
        },
        UserInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Primer nombre del usuario',
              example: 'Diego'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Apellido del usuario',
              example: 'Garcia'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico único',
              example: 'diego.garcia5105@yopmail.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Contraseña (mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos)',
              example: 'MiPassword123!'
            },
            phone: {
              type: 'string',
              minLength: 10,
              maxLength: 20,
              description: 'Número de teléfono del usuario',
              example: '+57 300 123 4567'
            },
            role: {
              type: 'string',
              enum: ['admin', 'coordinator', 'surveyor'],
              default: 'surveyor',
              description: 'Rol del usuario',
              example: 'surveyor'
            }
          }
        },
        UserUpdate: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Primer nombre del usuario',
              example: 'Juan'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Apellido del usuario',
              example: 'Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico único',
              example: 'juan.perez@yopmail.com'
            },
            phone: {
              type: 'string',
              minLength: 10,
              maxLength: 20,
              description: 'Número de teléfono del usuario',
              example: '+57 300 123 4567'
            },
            role: {
              type: 'string',
              enum: ['admin', 'coordinator', 'surveyor'],
              description: 'Rol del usuario',
              example: 'surveyor'
            },
            isActive: {
              type: 'boolean',
              description: 'Estado activo del usuario',
              example: true
            }
          }
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico',
              example: 'ana.herrera8687@yopmail.com'
            },
            password: {
              type: 'string',
              description: 'Contraseña',
              example: 'Segura456@'
            }
          }
        },
        TokenResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'Token de acceso JWT',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              description: 'Token de actualización',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            expiresIn: {
              type: 'integer',
              description: 'Tiempo de expiración en segundos',
              example: 900
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        PasswordResetInput: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: {
              type: 'string',
              description: 'Token de restablecimiento de contraseña',
              example: 'abc123def456ghi789'
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              description: 'Nueva contraseña',
              example: 'NuevaPassword123!'
            }
          }
        },
        ChangePasswordInput: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              description: 'Contraseña actual',
              example: 'MiPasswordActual123!'
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              description: 'Nueva contraseña',
              example: 'MiNuevaPassword456!'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success', 'error'],
              description: 'Estado de la respuesta',
              example: 'success'
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo',
              example: 'Operación realizada exitosamente'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta (opcional)'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['error'],
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Ha ocurrido un error'
            },
            code: {
              type: 'string',
              description: 'Código de error específico',
              example: 'VALIDATION_ERROR'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Campo que causó el error',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    description: 'Mensaje específico del error',
                    example: 'El formato del email no es válido'
                  }
                }
              },
              description: 'Detalles específicos de errores de validación'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              description: 'Página actual',
              example: 1
            },
            totalPages: {
              type: 'integer',
              description: 'Total de páginas',
              example: 10
            },
            totalItems: {
              type: 'integer',
              description: 'Total de elementos',
              example: 100
            },
            itemsPerPage: {
              type: 'integer',
              description: 'Elementos por página',
              example: 10
            },
            hasNext: {
              type: 'boolean',
              description: 'Si hay página siguiente',
              example: true
            },
            hasPrev: {
              type: 'boolean',
              description: 'Si hay página anterior',
              example: false
            }
          }
        },
        ParroquiaResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  $ref: '#/components/schemas/Parroquia'
                }
              }
            }
          ]
        },
        ParroquiasListResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Parroquia'
                  }
                },
                pagination: {
                  $ref: '#/components/schemas/Pagination'
                }
              }
            }
          ]
        },
        SectorResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  $ref: '#/components/schemas/Sector'
                }
              }
            }
          ]
        },
        SectorsListResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Sector'
                  }
                },
                pagination: {
                  $ref: '#/components/schemas/Pagination'
                }
              }
            }
          ]
        },
        VeredaResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  $ref: '#/components/schemas/Vereda'
                }
              }
            }
          ]
        },
        VeredasListResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Vereda'
                  }
                },
                pagination: {
                  $ref: '#/components/schemas/Pagination'
                }
              }
            }
          ]
        },
        SexoResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  $ref: '#/components/schemas/Sexo'
                }
              }
            }
          ]
        },
        SexosListResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiResponse' },
            {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Sexo'
                  }
                },
                pagination: {
                  $ref: '#/components/schemas/Pagination'
                }
              }
            }
          ]
        },
        Survey: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único de la encuesta',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            userId: {
              type: 'integer',
              description: 'ID del encuestador',
              example: 1
            },
            familyId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la familia (opcional)',
              example: '123e4567-e89b-12d3-a456-426614174001'
            },
            sector: {
              type: 'string',
              maxLength: 100,
              description: 'Sector asignado',
              example: 'La Esperanza'
            },
            familyHead: {
              type: 'string',
              maxLength: 200,
              description: 'Nombre del jefe de familia',
              example: 'María González Pérez'
            },
            address: {
              type: 'string',
              description: 'Dirección de la familia',
              example: 'Calle 15 #23-45, Barrio Centro'
            },
            phone: {
              type: 'string',
              maxLength: 20,
              description: 'Teléfono de contacto',
              example: '3001234567'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico',
              example: 'maria.gonzalez@email.com'
            },
            familySize: {
              type: 'integer',
              minimum: 1,
              maximum: 50,
              description: 'Tamaño de la familia',
              example: 4
            },
            housingType: {
              type: 'string',
              maxLength: 100,
              description: 'Tipo de vivienda',
              example: 'Casa propia'
            },
            status: {
              type: 'string',
              enum: ['draft', 'in_progress', 'completed', 'cancelled'],
              description: 'Estado de la encuesta',
              example: 'in_progress'
            },
            currentStage: {
              type: 'integer',
              minimum: 1,
              description: 'Etapa actual',
              example: 2
            },
            totalStages: {
              type: 'integer',
              minimum: 1,
              description: 'Total de etapas',
              example: 4
            },
            progress: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Porcentaje de progreso',
              example: 50
            },
            observations: {
              type: 'string',
              description: 'Observaciones adicionales',
              example: 'Familia muy colaborativa'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          },
          required: ['sector', 'familyHead', 'address', 'familySize', 'housingType']
        },
        CreateSurveyRequest: {
          type: 'object',
          properties: {
            sector: {
              type: 'string',
              maxLength: 100,
              description: 'Sector asignado',
              example: 'La Esperanza'
            },
            familyHead: {
              type: 'string',
              maxLength: 200,
              description: 'Nombre del jefe de familia',
              example: 'María González Pérez'
            },
            address: {
              type: 'string',
              description: 'Dirección de la familia',
              example: 'Calle 15 #23-45, Barrio Centro'
            },
            phone: {
              type: 'string',
              maxLength: 20,
              description: 'Teléfono de contacto',
              example: '3001234567'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico',
              example: 'maria.gonzalez@email.com'
            },
            familySize: {
              type: 'integer',
              minimum: 1,
              maximum: 50,
              description: 'Tamaño de la familia',
              example: 4
            },
            housingType: {
              type: 'string',
              maxLength: 100,
              description: 'Tipo de vivienda',
              example: 'Casa propia'
            },
            observations: {
              type: 'string',
              description: 'Observaciones adicionales',
              example: 'Familia muy colaborativa'
            }
          },
          required: ['sector', 'familyHead', 'address', 'familySize', 'housingType']
        },
        CreateSurveyInput: {
          $ref: '#/components/schemas/CreateSurveyRequest'
        },
        StageDataInput: {
          type: 'object',
          properties: {
            stageData: {
              type: 'object',
              description: 'Data específica de la etapa de la encuesta',
              additionalProperties: true,
              example: {
                "generalInfo": {
                  "interviewDate": "2025-07-20",
                  "interviewerNotes": "Familia muy colaborativa"
                },
                "economicData": {
                  "monthlyIncome": 1500000,
                  "employmentStatus": "empleado",
                  "occupation": "comerciante"
                }
              }
            },
            currentStage: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: 'Etapa actual de la encuesta',
              example: 2
            },
            isComplete: {
              type: 'boolean',
              description: 'Indica si la etapa está completa',
              example: true
            }
          },
          required: ['stageData']
        },
        FamilyMemberInput: {
          type: 'object',
          properties: {
            nombres: {
              type: 'string',
              maxLength: 500,
              description: 'Nombres completos del miembro de la familia',
              example: 'Carlos'
            },
            apellidos: {
              type: 'string',
              maxLength: 500,
              description: 'Apellidos del miembro de la familia',
              example: 'González'
            },
            tipoIdentificacion: {
              type: 'string',
              enum: ['CC', 'TI', 'CE', 'PA', 'RC'],
              description: 'Tipo de documento de identidad',
              example: 'CC'
            },
            numeroIdentificacion: {
              type: 'string',
              maxLength: 50,
              description: 'Número de documento de identidad',
              example: '12345678'
            },
            fechaNacimiento: {
              type: 'string',
              format: 'date',
              description: 'Fecha de nacimiento',
              example: '1990-05-15'
            },
            sexo: {
              type: 'string',
              enum: ['M', 'F', 'Otro'],
              description: 'Sexo del miembro',
              example: 'M'
            },
            situacionCivil: {
              type: 'string',
              enum: ['Soltero', 'Soltera', 'Casado', 'Casada', 'Divorciado', 'Divorciada', 'Viudo', 'Viuda', 'Unión Libre'],
              description: 'Estado civil',
              example: 'Soltero'
            },
            parentesco: {
              type: 'string',
              maxLength: 100,
              description: 'Relación con el jefe de familia',
              example: 'Hijo'
            },
            estudio: {
              type: 'string',
              maxLength: 200,
              description: 'Nivel educativo',
              example: 'Secundaria completa'
            },
            comunidadCultural: {
              type: 'string',
              maxLength: 100,
              description: 'Comunidad cultural',
              example: 'Ninguna'
            },
            ocupacion: {
              type: 'string',
              maxLength: 100,
              description: 'Ocupación laboral',
              example: 'Estudiante'
            },
            telefono: {
              type: 'string',
              maxLength: 20,
              description: 'Teléfono de contacto',
              example: '3001234567'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico',
              example: 'carlos.gonzalez@email.com'
            },
            talla: {
              type: 'object',
              description: 'Tallas del miembro (al menos una requerida)',
              properties: {
                camisa: {
                  type: 'string',
                  description: 'Talla de camisa',
                  example: 'M'
                },
                pantalon: {
                  type: 'string',
                  description: 'Talla de pantalón',
                  example: '32'
                },
                calzado: {
                  type: 'string',
                  description: 'Talla de calzado',
                  example: '42'
                }
              }
            },
            isActive: {
              type: 'boolean',
              description: 'Indica si el miembro está activo',
              example: true
            }
          },
          required: ['nombres', 'apellidos', 'tipoIdentificacion', 'numeroIdentificacion', 'fechaNacimiento', 'sexo', 'situacionCivil', 'parentesco', 'estudio', 'comunidadCultural', 'talla']
        },
        VeredaInput: {
          type: 'object',
          properties: {
            nombre: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre de la vereda',
              example: 'El Alamo'
            },
            codigo_vereda: {
              type: 'string',
              maxLength: 50,
              description: 'Código único de la vereda (opcional)',
              example: '001'
            },
            id_municipio: {
              type: 'integer',
              description: 'ID del municipio al que pertenece la vereda (opcional)',
              example: 1
            }
          },
          required: ['nombre']
        },
        ParroquiaInput: {
          type: 'object',
          properties: {
            nombre: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre de la parroquia',
              example: 'Parroquia San José'
            }
          },
          required: ['nombre']
        },
        SexoInput: {
          type: 'object',
          properties: {
            sexo: {
              type: 'string',
              maxLength: 100,
              description: 'Nombre del sexo/género',
              example: 'Masculino'
            }
          },
          required: ['sexo']
        },
        Sector: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del sector',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del sector',
              example: 'La Esperanza'
            },
            description: {
              type: 'string',
              description: 'Descripción del sector',
              example: 'Sector ubicado en la zona norte de la parroquia'
            },
            families: {
              type: 'integer',
              minimum: 0,
              description: 'Número total de familias',
              example: 150
            },
            completed: {
              type: 'integer',
              minimum: 0,
              description: 'Encuestas completadas',
              example: 45
            },
            pending: {
              type: 'integer',
              minimum: 0,
              description: 'Encuestas pendientes',
              example: 105
            },
            coordinator: {
              type: 'integer',
              description: 'ID del coordinador',
              example: 2
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Estado del sector',
              example: 'active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          },
          required: ['name']
        },
        SectorInput: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del sector',
              example: 'La Esperanza'
            },
            description: {
              type: 'string',
              description: 'Descripción del sector',
              example: 'Sector ubicado en la zona norte de la parroquia'
            },
            coordinator: {
              type: 'integer',
              description: 'ID del coordinador (opcional)',
              example: 2
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Estado del sector',
              example: 'active'
            },
            code: {
              type: 'string',
              maxLength: 20,
              description: 'Código único del sector (opcional)',
              example: 'SEC001'
            },
            municipioId: {
              type: 'integer',
              description: 'ID del municipio (opcional)',
              example: 1
            },
            veredaId: {
              type: 'integer',
              description: 'ID de la vereda (opcional)',
              example: 1
            }
          },
          required: ['name']
        },
        Parroquia: {
          type: 'object',
          properties: {
            id_parroquia: {
              type: 'integer',
              description: 'ID único de la parroquia',
              example: 1
            },
            nombre: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre de la parroquia',
              example: 'San José'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          },
          required: ['nombre']
        },
        Vereda: {
          type: 'object',
          properties: {
            id_vereda: {
              type: 'integer',
              description: 'ID único de la vereda',
              example: 1
            },
            nombre: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre de la vereda',
              example: 'La Esperanza'
            },
            id_municipio: {
              type: 'integer',
              description: 'ID del municipio',
              example: 1
            },
            municipio: {
              $ref: '#/components/schemas/Municipio'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          },
          required: ['nombre', 'id_municipio']
        },
        Municipio: {
          type: 'object',
          properties: {
            id_municipio: {
              type: 'integer',
              description: 'ID único del municipio',
              example: 1
            },
            nombre: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del municipio',
              example: 'Bogotá'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          },
          required: ['nombre']
        },
        Sexo: {
          type: 'object',
          properties: {
            id_sexo: {
              type: 'integer',
              description: 'ID único del sexo',
              example: 1
            },
            sexo: {
              type: 'string',
              maxLength: 50,
              description: 'Designación de sexo/género',
              example: 'Masculino'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          },
          required: ['sexo']
        },
        FamilyMember: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del miembro',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            surveyId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la encuesta',
              example: '123e4567-e89b-12d3-a456-426614174001'
            },
            nombres: {
              type: 'string',
              maxLength: 500,
              description: 'Nombres completos',
              example: 'Carlos Eduardo González López'
            },
            fechaNacimiento: {
              type: 'string',
              format: 'date',
              description: 'Fecha de nacimiento',
              example: '1985-03-15'
            },
            tipoIdentificacion: {
              type: 'string',
              enum: ['CC', 'TI', 'CE', 'PA', 'RC'],
              description: 'Tipo de identificación',
              example: 'CC'
            },
            numeroIdentificacion: {
              type: 'string',
              maxLength: 50,
              description: 'Número de identificación',
              example: '12345678'
            },
            sexo: {
              type: 'string',
              enum: ['M', 'F', 'Otro'],
              description: 'Sexo',
              example: 'M'
            },
            situacionCivil: {
              type: 'string',
              enum: ['Soltero', 'Soltera', 'Casado', 'Casada', 'Divorciado', 'Divorciada', 'Viudo', 'Viuda', 'Unión Libre'],
              description: 'Situación civil',
              example: 'Casado'
            },
            parentesco: {
              type: 'string',
              maxLength: 100,
              description: 'Parentesco con el jefe de familia',
              example: 'Jefe de familia'
            },
            estudio: {
              type: 'string',
              maxLength: 200,
              description: 'Nivel educativo',
              example: 'Universitario completo'
            },
            comunidadCultural: {
              type: 'string',
              maxLength: 100,
              description: 'Comunidad cultural',
              example: 'Ninguna'
            },
            telefono: {
              type: 'string',
              maxLength: 20,
              description: 'Teléfono personal',
              example: '3009876543'
            },
            correoElectronico: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico',
              example: 'carlos.gonzalez@email.com'
            }
          },
          required: ['nombres', 'fechaNacimiento', 'tipoIdentificacion', 'numeroIdentificacion', 'sexo', 'situacionCivil', 'parentesco', 'estudio', 'comunidadCultural']
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso requerido o inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                status: 'error',
                message: 'Token de acceso requerido',
                code: 'UNAUTHORIZED'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acceso denegado - permisos insuficientes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                status: 'error',
                message: 'Acceso denegado',
                code: 'FORBIDDEN'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                status: 'error',
                message: 'Usuario no encontrado',
                code: 'NOT_FOUND'
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                status: 'error',
                message: 'Errores de validación',
                code: 'VALIDATION_ERROR',
                errors: [
                  {
                    field: 'email',
                    message: 'El formato del email no es válido'
                  },
                  {
                    field: 'password',
                    message: 'La contraseña debe tener al menos 8 caracteres'
                  }
                ]
              }
            }
          }
        },
        ConflictError: {
          description: 'Conflicto - el recurso ya existe o hay un conflicto con el estado actual',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                status: 'error',
                message: 'El email ya está registrado',
                code: 'CONFLICT'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                status: 'error',
                message: 'Error interno del servidor',
                code: 'INTERNAL_SERVER_ERROR'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticación y gestión de cuentas'
      },
      {
        name: 'Users',
        description: 'Operaciones de gestión de usuarios'
      },
      {
        name: 'Surveys',
        description: 'Gestión de encuestas y familias'
      },
      {
        name: 'Parroquias',
        description: 'Gestión de catálogo de parroquias'
      },
      {
        name: 'Sectors',
        description: 'Gestión de catálogo de sectores'
      },
      {
        name: 'Veredas',
        description: 'Gestión de catálogo de veredas'
      },
      {
        name: 'Sexos',
        description: 'Gestión de catálogo de sexos'
      },
      {
        name: 'Catalog',
        description: 'Operaciones generales de catálogos'
      },
      {
        name: 'System',
        description: 'Endpoints del sistema y verificación de salud'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/routes/catalog/*.js',
    './src/controllers/*.js',
    './src/controllers/catalog/*.js'
  ]
};

/**
 * Generate Swagger specification
 */
const specs = swaggerJSDoc(swaggerConfig);

/**
 * Swagger UI options
 */
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    tryItOutEnabled: true
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { margin: 20px 0 }
    .swagger-ui .info .title { color: #3b4151 }
  `,
  customSiteTitle: 'Parroquia API Documentation'
};

/**
 * Setup Swagger middleware
 */
const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  
  // Serve swagger.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at: /api-docs');
};

export { swaggerConfig, specs, swaggerUiOptions, setupSwagger };
