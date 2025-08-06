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
              type: 'string',
              format: 'uuid',
              description: 'ID único del usuario (UUID)',
              example: '2acc2c01-91d8-4d3a-a184-f002304620ec'
            },
            correo_electronico: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario',
              example: 'usuario@example.com'
            },
            primer_nombre: {
              type: 'string',
              description: 'Primer nombre del usuario',
              example: 'Juan'
            },
            segundo_nombre: {
              type: 'string',
              nullable: true,
              description: 'Segundo nombre del usuario (opcional)',
              example: 'Carlos'
            },
            primer_apellido: {
              type: 'string',
              description: 'Primer apellido del usuario',
              example: 'Pérez'
            },
            segundo_apellido: {
              type: 'string',
              nullable: true,
              description: 'Segundo apellido del usuario (opcional)',
              example: 'García'
            },
            activo: {
              type: 'boolean',
              description: 'Estado activo del usuario',
              example: true
            },
            email_verificado: {
              type: 'boolean',
              description: 'Si el email ha sido verificado',
              example: true
            },
            fecha_verificacion_email: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha de verificación del email',
              example: '2025-07-31T10:30:00.000Z'
            },
            expira_token_reset: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha de expiración del token de reset',
              example: '2025-07-31T12:30:00.000Z'
            },
            roles: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Lista de roles asignados al usuario',
              example: ['Administrador']
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del rol',
              example: '00000000-0000-0000-0000-000000000001'
            },
            nombre: {
              type: 'string',
              enum: ['Administrador', 'Encuestador'],
              description: 'Nombre del rol',
              example: 'Encuestador'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del rol y sus permisos',
              example: 'Usuario con permisos para realizar encuestas'
            }
          }
        },
        UserInput: {
          type: 'object',
          required: ['primer_nombre', 'primer_apellido', 'correo_electronico', 'contrasena', 'rol'],
          properties: {
            primer_nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Primer nombre del usuario',
              example: 'Diego',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            segundo_nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              nullable: true,
              description: 'Segundo nombre del usuario (opcional)',
              example: 'Carlos',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            primer_apellido: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Primer apellido del usuario',
              example: 'Garcia',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            segundo_apellido: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              nullable: true,
              description: 'Segundo apellido del usuario (opcional)',
              example: 'López',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            correo_electronico: {
              type: 'string',
              format: 'email',
              maxLength: 100,
              description: 'Correo electrónico único',
              example: 'diego.garcia5105@yopmail.com'
            },
            contrasena: {
              type: 'string',
              minLength: 8,
              maxLength: 100,
              description: 'Contraseña (8-100 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos)',
              example: 'Fuerte789&',
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$'
            },
            telefono: {
              type: 'string',
              minLength: 10,
              maxLength: 20,
              nullable: true,
              description: 'Número de teléfono del usuario (opcional, 10-20 caracteres)',
              example: '+57 300 456 7890',
              pattern: '^[\\+]?[0-9\\s\\-\\(\\)]+$'
            },
            rol: {
              type: 'string',
              enum: ['Administrador', 'Encuestador'],
              description: 'Rol del usuario en el sistema',
              example: 'Encuestador'
            }
          }
        },
        UserUpdate: {
          type: 'object',
          properties: {
            primer_nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Primer nombre del usuario (opcional para actualización)',
              example: 'Juan',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            segundo_nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              nullable: true,
              description: 'Segundo nombre del usuario (opcional)',
              example: 'Carlos',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            primer_apellido: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Primer apellido del usuario (opcional para actualización)',
              example: 'Pérez',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            segundo_apellido: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              nullable: true,
              description: 'Segundo apellido del usuario (opcional)',
              example: 'García',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            correo_electronico: {
              type: 'string',
              format: 'email',
              maxLength: 100,
              description: 'Correo electrónico único (opcional para actualización)',
              example: 'juan.perez@yopmail.com'
            },
            telefono: {
              type: 'string',
              minLength: 10,
              maxLength: 20,
              description: 'Número de teléfono del usuario (opcional)',
              example: '+57 300 123 4567',
              pattern: '^[\\+]?[0-9\\s\\-\\(\\)]+$'
            }
          }
        },
        LoginInput: {
          type: 'object',
          required: ['correo_electronico', 'contrasena'],
          properties: {
            correo_electronico: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico',
              example: 'ana.herrera8687@yopmail.com'
            },
            contrasena: {
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
        RefreshTokenInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Token de actualización JWT válido',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              pattern: '^[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_.+/=]*$'
            }
          }
        },
        ForgotPasswordInput: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              maxLength: 100,
              description: 'Correo electrónico para restablecer contraseña',
              example: 'usuario@example.com'
            }
          }
        },
        PasswordResetInput: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: {
              type: 'string',
              minLength: 32,
              maxLength: 64,
              description: 'Token de restablecimiento de contraseña (32-64 caracteres alfanuméricos)',
              example: 'a1b2c3d4e5f6789012345678901234567890abcdef123456789012345678901234',
              pattern: '^[a-zA-Z0-9]+$'
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              maxLength: 100,
              description: 'Nueva contraseña (8-100 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos)',
              example: 'NuevaPassword123!',
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$'
            }
          }
        },
        ChangePasswordInput: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              maxLength: 100,
              description: 'Contraseña actual',
              example: 'MiPasswordActual123!'
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              maxLength: 100,
              description: 'Nueva contraseña (8-100 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos, diferente a la actual)',
              example: 'MiNuevaPassword456!',
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$'
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
          required: ['familyHead', 'address', 'familySize', 'housingType']
        },
        CreateSurveyRequest: {
          type: 'object',
          properties: {
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
          required: ['familyHead', 'address', 'familySize', 'housingType']
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
        FamiliaInput: {
          type: 'object',
          required: ['nombre_familia', 'direccion_familia', 'tratamiento_datos'],
          properties: {
            nombre_familia: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Nombre de familia',
              example: 'Familia González Pérez'
            },
            direccion_familia: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Dirección de la familia',
              example: 'Calle 15 #23-45, Barrio Centro'
            },
            numero_contrato_epm: {
              type: 'string',
              maxLength: 50,
              nullable: true,
              description: 'Número de contrato EPM (opcional)',
              example: 'EPM123456789'
            },
            telefono_familiar: {
              type: 'string',
              description: 'Teléfono familiar válido para Colombia (opcional)',
              example: '3001234567',
              pattern: '^3[0-9]{9}$'
            },
            tratamiento_datos: {
              type: 'boolean',
              description: 'Aceptación del tratamiento de datos personales',
              example: true
            }
          }
        },
        PersonaInput: {
          type: 'object',
          required: ['primer_nombre', 'primer_apellido', 'identificacion', 'telefono', 'correo_electronico', 'fecha_nacimiento', 'direccion'],
          properties: {
            primer_nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Primer nombre de la persona',
              example: 'María',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            segundo_nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              nullable: true,
              description: 'Segundo nombre de la persona (opcional)',
              example: 'Elena',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            primer_apellido: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Primer apellido de la persona',
              example: 'González',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            segundo_apellido: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              nullable: true,
              description: 'Segundo apellido de la persona (opcional)',
              example: 'Pérez',
              pattern: '^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$'
            },
            identificacion: {
              type: 'string',
              minLength: 6,
              maxLength: 20,
              description: 'Número de identificación (6-20 caracteres alfanuméricos)',
              example: '12345678',
              pattern: '^[a-zA-Z0-9]+$'
            },
            telefono: {
              type: 'string',
              minLength: 10,
              maxLength: 20,
              description: 'Número de teléfono (10-20 caracteres)',
              example: '+57 300 123 4567',
              pattern: '^[\\+]?[0-9\\s\\-\\(\\)]+$'
            },
            correo_electronico: {
              type: 'string',
              format: 'email',
              maxLength: 100,
              description: 'Correo electrónico',
              example: 'maria.gonzalez@example.com'
            },
            fecha_nacimiento: {
              type: 'string',
              format: 'date',
              description: 'Fecha de nacimiento (YYYY-MM-DD)',
              example: '1985-05-15'
            },
            direccion: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Dirección de residencia',
              example: 'Carrera 10 #5-25, Apartamento 3B'
            }
          }
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
              enum: ['CC', 'TI', 'RC', 'CE', 'PP', 'PEP', 'DIE', 'CCD'],
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
            id_municipio_municipios: {
              type: 'integer',
              description: 'ID del municipio (foreign key)',
              example: 1
            },
            id_sector_sector: {
              type: 'integer',
              description: 'ID del sector (foreign key)',
              example: 1
            },
            municipio: {
              $ref: '#/components/schemas/Municipio'
            },
            sector: {
              $ref: '#/components/schemas/Sector'
            }
          },
          required: ['nombre', 'id_municipio_municipios', 'id_sector_sector']
        },
        Municipio: {
          type: 'object',
          properties: {
            id_municipio: {
              type: 'integer',
              description: 'ID único del municipio',
              example: 1
            },
            nombre_municipio: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del municipio',
              example: 'Bogotá'
            },
            codigo_dane: {
              type: 'string',
              maxLength: 5,
              description: 'Código DANE del municipio (5 dígitos)',
              example: '05001'
            },
            id_departamento: {
              type: 'integer',
              description: 'ID del departamento al que pertenece',
              example: 1
            }
          },
          required: ['nombre_municipio']
        },
        Sexo: {
          type: 'object',
          properties: {
            id_sexo: {
              type: 'integer',
              description: 'ID único del sexo',
              example: 1
            },
            descripcion: {
              type: 'string',
              maxLength: 255,
              description: 'Descripción del tipo de sexo',
              example: 'Masculino'
            }
          },
          required: ['descripcion']
        },
        CreateMunicipioRequest: {
          type: 'object',
          properties: {
            nombre_municipio: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del municipio',
              example: 'Medellín'
            }
          },
          required: ['nombre_municipio']
        },
        UpdateMunicipioRequest: {
          type: 'object',
          properties: {
            nombre_municipio: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del municipio',
              example: 'Cali'
            }
          }
        },
        MunicipiosListResponse: {
          type: 'object',
          properties: {
            municipios: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Municipio'
              }
            },
            pagination: {
              $ref: '#/components/schemas/Pagination'
            }
          }
        },
        Departamento: {
          type: 'object',
          properties: {
            id_departamento: {
              type: 'integer',
              description: 'ID único del departamento',
              example: 1
            },
            nombre: {
              type: 'string',
              maxLength: 100,
              description: 'Nombre del departamento',
              example: 'Antioquia'
            },
            codigo_dane: {
              type: 'string',
              maxLength: 2,
              description: 'Código DANE del departamento (2 dígitos)',
              example: '05'
            }
          },
          required: ['nombre', 'codigo_dane']
        },
        DepartamentoInput: {
          type: 'object',
          properties: {
            nombre: {
              type: 'string',
              maxLength: 100,
              description: 'Nombre del departamento',
              example: 'Antioquia'
            },
            codigo_dane: {
              type: 'string',
              maxLength: 2,
              description: 'Código DANE del departamento (2 dígitos)',
              example: '05'
            }
          },
          required: ['nombre', 'codigo_dane']
        },
        DepartamentosListResponse: {
          type: 'object',
          properties: {
            departamentos: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Departamento'
              }
            },
            pagination: {
              $ref: '#/components/schemas/Pagination'
            }
          }
        },
        Sector: {
          type: 'object',
          properties: {
            id_sector: {
              type: 'integer',
              description: 'ID único del sector',
              example: 1
            },
            nombre: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del sector',
              example: 'Urbano'
            }
          },
          required: ['nombre']
        },
        CreateSectorRequest: {
          type: 'object',
          properties: {
            nombre: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del sector',
              example: 'Rural'
            }
          },
          required: ['nombre']
        },
        UpdateSectorRequest: {
          type: 'object',
          properties: {
            nombre: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del sector',
              example: 'Semi-urbano'
            }
          }
        },
        SectorsListResponse: {
          type: 'object',
          properties: {
            sectors: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Sector'
              }
            },
            pagination: {
              $ref: '#/components/schemas/Pagination'
            }
          }
        },
        TipoIdentificacion: {
          type: 'object',
          properties: {
            id_tipo_identificacion: {
              type: 'integer',
              description: 'ID único del tipo de identificación',
              example: 1
            },
            descripcion: {
              type: 'string',
              maxLength: 255,
              description: 'Descripción del tipo de identificación',
              example: 'Cédula de Ciudadanía'
            },
            codigo: {
              type: 'string',
              maxLength: 10,
              description: 'Código del tipo de identificación',
              example: 'CC'
            }
          },
          required: ['descripcion', 'codigo']
        },
        CreateTipoIdentificacionRequest: {
          type: 'object',
          properties: {
            descripcion: {
              type: 'string',
              maxLength: 255,
              description: 'Descripción del tipo de identificación',
              example: 'Cédula de Ciudadanía'
            },
            codigo: {
              type: 'string',
              maxLength: 10,
              description: 'Código del tipo de identificación',
              example: 'CC'
            }
          },
          required: ['descripcion', 'codigo']
        },
        UpdateTipoIdentificacionRequest: {
          type: 'object',
          properties: {
            descripcion: {
              type: 'string',
              maxLength: 255,
              description: 'Descripción del tipo de identificación',
              example: 'Cédula de Ciudadanía Digital'
            },
            codigo: {
              type: 'string',
              maxLength: 10,
              description: 'Código del tipo de identificación',
              example: 'CCD'
            }
          }
        },
        TiposIdentificacionListResponse: {
          type: 'object',
          properties: {
            tiposIdentificacion: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TipoIdentificacion'
              }
            },
            pagination: {
              $ref: '#/components/schemas/Pagination'
            }
          }
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
            tipoIdentificacion: {
              type: 'string',
              enum: ['CC', 'TI', 'RC', 'CE', 'PP', 'PEP', 'DIE', 'CCD'],
              description: 'Tipo de documento de identidad',
              example: 'CC'
            },
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
        },
        // Esquemas actualizados de Municipios
        MunicipioBasic: {
          type: 'object',
          properties: {
            id_municipio: {
              type: 'integer',
              description: 'ID único del municipio',
              example: 1
            },
            nombre_municipio: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del municipio',
              example: 'Medellín'
            },
            codigo_dane: {
              type: 'string',
              maxLength: 5,
              description: 'Código DANE del municipio (5 dígitos)',
              example: '05001'
            }
          }
        },
        MunicipioComplete: {
          type: 'object',
          properties: {
            id_municipio: {
              type: 'integer',
              description: 'ID único del municipio',
              example: 1
            },
            nombre_municipio: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del municipio',
              example: 'Medellín'
            },
            codigo_dane: {
              type: 'string',
              maxLength: 5,
              description: 'Código DANE del municipio (5 dígitos)',
              example: '05001'
            },
            id_departamento: {
              type: 'integer',
              description: 'ID del departamento al que pertenece',
              example: 1
            },
            departamentoData: {
              type: 'object',
              properties: {
                id_departamento: {
                  type: 'integer',
                  example: 1
                },
                nombre: {
                  type: 'string',
                  example: 'Antioquia'
                },
                codigo_dane: {
                  type: 'string',
                  example: '05'
                }
              }
            }
          },
          required: ['nombre_municipio', 'codigo_dane', 'id_departamento']
        },
        MunicipioInput: {
          type: 'object',
          properties: {
            nombre_municipio: {
              type: 'string',
              maxLength: 255,
              description: 'Nombre del municipio',
              example: 'Bogotá D.C.'
            },
            codigo_dane: {
              type: 'string',
              maxLength: 5,
              pattern: '^[0-9]{5}$',
              description: 'Código DANE del municipio (5 dígitos)',
              example: '11001'
            },
            id_departamento: {
              type: 'integer',
              description: 'ID del departamento al que pertenece el municipio',
              example: 1
            }
          },
          required: ['nombre_municipio', 'codigo_dane', 'id_departamento']
        },
        MunicipiosListResponse: {
          type: 'object',
          properties: {
            municipios: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/MunicipioComplete'
              }
            },
            pagination: {
              $ref: '#/components/schemas/Pagination'
            }
          }
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
        name: 'Municipios',
        description: 'Gestión de catálogo de municipios'
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
    tryItOutEnabled: true,
    deepLinking: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    defaultModelRendering: 'model',
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    requestSnippetsEnabled: true,
    validatorUrl: null, // Disable validator to avoid external requests
    oauth2RedirectUrl: null,
    showMutatedRequest: true,
    requestSnippets: {
      generators: {
        curl_bash: {
          title: "cURL (bash)",
          syntax: "bash"
        },
        curl_powershell: {
          title: "cURL (PowerShell)",
          syntax: "powershell"
        }
      }
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { margin: 20px 0 }
    .swagger-ui .info .title { color: #3b4151 }
    .swagger-ui .model-box { background: #f9f9f9; border: 1px solid #e3e3e3; }
    .swagger-ui .model { font-family: monospace; }
    .swagger-ui .model .property { margin: 5px 0; }
    .swagger-ui .model-toggle { cursor: pointer; }
    .swagger-ui .models { margin-top: 20px; }
    .swagger-ui .model-container { border: 1px solid #d3d3d3; margin: 10px 0; }
  `,
  customSiteTitle: 'Parroquia API Documentation'
};

/**
 * Setup Swagger middleware
 */
const setupSwagger = (app) => {
  // Configurar headers para evitar caché
  app.use('/api-docs', (req, res, next) => {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    next();
  }, swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  
  // Serve swagger.json sin caché
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at: /api-docs');
};

export { swaggerConfig, specs, swaggerUiOptions, setupSwagger };
