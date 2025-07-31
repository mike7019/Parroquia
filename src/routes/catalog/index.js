import express from 'express';
import parroquiaRoutes from './parroquiaRoutes.js';
import veredaRoutes from './veredaRoutes.js';
import sexoRoutes from './sexoRoutes.js';
import municipioRoutes from './municipioRoutes.js';
// import departamentoRoutes from './departamentoRoutes.js'; // CRUD no necesario
import sectorRoutes from './sectorRoutes.js';
import tipoIdentificacionRoutes from './tipoIdentificacionRoutes.js';

const router = express.Router();

/**
 * @swagger
 * /api/catalog/health:
 *   get:
 *     summary: Health check for catalog module
 *     tags: [Catalog]
 *     responses:
 *       200:
 *         description: Catalog API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Catalog API is healthy'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     parroquias:
 *                       type: string
 *                       example: 'active'
 *                     municipios:
 *                       type: string
 *                       example: 'active'
 *                     sectors:
 *                       type: string
 *                       example: 'active'
 *                     veredas:
 *                       type: string
 *                       example: 'active'
 *                     sexos:
 *                       type: string
 *                       example: 'active'
 *                     tiposIdentificacion:
 *                       type: string
 *                       example: 'active'
 */

// Mount catalog routes
router.use('/parroquias', parroquiaRoutes);
router.use('/veredas', veredaRoutes);
router.use('/sexos', sexoRoutes);
router.use('/municipios', municipioRoutes);
// router.use('/departamentos', departamentoRoutes); // CRUD no necesario
router.use('/sectors', sectorRoutes);
router.use('/tipos-identificacion', tipoIdentificacionRoutes);

// Health check for catalog module
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Catalog API is healthy',
    timestamp: new Date().toISOString(),
    services: {
      parroquias: 'active',
      municipios: 'active',
      veredas: 'active',
      sexos: 'active',
      sectors: 'active',
      tiposIdentificacion: 'active'
    }
  });
});

export default router;
