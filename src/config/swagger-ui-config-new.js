/**
 * Configuración personalizada para Swagger UI
 * Mejora la apariencia y funcionalidad de la documentación API
 */

export const swaggerUiOptions = {
  // CSS personalizado externo
  customCssUrl: '/swagger-custom.css',
  
  // CSS adicional inline para complementar
  customCss: `
    /* CSS adicional para complementar el archivo externo */
    .swagger-ui .info .title::before {
      content: "⛪ ";
      font-size: 1.2em;
      margin-right: 10px;
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
    oauth2RedirectUrl: `${process.env.API_URL || 'http://localhost:3000'}/api-docs/oauth2-redirect.html`
  }
};

export default swaggerUiOptions;
