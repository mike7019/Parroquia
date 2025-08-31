#!/usr/bin/env node

console.log('🔍 Iniciando diagnóstico de importaciones...');

try {
  console.log('📦 Importando dotenv...');
  import('dotenv/config').then(() => {
    console.log('✅ dotenv cargado');
    
    console.log('📦 Importando express...');
    return import('express');
  }).then(() => {
    console.log('✅ express cargado');
    
    console.log('📦 Importando sequelize...');
    return import('../config/sequelize.js');
  }).then(() => {
    console.log('✅ sequelize cargado');
    
    console.log('📦 Importando loadAllModels...');
    return import('../syncDatabaseComplete.js');
  }).then((module) => {
    console.log('✅ syncDatabaseComplete cargado');
    console.log('📋 Exportaciones disponibles:', Object.keys(module));
    
    console.log('📦 Importando rutas de reportes...');
    return import('../src/routes/reporteRoutes.js');
  }).then(() => {
    console.log('✅ reporteRoutes cargado');
    
    console.log('🎉 Todas las importaciones completadas exitosamente!');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Error en importación:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Error sincrónico:', error);
  process.exit(1);
}
