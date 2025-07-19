import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import sequelize from '../config/sequelize.js';

// Configurar variables de entorno para testing
dotenv.config({ path: '.env.test' });

// Configuración global para tests
global.beforeAll(async () => {
  console.log('🧪 Iniciando configuración de pruebas...');
  
  // Configurar base de datos de test
  process.env.NODE_ENV = 'test';
  
  try {
    // Autenticar conexión a BD
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos de test establecida');
    
    // Solo sincronizar sin force para no eliminar el schema existente
    await sequelize.sync({ alter: false });
    console.log('✅ Base de datos sincronizada para tests');
  } catch (error) {
    console.error('❌ Error configurando base de datos de test:', error);
    throw error;
  }
});

global.afterAll(async () => {
  console.log('🧪 Limpiando después de las pruebas...');
  
  try {
    // Simplemente cerrar conexión sin intentar drop
    await sequelize.close();
    console.log('✅ Conexión a base de datos cerrada');
  } catch (error) {
    console.error('❌ Error cerrando conexión:', error);
  }
});

// Configurar timeout para pruebas
jest.setTimeout(10000);
