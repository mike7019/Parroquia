/**
 * Configuración personalizada para Swagger UI
 * Mejora la apariencia y funcionalidad de la documentación API
 */

export const swaggerUiOptions = {
  customCss: `
    /* Estilo personalizado para mejorar la apariencia */
    .swagger-ui .topbar { 
      background-color: #2C5530; 
      border-bottom: 3px solid #4CAF50;
    }
    
    .swagger-ui .topbar .topbar-wrapper { 
      content: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNENBRjUwIi8+Cjwvc3ZnPgo=');
    }
    
    .swagger-ui .info .title {
      color: #2C5530;
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    
    .swagger-ui .info .description {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    
    .swagger-ui .scheme-container {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #4CAF50;
      margin-bottom: 20px;
    }
    
    .swagger-ui .opblock-tag {
      border: none;
      border-radius: 8px;
      margin: 10px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .swagger-ui .opblock-tag-section h4 {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      padding: 15px 20px;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      border-radius: 8px 8px 0 0;
    }
    
    .swagger-ui .opblock.opblock-post {
      border-color: #4CAF50;
      background: rgba(76, 175, 80, 0.05);
    }
    
    .swagger-ui .opblock.opblock-get {
      border-color: #2196F3;
      background: rgba(33, 150, 243, 0.05);
    }
    
    .swagger-ui .opblock.opblock-put {
      border-color: #FF9800;
      background: rgba(255, 152, 0, 0.05);
    }
    
    .swagger-ui .opblock.opblock-delete {
      border-color: #F44336;
      background: rgba(244, 67, 54, 0.05);
    }
    
    .swagger-ui .btn.authorize {
      background: #4CAF50;
      border-color: #4CAF50;
      color: white;
      font-weight: bold;
      padding: 10px 20px;
      border-radius: 25px;
      transition: all 0.3s ease;
    }
    
    .swagger-ui .btn.authorize:hover {
      background: #45a049;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
    }
    
    .swagger-ui .parameter__name {
      font-weight: 600;
      color: #2C5530;
    }
    
    .swagger-ui .response-col_status {
      font-weight: bold;
    }
    
    .swagger-ui .response.default .response-col_status {
      color: #4CAF50;
    }
    
    /* Mejoras para los tags */
    .swagger-ui .opblock-tag-section {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin: 20px 0;
    }
    
    /* Estilo para el botón Try it out */
    .swagger-ui .btn.try-out__btn {
      background: #4CAF50;
      border-color: #4CAF50;
      color: white;
      border-radius: 20px;
      padding: 5px 15px;
    }
    
    .swagger-ui .btn.try-out__btn:hover {
      background: #45a049;
    }
    
    /* Estilo para los códigos de respuesta */
    .swagger-ui .response-col_status {
      font-size: 14px;
      font-weight: 700;
      font-family: monospace;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .swagger-ui .response.default .response-col_status {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    /* Mejoras de accesibilidad y legibilidad */
    .swagger-ui .parameter__type {
      color: #6c757d;
      font-style: italic;
    }
    
    .swagger-ui .parameter__in {
      color: #6c757d;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Estilo para ejemplos de código */
    .swagger-ui .highlight-code pre {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 15px;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .swagger-ui .info .title {
        font-size: 28px;
      }
      
      .swagger-ui .opblock-tag-section h4 {
        font-size: 18px;
        padding: 12px 15px;
      }
    }
  `,
  
  customSiteTitle: "Parroquia Management System API - Documentation",
  
  customfavIcon: '/favicon.ico',
  
  swaggerOptions: {
    docExpansion: 'none', // 'list', 'full' o 'none'
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    filter: true,
    showExtensions: false,
    showCommonExtensions: false,
    tryItOutEnabled: true,
    requestSnippetsEnabled: true,
    requestSnippets: {
      generators: {
        "curl_bash": {
          title: "cURL (bash)",
          syntax: "bash"
        },
        "curl_powershell": {
          title: "cURL (PowerShell)",
          syntax: "powershell"
        },
        "curl_cmd": {
          title: "cURL (cmd)",
          syntax: "bash"
        }
      },
      defaultExpanded: false,
      languages: null // defaults to all
    },
    persistAuthorization: true,
    displayOperationId: false,
    displayRequestDuration: true,
    deepLinking: true,
    showMutatedRequest: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    validatorUrl: null, // Disable online validation
    oauth2RedirectUrl: `${process.env.API_URL || 'http://localhost:4000'}/api-docs/oauth2-redirect.html`
  }
};

export default swaggerUiOptions;
