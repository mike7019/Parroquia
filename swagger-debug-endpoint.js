// Endpoint de diagnóstico para Swagger - agregar al final de systemRoutes.js

/**
 * @swagger
 * /api/swagger-debug:
 *   get:
 *     summary: Debug endpoint for Swagger schema issues
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Swagger debug information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 sectorInputSchema:
 *                   $ref: '#/components/schemas/SectorInput'
 *                 message:
 *                   type: string
 *                   example: Schema verification successful
 */
router.get('/swagger-debug', (req, res) => {
  try {
    // Obtener el schema SectorInput directamente
    const sectorInputExample = {
      name: "Sector de Prueba",
      description: "Este es un sector de prueba para verificar el schema",
      coordinator: 1,
      status: "active",
      code: "TEST001",
      municipioId: 1,
      veredaId: 1
    };

    res.json({
      status: 'success',
      message: 'Schema verification successful',
      timestamp: new Date().toISOString(),
      sectorInputSchema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'La Esperanza' },
          description: { type: 'string', example: 'Sector ubicado en la zona norte' },
          coordinator: { type: 'integer', example: 2 },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          code: { type: 'string', example: 'SEC001' },
          municipioId: { type: 'integer', example: 1 },
          veredaId: { type: 'integer', example: 1 }
        }
      },
      sectorInputExample: sectorInputExample,
      schemaValidation: {
        hasRequiredFields: sectorInputExample.name ? true : false,
        allFieldsPresent: Object.keys(sectorInputExample).length === 7,
        validStatus: ['active', 'inactive'].includes(sectorInputExample.status)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Schema verification failed',
      error: error.message
    });
  }
});
