/**
 * Script detallado para capturar el error específico de Sequelize
 */

import './src/models/index.js';
import SituacionCivilService from './src/services/situacionCivilService.js';
import sequelize from './config/sequelize.js';

async function capturarErrorSequelize() {
  console.log('🔍 CAPTURANDO ERROR DETALLADO DE SEQUELIZE');
  
  try {
    // Test con datos básicos que deberían funcionar
    console.log('\n1️⃣ Probando inserción directa en el modelo...');
    
    const SituacionCivil = sequelize.models.SituacionCivil;
    
    const testData = {
      id_situacion_civil: 999, // ID manual para evitar conflictos
      nombre: 'Test Directo',
      descripcion: 'Descripción de prueba'
    };
    
    try {
      // Inserción directa en el modelo
      const result = await SituacionCivil.create(testData);
      console.log('✅ Inserción directa exitosa:', result.id_situacion_civil);
      
      // Limpiar
      await result.destroy({ force: true });
      
    } catch (error) {
      console.log('❌ Error en inserción directa:', error.name);
      console.log('   Mensaje:', error.message);
      
      if (error.errors) {
        console.log('   Errores detallados:');
        error.errors.forEach(err => {
          console.log(`     - ${err.path}: ${err.message} (${err.type})`);
        });
      }
    }

    // Test 2: Con el servicio
    console.log('\n2️⃣ Probando con el servicio...');
    
    try {
      const serviceData = {
        nombre: 'Test Servicio',
        descripcion: 'Descripción de prueba'
      };
      
      const result = await SituacionCivilService.createSituacionCivil(serviceData);
      console.log('✅ Servicio exitoso:', result);
      
    } catch (error) {
      console.log('❌ Error en servicio:', error.name);
      console.log('   Mensaje:', error.message);
      console.log('   Stack completo:');
      console.log(error.stack);
      
      if (error.errors) {
        console.log('   Errores detallados:');
        error.errors.forEach(err => {
          console.log(`     - ${err.field || err.path}: ${err.message} (${err.type || 'custom'})`);
        });
      }
    }

    // Test 3: Verificar estado de la tabla
    console.log('\n3️⃣ Verificando estado actual de la tabla...');
    
    try {
      const count = await SituacionCivil.count();
      console.log(`   Total de registros: ${count}`);
      
      const maxId = await SituacionCivil.max('id_situacion_civil');
      console.log(`   ID máximo: ${maxId}`);
      
      // Mostrar algunos registros
      const samples = await SituacionCivil.findAll({
        limit: 5,
        order: [['id_situacion_civil', 'DESC']]
      });
      
      console.log('   Últimos 5 registros:');
      samples.forEach(s => {
        console.log(`     ID ${s.id_situacion_civil}: ${s.nombre} (${s.activo ? 'activo' : 'inactivo'})`);
      });
      
    } catch (error) {
      console.log('❌ Error consultando tabla:', error.message);
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }

  process.exit(0);
}

capturarErrorSequelize();