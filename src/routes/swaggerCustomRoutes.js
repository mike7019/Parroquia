import express from 'express';
import { specs } from '../config/swagger.js';

const router = express.Router();

/**
 * Endpoint personalizado de Swagger que renderiza el esquema correctamente
 */
router.get('/api-docs-custom', (req, res) => {
  // Esquema de sector completamente definido
  const sectorSchema = {
    type: 'object',
    required: ['name'],
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
        minimum: 1,
        description: 'ID del coordinador (opcional)',
        example: 2
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        default: 'active',
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
        minimum: 1,
        description: 'ID del municipio (opcional)',
        example: 1
      },
      veredaId: {
        type: 'integer',
        minimum: 1,
        description: 'ID de la vereda (opcional)',
        example: 1
      }
    }
  };

  const customSwaggerHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Parroquia API - Documentación</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@latest/swagger-ui.css" />
    <style>
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
        .custom-example { 
            background: #f7f7f7; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 10px 0;
            font-family: monospace;
        }
        .schema-fix {
            background: #e7f3ff;
            border: 1px solid #0366d6;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    
    <div class="schema-fix">
        <h3>🔧 Esquema para POST /api/catalog/sectors</h3>
        <p><strong>Use este JSON como ejemplo en lugar del "string" que muestra Swagger UI:</strong></p>
        <div class="custom-example">
{
  "name": "Sector San José",
  "description": "Sector ubicado en el centro de la parroquia",
  "coordinator": 2,
  "status": "active", 
  "code": "SJ001",
  "municipioId": 1,
  "veredaId": 1
}
        </div>
        <p><strong>Campos obligatorios:</strong> name</p>
        <p><strong>Valores para status:</strong> "active" o "inactive"</p>
        <p><strong>Campos numéricos:</strong> coordinator, municipioId, veredaId (enteros positivos)</p>
    </div>

    <script src="https://unpkg.com/swagger-ui-dist@latest/swagger-ui-bundle.js"></script>
    <script>
        const spec = ${JSON.stringify(specs, null, 2)};
        
        // Forzar el esquema inline para sectores
        if (spec.paths && spec.paths['/api/catalog/sectors'] && spec.paths['/api/catalog/sectors'].post) {
            spec.paths['/api/catalog/sectors'].post.requestBody.content['application/json'].schema = ${JSON.stringify(sectorSchema, null, 2)};
        }
        
        const ui = SwaggerUIBundle({
            spec: spec,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
            defaultModelRendering: "model",
            tryItOutEnabled: true,
            filter: true,
            validatorUrl: null,
            onComplete: function() {
                console.log('✅ Swagger UI cargado con esquema corregido');
                console.log('📋 Esquema de sector:', ${JSON.stringify(sectorSchema, null, 2)});
            }
        });
        
        window.ui = ui;
    </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(customSwaggerHtml);
});

/**
 * Endpoint JSON para el esquema de sector específicamente
 */
router.get('/sector-schema', (req, res) => {
  const sectorSchema = {
    type: 'object',
    required: ['name'],
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
        minimum: 1,
        description: 'ID del coordinador (opcional)',
        example: 2
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        default: 'active',
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
        minimum: 1,
        description: 'ID del municipio (opcional)',
        example: 1
      },
      veredaId: {
        type: 'integer',
        minimum: 1,
        description: 'ID de la vereda (opcional)',
        example: 1
      }
    },
    example: {
      name: "Sector San José",
      description: "Sector ubicado en el centro de la parroquia",
      coordinator: 2,
      status: "active",
      code: "SJ001",
      municipioId: 1,
      veredaId: 1
    }
  };

  res.json({
    status: 'success',
    schema: sectorSchema,
    instructions: {
      usage: 'Use este esquema para POST /api/catalog/sectors',
      required: ['name'],
      optional: ['description', 'coordinator', 'status', 'code', 'municipioId', 'veredaId'],
      statusValues: ['active', 'inactive'],
      example: sectorSchema.example
    }
  });
});

export default router;
