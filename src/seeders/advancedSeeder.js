import sequelize from '../../config/sequelize.js';
import { runConfigSeeders } from './configSeeder.js';
import { seedProfesiones } from './profesionesSeeder.js';
import { seedTallas } from './tallasSeeder.js';

/**
 * Sistema avanzado de seeders que incluye tanto seeders básicos como avanzados
 * Incluye tablas de configuración base y catálogos especializados
 */

// Función principal que ejecuta todos los seeders en orden
export async function runAllSeeders() {
  console.log('\n🌱 INICIANDO SISTEMA COMPLETO DE SEEDERS...');
  
  const resultados = {
    configSeeders: null,
    profesiones: null,
    tallas: null,
    errores: []
  };

  try {
    // 1. Ejecutar seeders básicos de configuración
    console.log('\n📋 FASE 1: Seeders de Configuración Básica');
    console.log('='.repeat(50));
    resultados.configSeeders = await runConfigSeeders();
    
    // 2. Ejecutar seeder de profesiones
    console.log('\n💼 FASE 2: Seeder de Profesiones');
    console.log('='.repeat(50));
    try {
      resultados.profesiones = await seedProfesiones(sequelize);
      console.log('✅ Seeder de Profesiones completado exitosamente');
    } catch (error) {
      console.error('❌ Error en seeder de Profesiones:', error.message);
      resultados.errores.push(`Profesiones: ${error.message}`);
    }

    // 3. Ejecutar seeder de tallas
    console.log('\n🏷️  FASE 3: Seeder de Tallas');
    console.log('='.repeat(50));
    try {
      resultados.tallas = await seedTallas(sequelize);
      console.log('✅ Seeder de Tallas completado exitosamente');
    } catch (error) {
      console.error('❌ Error en seeder de Tallas:', error.message);
      resultados.errores.push(`Tallas: ${error.message}`);
    }

    // Resumen general
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN GENERAL DE SEEDERS');
    console.log('='.repeat(60));
    
    console.log('\n📋 Configuración Básica:');
    if (resultados.configSeeders) {
      console.log(`   ✅ Exitosos: ${resultados.configSeeders.success}`);
      console.log(`   ❌ Errores: ${resultados.configSeeders.errors}`);
      console.log(`   📊 Total: ${resultados.configSeeders.total}`);
    } else {
      console.log(`   ❌ No se pudo ejecutar`);
    }

    console.log('\n💼 Profesiones:');
    if (resultados.profesiones) {
      console.log(`   ✅ Creadas: ${resultados.profesiones.profesionesCreadas}`);
      console.log(`   🔄 Actualizadas: ${resultados.profesiones.profesionesActualizadas}`);
      console.log(`   📊 Total activas: ${resultados.profesiones.profesionesActivas}`);
    } else {
      console.log(`   ❌ No se pudo ejecutar`);
    }

    console.log('\n🏷️  Tallas:');
    if (resultados.tallas) {
      console.log(`   ✅ Creadas: ${resultados.tallas.tallasCreadas}`);
      console.log(`   🔄 Actualizadas: ${resultados.tallas.tallasActualizadas}`);
      console.log(`   📊 Total activas: ${resultados.tallas.tallasActivas}`);
    } else {
      console.log(`   ❌ No se pudo ejecutar`);
    }

    if (resultados.errores.length > 0) {
      console.log('\n❌ Errores encontrados:');
      resultados.errores.forEach(error => {
        console.log(`   • ${error}`);
      });
    }

    const totalExitosos = [
      resultados.configSeeders?.success || 0,
      resultados.profesiones ? 1 : 0,
      resultados.tallas ? 1 : 0
    ].reduce((a, b) => a + b, 0);

    const totalPosibles = 3; // config + profesiones + tallas

    console.log('\n🎯 RESULTADO FINAL:');
    console.log(`   📈 Seeders exitosos: ${totalExitosos}/${totalPosibles + (resultados.configSeeders?.total || 0) - 1}`);
    console.log(`   🎉 Estado: ${resultados.errores.length === 0 ? 'ÉXITO COMPLETO' : 'COMPLETADO CON ADVERTENCIAS'}`);

  } catch (error) {
    console.error('❌ Error crítico en sistema de seeders:', error);
    throw error;
  }

  return resultados;
}

// Función para ejecutar solo seeders avanzados (profesiones y tallas)
export async function runAdvancedSeeders() {
  console.log('\n🌱 EJECUTANDO SEEDERS AVANZADOS...');
  
  const resultados = {
    profesiones: null,
    tallas: null,
    errores: []
  };

  try {
    // Ejecutar seeder de profesiones
    console.log('\n💼 Seeder de Profesiones');
    console.log('-'.repeat(30));
    try {
      resultados.profesiones = await seedProfesiones(sequelize);
      console.log('✅ Profesiones completadas');
    } catch (error) {
      console.error('❌ Error en Profesiones:', error.message);
      resultados.errores.push(`Profesiones: ${error.message}`);
    }

    // Ejecutar seeder de tallas
    console.log('\n🏷️  Seeder de Tallas');
    console.log('-'.repeat(30));
    try {
      resultados.tallas = await seedTallas(sequelize);
      console.log('✅ Tallas completadas');
    } catch (error) {
      console.error('❌ Error en Tallas:', error.message);
      resultados.errores.push(`Tallas: ${error.message}`);
    }

    console.log('\n📊 Resumen Seeders Avanzados:');
    console.log(`   🎯 Profesiones: ${resultados.profesiones ? 'OK' : 'ERROR'}`);
    console.log(`   🎯 Tallas: ${resultados.tallas ? 'OK' : 'ERROR'}`);
    console.log(`   ❌ Errores: ${resultados.errores.length}`);

  } catch (error) {
    console.error('❌ Error en seeders avanzados:', error);
    throw error;
  }

  return resultados;
}

// Función para limpiar solo datos avanzados
export async function cleanAdvancedData() {
  console.log('\n🧹 Limpiando datos avanzados...');
  
  const tables = ['tallas', 'profesiones'];
  const resultados = [];

  for (const table of tables) {
    try {
      await sequelize.getQueryInterface().bulkDelete(table, null, {});
      console.log(`✅ Tabla ${table} limpiada`);
      resultados.push(`${table}: OK`);
    } catch (error) {
      console.warn(`⚠️  No se pudo limpiar ${table}: ${error.message}`);
      resultados.push(`${table}: ERROR`);
    }
  }

  console.log(`🏁 Limpieza completada: ${resultados.join(', ')}`);
  return resultados;
}

export default {
  runAllSeeders,
  runAdvancedSeeders,
  cleanAdvancedData,
  seedProfesiones,
  seedTallas
};
