#!/usr/bin/env node

/**
 * Script para debuggear los modelos disponibles
 */

import sequelize from './config/sequelize.js';

async function debugModels() {
  console.log('🔍 Debuggeando modelos disponibles...');
  
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');
    
    // Listar todos los modelos disponibles
    console.log('\n📋 Modelos disponibles en sequelize.models:');
    const modelNames = Object.keys(sequelize.models);
    console.log(`Total modelos: ${modelNames.length}`);
    
    modelNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    
    // Verificar específicamente el modelo Sector
    console.log('\n🏘️ Verificando modelo Sector:');
    const SectorModel = sequelize.models.Sector;
    
    if (SectorModel) {
      console.log('✅ Modelo Sector encontrado');
      console.log('Tabla:', SectorModel.tableName);
      console.log('Atributos:', Object.keys(SectorModel.rawAttributes));
      
      // Verificar asociaciones
      console.log('Asociaciones:', Object.keys(SectorModel.associations || {}));
      
      // Intentar hacer una consulta simple
      try {
        const count = await SectorModel.count();
        console.log(`Registros en tabla: ${count}`);
        
        // Intentar crear un registro de prueba
        console.log('\n🧪 Probando creación directa...');
        const testSector = {
          nombre: 'Test Direct ' + Date.now(),
          id_municipio: 1
        };
        
        console.log('Datos a crear:', testSector);
        const created = await SectorModel.create(testSector);
        console.log('✅ Creación exitosa:', created.toJSON());
        
        // Eliminar el registro de prueba
        await created.destroy();
        console.log('✅ Registro de prueba eliminado');
        
      } catch (error) {
        console.log('❌ Error en operación:', error.message);
        console.log('Stack:', error.stack);
      }
      
    } else {
      console.log('❌ Modelo Sector NO encontrado');
    }
    
    // Verificar modelo Municipios
    console.log('\n🏛️ Verificando modelo Municipios:');
    const MunicipiosModel = sequelize.models.Municipios;
    
    if (MunicipiosModel) {
      console.log('✅ Modelo Municipios encontrado');
      const municipioCount = await MunicipiosModel.count();
      console.log(`Municipios disponibles: ${municipioCount}`);
      
      // Verificar que existe municipio con ID 1
      const municipio1 = await MunicipiosModel.findByPk(1);
      if (municipio1) {
        console.log(`✅ Municipio ID 1: ${municipio1.nombre_municipio}`);
      } else {
        console.log('❌ No existe municipio con ID 1');
      }
    } else {
      console.log('❌ Modelo Municipios NO encontrado');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

debugModels().catch(console.error);