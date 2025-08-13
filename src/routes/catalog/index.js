import express from 'express';
import parroquiaRoutes from './parroquiaRoutes.js';
import veredaRoutes from './veredaRoutes.js';
import sexoRoutes from './sexoRoutes.js';
import municipioRoutes from './municipioRoutes.js';
import departamentoRoutes from './departamentoRoutes.js';
import sectorRoutes from './sectorRoutes.js';
import tipoIdentificacionRoutes from './tipoIdentificacionRoutes.js';
import enfermedadRoutes from './enfermedadRoutes.js';
import disposicionBasuraRoutes from './disposicionBasuraRoutes.js';
import aguasResidualesRoutes from './aguasResidualesRoutes.js';
import sistemaAcueductoRoutes from './sistemaAcueductoRoutes.js';
import tipoViviendaRoutes from './tipoViviendaRoutes.js';
import parentescoRoutes from './parentescoRoutes.js';
import situacionCivilRoutes from './situacionCivilRoutes.js';
import estudioRoutes from './estudioRoutes.js';
import comunidadCulturalRoutes from './comunidadCulturalRoutes.js';
import profesionRoutes from './profesionRoutes.js';
import tallaRoutes from './tallas.js';

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
 *                     enfermedades:
 *                       type: string
 *                       example: 'active'
 *                     sistemasAcueducto:
 *                       type: string
 *                       example: 'active'
 *                     tiposVivienda:
 *                       type: string
 *                       example: 'active'
 *                     parentescos:
 *                       type: string
 *                       example: 'active'
 *                     situacionesCiviles:
 *                       type: string
 *                       example: 'active'
 *                     estudios:
 *                       type: string
 *                       example: 'active'
 *                     comunidadesCulturales:
 *                       type: string
 *                       example: 'active'
 *                     profesiones:
 *                       type: string
 *                       example: 'active'
 *                     tallas:
 *                       type: string
 *                       example: 'active'
 */

// Mount catalog routes
router.use('/parroquias', parroquiaRoutes);
router.use('/veredas', veredaRoutes);
router.use('/sexos', sexoRoutes);
router.use('/municipios', municipioRoutes);
router.use('/departamentos', departamentoRoutes);
router.use('/sectors', sectorRoutes);
router.use('/tipos-identificacion', tipoIdentificacionRoutes);
router.use('/enfermedades', enfermedadRoutes);
router.use('/disposicion-basura', disposicionBasuraRoutes);
router.use('/aguas-residuales', aguasResidualesRoutes);
router.use('/sistemas-acueducto', sistemaAcueductoRoutes);
router.use('/tipos-vivienda', tipoViviendaRoutes);
router.use('/parentescos', parentescoRoutes);
router.use('/situaciones-civiles', situacionCivilRoutes);
router.use('/estudios', estudioRoutes);
router.use('/comunidades-culturales', comunidadCulturalRoutes);
router.use('/profesiones', profesionRoutes);
router.use('/tallas', tallaRoutes);

// Health check for catalog module
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Catalog API is healthy - All services active',
    timestamp: new Date().toISOString(),
    services: {
      parroquias: 'active',
      municipios: 'active',
      departamentos: 'active',
      veredas: 'active',
      sexos: 'active',
      sectors: 'active',
      tiposIdentificacion: 'active',
      enfermedades: 'active',
      disposicionBasura: 'active',
      aguasResiduales: 'active',
      sistemasAcueducto: 'active',
      tiposVivienda: 'active',
      parentescos: 'active',
      situacionesCiviles: 'active',
      estudios: 'active',
      comunidadesCulturales: 'active',
      profesiones: 'active',
      tallas: 'active'
    }
  });
});

export default router;
