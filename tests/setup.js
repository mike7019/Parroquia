import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import sequelize from '../config/sequelize.js';

// Configurar variables de entorno para testing
dotenv.config({ path: '.env.test' });

// Mock de nodemailer para evitar envío real de emails en tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' }))
  }))
}));

// Configuración global para tests
global.beforeAll(async () => {
  console.log('🧪 Iniciando configuración de pruebas...');
  
  // Configurar base de datos de test
  process.env.NODE_ENV = 'test';
  
  try {
    // Autenticar conexión a BD
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos de test establecida');
    
    // Sincronizar modelos (esto creará las tablas si no existen)
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada para tests');
  } catch (error) {
    console.error('❌ Error configurando base de datos de test:', error);
    throw error;
  }
});

global.afterAll(async () => {
  console.log('🧪 Limpiando después de las pruebas...');
  
  try {
    // Limpiar base de datos
    await sequelize.drop();
    console.log('✅ Base de datos de test limpiada');
    
    // Cerrar conexión
    await sequelize.close();
    console.log('✅ Conexión a base de datos cerrada');
  } catch (error) {
    console.error('❌ Error limpiando base de datos de test:', error);
  }
});

// Configurar timeout para pruebas
jest.setTimeout(10000);
