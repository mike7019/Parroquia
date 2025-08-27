#!/usr/bin/env node

/**
 * Script para probar el servicio de creación masiva de municipios
 */

import { loadAllModels } from './syncDatabaseComplete.js';
import sequelize from './config/sequelize.js';
import municipioService from './src/services/catalog/municipioService.js';

async function testBulkCreateMunicipios() {
  try {
    console.log('🧪 PROBANDO CREACIÓN MASIVA DE MUNICIPIOS');
    console.log('=' .repeat(60));

    // Cargar todos los modelos primero
    console.log('📦 Cargando modelos...');
    await loadAllModels();
    
    // Obtener departamentos disponibles
    console.log('\n📋 Obteniendo departamentos disponibles...');
    const departamentos = await municipioService.getAllDepartamentos();
    console.log(`✅ Encontrados ${departamentos.length} departamentos`);
    
    if (departamentos.length === 0) {
      throw new Error('No hay departamentos disponibles para crear municipios');
    }

    // Usar el primer departamento para las pruebas
    const primerDepartamento = departamentos[0];
    console.log(`📍 Usando departamento: ${primerDepartamento.nombre} (ID: ${primerDepartamento.id_departamento})`);

    // Preparar datos de prueba para creación masiva
    const municipiosPrueba = [
      {
        nombre_municipio: 'Municipio Bulk Test 1',
        codigo_dane: '99001',
        id_departamento: primerDepartamento.id_departamento
      },
      {
        nombre_municipio: 'Municipio Bulk Test 2', 
        codigo_dane: '99002',
        id_departamento: primerDepartamento.id_departamento
      },
      {
        nombre_municipio: 'Municipio Bulk Test 3',
        codigo_dane: '99003',
        id_departamento: primerDepartamento.id_departamento
      },
      // Formato legacy (solo string)
      'Municipio Legacy Test 1',
      'Municipio Legacy Test 2'
    ];

    console.log('\n🔄 Creando municipios en lote...');
    console.log(`📊 Total municipios a crear: ${municipiosPrueba.length}`);
    
    // Ejecutar creación masiva
    const resultado = await municipioService.bulkCreateMunicipios(municipiosPrueba, {
      defaultDepartamentoId: primerDepartamento.id_departamento
    });
    
    console.log(`✅ Creación masiva completada`);
    console.log(`📈 Municipios procesados: ${resultado.length}`);
    
    // Verificar los municipios creados
    console.log('\n🔍 Verificando municipios creados...');
    const municipiosCreados = [];
    
    for (const item of resultado) {
      try {
        const municipio = await municipioService.getMunicipioById(item.id_municipio);
        municipiosCreados.push(municipio);
        console.log(`   ✅ ${municipio.nombre_municipio} - ${municipio.departamento?.nombre || 'Sin departamento'}`);
      } catch (error) {
        console.log(`   ❌ Error verificando municipio ID ${item.id_municipio}: ${error.message}`);
      }
    }

    // Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    let eliminados = 0;
    
    for (const municipio of municipiosCreados) {
      try {
        await municipioService.deleteMunicipio(municipio.id_municipio);
        eliminados++;
        console.log(`   🗑️  Eliminado: ${municipio.nombre_municipio}`);
      } catch (error) {
        console.log(`   ⚠️  Error eliminando ${municipio.nombre_municipio}: ${error.message}`);
      }
    }

    console.log('\n🎯 RESULTADO DE LA PRUEBA:');
    console.log(`✅ Municipios creados exitosamente: ${municipiosCreados.length}`);
    console.log(`🧹 Municipios eliminados (limpieza): ${eliminados}`);
    console.log('✅ Servicio de creación masiva funcionando correctamente');

    return true;

  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBA DE CREACIÓN MASIVA:');
    console.error(`Tipo: ${error.name}`);
    console.error(`Mensaje: ${error.message}`);
    
    if (error.stack) {
      console.error(`Stack: ${error.stack}`);
    }
    
    return false;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
console.log('🚀 INICIANDO PRUEBA DE CREACIÓN MASIVA DE MUNICIPIOS');
console.log('=' .repeat(70));

testBulkCreateMunicipios()
  .then(success => {
    if (success) {
      console.log('\n🎉 Prueba de creación masiva completada exitosamente');
      process.exit(0);
    } else {
      console.log('\n💥 Prueba de creación masiva falló');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Error crítico en prueba:', error.message);
    process.exit(1);
  });
