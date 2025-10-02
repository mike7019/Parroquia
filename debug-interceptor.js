/**
 * Script para capturar el error específico que llega al catch
 */

import './src/models/index.js';
import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';

async function interceptarErrorReal() {
  console.log('🔍 INTERCEPTANDO ERROR REAL EN EL SERVICIO');
  
  const originalCreate = SituacionCivilService.createSituacionCivil;
  
  // Monkey patch para interceptar
  SituacionCivilService.createSituacionCivil = async function(data) {
    const transaction = await sequelize.transaction();
    
    try {
      // Simulamos el código del servicio hasta el punto del error
      console.log('📊 Datos recibidos:', data);
      
      const simplifiedData = {
        nombre: data.nombre,
        descripcion: data.descripcion || null
      };
      
      console.log('📊 Datos simplificados:', simplifiedData);
      
      if (data.codigo !== undefined && data.codigo !== null && data.codigo.trim() !== '') {
        simplifiedData.codigo = data.codigo;
      }
      
      if (data.orden !== undefined && data.orden !== null) {
        simplifiedData.orden = data.orden;
      }
      
      if (data.activo !== undefined && data.activo !== null) {
        simplifiedData.activo = data.activo;
      }
      
      console.log('📊 Datos finales antes de validación:', simplifiedData);
      
      // Llamar validación personalizada
      await SituacionCivilService._validateSituacionCivilData(simplifiedData, null, false);
      console.log('✅ Validación personalizada pasó');
      
      // Find next ID
      const nextId = await SituacionCivilService.findNextAvailableId();
      simplifiedData.id_situacion_civil = nextId;
      
      console.log('📊 Datos con ID antes de create:', simplifiedData);
      
      // Intentar create
      const SituacionCivil = sequelize.models.SituacionCivil;
      const situacionCivil = await SituacionCivil.create(simplifiedData, { transaction });
      
      await transaction.commit();
      
      return {
        id: situacionCivil.id_situacion_civil,
        nombre: situacionCivil.nombre,
        descripcion: situacionCivil.descripcion,
        createdAt: situacionCivil.createdAt,
        updatedAt: situacionCivil.updatedAt
      };
      
    } catch (error) {
      await transaction.rollback();
      
      console.log('💥 ERROR CAPTURADO:');
      console.log('   - Tipo:', error.constructor.name);
      console.log('   - Mensaje:', error.message);
      console.log('   - Es ValidationError:', error.name === 'SequelizeValidationError');
      console.log('   - Es UniqueConstraintError:', error.name === 'SequelizeUniqueConstraintError');
      
      if (error.errors) {
        console.log('   - Errores detallados:');
        error.errors.forEach((err, i) => {
          console.log(`     ${i + 1}. ${err.path}: ${err.message} (${err.type})`);
        });
      }
      
      // Re-lanzar el error original para ver qué pasa
      throw error;
    }
  };
  
  try {
    const testData = {
      nombre: 'Test Interceptor',
      descripcion: 'Descripción de prueba'
    };
    
    const result = await SituacionCivilService.createSituacionCivil(testData);
    console.log('✅ Resultado exitoso:', result);
    
  } catch (error) {
    console.log('🚨 ERROR FINAL RECIBIDO:');
    console.log('   - Tipo:', error.constructor.name);
    console.log('   - Mensaje:', error.message);
    console.log('   - Stack:', error.stack);
  }

  process.exit(0);
}

interceptarErrorReal();