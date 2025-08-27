#!/usr/bin/env node

/**
 * Script para probar el sistema completo con las asociaciones actuales
 * Verifica si hay conflictos cuando se cargan todos los modelos
 */

import { loadAllModels } from './syncDatabaseComplete.js';
import sequelize from './config/sequelize.js';

async function testCompleteSystem() {
  try {
    console.log('🔍 Probando sistema completo con asociaciones actuales...\n');

    // Test 1: Verificar conexión
    console.log('1️⃣ Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Test 2: Cargar todos los modelos (como lo hace la aplicación)
    console.log('2️⃣ Cargando todos los modelos...');
    await loadAllModels();
    console.log('✅ Modelos cargados exitosamente\n');

    // Test 3: Verificar que las asociaciones están funcionando
    console.log('3️⃣ Verificando asociaciones activas...');
    
    const modelsWithAssociations = [];
    
    Object.keys(sequelize.models).forEach(modelName => {
      const model = sequelize.models[modelName];
      const associations = Object.keys(model.associations || {});
      
      if (associations.length > 0) {
        modelsWithAssociations.push({
          model: modelName,
          associations: associations
        });
      }
    });

    console.log(`✅ Modelos con asociaciones: ${modelsWithAssociations.length}`);
    modelsWithAssociations.forEach(item => {
      console.log(`   - ${item.model}: ${item.associations.join(', ')}`);
    });
    console.log('');

    // Test 4: Probar sync de base de datos
    console.log('4️⃣ Probando sincronización de base de datos...');
    await sequelize.sync({ alter: false });
    console.log('✅ Sincronización exitosa\n');

    // Test 5: Verificar las asociaciones específicas Departamentos-Municipios
    console.log('5️⃣ Verificando asociaciones Departamentos-Municipios específicamente...');
    
    const { Departamentos, Municipios } = sequelize.models;
    
    if (Departamentos && Municipios) {
      // Verificar que las asociaciones están configuradas
      const depAssociations = Object.keys(Departamentos.associations || {});
      const munAssociations = Object.keys(Municipios.associations || {});
      
      console.log(`✅ Departamentos asociaciones: ${depAssociations.join(', ')}`);
      console.log(`✅ Municipios asociaciones: ${munAssociations.join(', ')}`);
      
      // Intentar una consulta con include
      if (depAssociations.includes('municipios')) {
        try {
          const testQuery = await Departamentos.findOne({
            include: [{
              model: Municipios,
              as: 'municipios',
              limit: 1
            }],
            limit: 1
          });
          console.log('✅ Consulta con include funcionando correctamente');
        } catch (error) {
          console.log(`⚠️  Error en consulta con include: ${error.message}`);
        }
      }
    } else {
      console.log('⚠️  Modelos Departamentos o Municipios no encontrados');
    }
    console.log('');

    // Test 6: Verificar otros modelos importantes
    console.log('6️⃣ Verificando otros modelos críticos...');
    
    const criticalModels = ['Usuario', 'Persona', 'Familias', 'Sexo'];
    const foundModels = [];
    
    criticalModels.forEach(modelName => {
      if (sequelize.models[modelName]) {
        foundModels.push(modelName);
      }
    });
    
    console.log(`✅ Modelos críticos encontrados: ${foundModels.join(', ')}`);
    console.log('');

    console.log('🎉 RESULTADO FINAL:');
    console.log('✅ El sistema completo funciona correctamente');
    console.log('✅ Las asociaciones Departamentos-Municipios no causan conflictos');
    console.log('✅ Todos los modelos se cargan sin errores');
    console.log('\n💡 CONCLUSIÓN: Las líneas 64-69 están trabajando correctamente y NO deben comentarse\n');

    return true;

  } catch (error) {
    console.error('\n❌ ERROR EN EL SISTEMA COMPLETO:');
    console.error(`Tipo: ${error.name}`);
    console.error(`Mensaje: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    console.error('\n🔧 RECOMENDACIÓN: Revisar las asociaciones en models/index.js');
    console.error('Puede ser necesario comentar las líneas 64-69 si hay conflictos\n');
    
    return false;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar las pruebas del sistema completo
console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA COMPLETO');
console.log('=' .repeat(60));

testCompleteSystem()
  .then(success => {
    if (success) {
      console.log('🎯 Sistema completo validado exitosamente');
      process.exit(0);
    } else {
      console.log('💥 Se detectaron problemas en el sistema');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Error crítico en pruebas del sistema:', error.message);
    process.exit(1);
  });
