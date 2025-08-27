import express from 'express';
import sequelize from '../../config/sequelize.js';

const router = express.Router();

/**
 * Ruta de diagnóstico para verificar modelos y asociaciones
 * Solo para desarrollo - debe removerse en producción
 */
router.get('/debug/models', async (req, res) => {
  try {
    const diagnostico = {
      timestamp: new Date().toISOString(),
      sequelize_models: {},
      municipio_info: null,
      departamento_info: null,
      test_query: null
    };

    // Verificar modelos disponibles
    Object.keys(sequelize.models).forEach(modelName => {
      const model = sequelize.models[modelName];
      diagnostico.sequelize_models[modelName] = {
        tableName: model.tableName,
        associations: Object.keys(model.associations || {})
      };
    });

    // Información específica del modelo Municipio
    const MunicipioModel = sequelize.models.Municipio || sequelize.models.Municipios;
    if (MunicipioModel) {
      diagnostico.municipio_info = {
        exists: true,
        name: MunicipioModel.name,
        tableName: MunicipioModel.tableName,
        associations: Object.keys(MunicipioModel.associations || {}),
        association_details: {}
      };

      // Detalles de asociaciones
      Object.keys(MunicipioModel.associations || {}).forEach(alias => {
        const assoc = MunicipioModel.associations[alias];
        diagnostico.municipio_info.association_details[alias] = {
          type: assoc.associationType,
          target: assoc.target.name,
          foreignKey: assoc.foreignKey
        };
      });
    } else {
      diagnostico.municipio_info = { exists: false };
    }

    // Información específica del modelo Departamento
    const DepartamentoModel = sequelize.models.Departamento || sequelize.models.Departamentos;
    if (DepartamentoModel) {
      diagnostico.departamento_info = {
        exists: true,
        name: DepartamentoModel.name,
        tableName: DepartamentoModel.tableName,
        associations: Object.keys(DepartamentoModel.associations || {})
      };
    } else {
      diagnostico.departamento_info = { exists: false };
    }

    // Probar una consulta simple
    if (MunicipioModel) {
      try {
        const municipio = await MunicipioModel.findOne({
          include: [
            {
              association: 'departamento',
              attributes: ['id_departamento', 'nombre']
            }
          ],
          limit: 1
        });

        diagnostico.test_query = {
          success: true,
          municipio_found: !!municipio,
          municipio_name: municipio?.nombre_municipio,
          departamento_name: municipio?.departamento?.nombre
        };
      } catch (error) {
        diagnostico.test_query = {
          success: false,
          error: error.message
        };
      }
    }

    res.json({
      success: true,
      diagnostico
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
});

/**
 * Ruta de diagnóstico específica para el servicio de municipios
 */
router.get('/debug/municipio-service', async (req, res) => {
  try {
    // Importar el servicio dinámicamente
    const municipioService = (await import('../services/catalog/municipioService.js')).default;
    
    const diagnostico = {
      timestamp: new Date().toISOString(),
      service_test: null
    };

    // Probar el servicio
    try {
      const result = await municipioService.getAllMunicipios();
      diagnostico.service_test = {
        success: true,
        status: result.status,
        total: result.total,
        first_municipio: result.data[0]?.nombre_municipio,
        first_departamento: result.data[0]?.departamento?.nombre
      };
    } catch (error) {
      diagnostico.service_test = {
        success: false,
        error: error.message
      };
    }

    res.json({
      success: true,
      diagnostico
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
});

/**
 * Ruta de prueba para crear un municipio
 */
router.post('/debug/test-create-municipio', async (req, res) => {
  try {
    // Importar el servicio dinámicamente
    const municipioService = (await import('../services/catalog/municipioService.js')).default;
    
    const testData = {
      nombre_municipio: 'Test Municipio Debug',
      codigo_dane: '99998',
      id_departamento: 1 // Usar el primer departamento disponible
    };

    const result = await municipioService.findOrCreateMunicipio(testData);
    
    // Si se creó, eliminarlo inmediatamente para limpiar
    if (result.created) {
      await municipioService.deleteMunicipio(result.municipio.id_municipio);
    }

    res.json({
      success: true,
      test_result: {
        created: result.created,
        municipio_name: result.municipio.nombre_municipio,
        departamento_name: result.municipio.departamento?.nombre,
        cleaned_up: result.created
      },
      message: 'Test completed successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
});

export default router;
