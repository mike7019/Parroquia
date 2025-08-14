#!/usr/bin/env node
/**
 * Script para probar la sincronización del modelo Talla
 */

import { Talla } from './src/models/index.js';

async function testTallaSync() {
  try {
    console.log('🔧 Probando sincronización del modelo Talla...');
    
    // Sincronizar solo el modelo Talla
    await Talla.sync({ alter: true });
    console.log('✅ Modelo Talla sincronizado correctamente');
    
    // Verificar que la tabla existe y tiene la estructura correcta
    const tableInfo = await Talla.describe();
    console.log('📋 Estructura de la tabla:');
    Object.keys(tableInfo).forEach(column => {
      console.log(`   - ${column}: ${tableInfo[column].type}`);
    });
    
    // Insertar algunos datos de prueba si no existen
    const count = await Talla.count();
    if (count === 0) {
      console.log('📝 Insertando datos de prueba...');
      await Talla.bulkCreate([
        { tipo_prenda: 'zapato', talla: '35', genero: 'femenino', equivalencia_numerica: 35 },
        { tipo_prenda: 'zapato', talla: '40', genero: 'masculino', equivalencia_numerica: 40 },
        { tipo_prenda: 'camisa', talla: 'M', genero: 'unisex', equivalencia_numerica: 3 },
        { tipo_prenda: 'pantalon', talla: '32', genero: 'unisex', equivalencia_numerica: 32 }
      ]);
      console.log('✅ Datos de prueba insertados');
    } else {
      console.log(`📊 La tabla ya tiene ${count} registros`);
    }
    
    // Probar una consulta
    const tallas = await Talla.findAll({ limit: 3 });
    console.log('🔍 Primeras 3 tallas:');
    tallas.forEach(talla => {
      console.log(`   - ${talla.tipo_prenda} talla ${talla.talla} (${talla.genero})`);
    });
    
    console.log('🎉 Modelo Talla funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error probando modelo Talla:', error.message);
    throw error;
  }
}

// Ejecutar el test
testTallaSync()
  .then(() => {
    console.log('✅ Test completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el test:', error.message);
    process.exit(1);
  });
