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
              example: 'juan.perez@example.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user', 'moderator'],
              description: 'Rol del usuario en el sistema',
              example: 'user'
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
              example: 'juan.perez@example.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Contraseña (mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos)',
              example: 'MiPassword123!'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user', 'moderator'],
              default: 'user',
              description: 'Rol del usuario',
              example: 'user'
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
              example: 'juan.perez@example.com'
            },
            password: {
              type: 'string',
              description: 'Contraseña',
              example: 'MiPassword123!'
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
        ServerError: {
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
        name: 'System',
        description: 'Endpoints del sistema y verificación de salud'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
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
