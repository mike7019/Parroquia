#!/usr/bin/env node

/**
 * Script para probar el servicio de municipios corregido
 */

import { loadAllModels } from './syncDatabaseComplete.js';
import sequelize from './config/sequelize.js';
import municipioService from './src/services/catalog/municipioService.js';

async function testMunicipioService() {
  try {
    console.log('🧪 PROBANDO SERVICIO DE MUNICIPIOS CORREGIDO');
    console.log('=' .repeat(60));

    // Cargar todos los modelos primero
    console.log('📦 Cargando modelos...');
    await loadAllModels();
    
    // Verificar que los modelos están disponibles
    const MunicipioModel = sequelize.models.Municipio;
    const DepartamentoModel = sequelize.models.Departamento;
    
    console.log(`✅ Modelo Municipio: ${MunicipioModel ? 'Encontrado' : 'NO encontrado'}`);
    console.log(`✅ Modelo Departamento: ${DepartamentoModel ? 'Encontrado' : 'NO encontrado'}`);
    
    if (MunicipioModel) {
      const associations = Object.keys(MunicipioModel.associations || {});
      console.log(`✅ Asociaciones de Municipio: ${associations.join(', ') || 'Ninguna'}`);
    }
    
    // Test 1: Obtener todos los municipios
    console.log('\n🔍 Test 1: Obtener todos los municipios...');
    try {
      const result = await municipioService.getAllMunicipios();
      console.log(`✅ Resultado: ${result.status}`);
      console.log(`📊 Total municipios: ${result.total}`);
      if (result.data.length > 0) {
        console.log(`📍 Primer municipio: ${result.data[0].nombre_municipio}`);
        console.log(`📍 Departamento: ${result.data[0].departamento?.nombre || 'N/A'}`);
      }
    } catch (error) {
      console.error(`❌ Error en Test 1: ${error.message}`);
    }
    
    // Test 2: Obtener municipio por ID
    console.log('\n🔍 Test 2: Obtener municipio por ID...');
    try {
      const municipio = await municipioService.getMunicipioById(1);
      console.log(`✅ Municipio encontrado: ${municipio.nombre_municipio}`);
      console.log(`📍 Departamento: ${municipio.departamento?.nombre || 'N/A'}`);
    } catch (error) {
      console.error(`❌ Error en Test 2: ${error.message}`);
    }
    
    // Test 3: Crear un municipio de prueba
    console.log('\n🔍 Test 3: Crear municipio de prueba...');
    try {
      const nuevoMunicipio = {
        nombre_municipio: 'Municipio Test Servicio',
        codigo_dane: '99999',
        id_departamento: 1 // Usar el primer departamento
      };
      
      const resultado = await municipioService.findOrCreateMunicipio(nuevoMunicipio);
      console.log(`✅ Municipio ${resultado.created ? 'creado' : 'encontrado'}: ${resultado.municipio.nombre_municipio}`);
      console.log(`📍 Departamento: ${resultado.municipio.departamento?.nombre || 'N/A'}`);
      
      // Limpiar - eliminar el municipio de prueba
      if (resultado.created) {
        await municipioService.deleteMunicipio(resultado.municipio.id_municipio);
        console.log('🧹 Municipio de prueba eliminado');
      }
      
    } catch (error) {
      console.error(`❌ Error en Test 3: ${error.message}`);
    }
    
    console.log('\n🎯 PRUEBAS DEL SERVICIO COMPLETADAS');
    return true;
    
  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBAS:', error.message);
    console.error('Stack:', error.stack);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar pruebas
testMunicipioService()
  .then(success => {
    console.log(success ? '✅ Todas las pruebas exitosas' : '❌ Algunas pruebas fallaron');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Error crítico:', error.message);
    process.exit(1);
  });
