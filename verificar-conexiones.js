/**
 * VERIFICADOR SIMPLE DE CONEXIONES
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar .env
dotenv.config();

console.log('🔍 VERIFICANDO CONEXIONES DE BASE DE DATOS');
console.log('==========================================\n');

// Configuración LOCAL
console.log('📋 Variables locales (.env):');
console.log('DB_HOST:', process.env.DB_HOST || 'No configurada');
console.log('DB_PORT:', process.env.DB_PORT || 'No configurada');
console.log('DB_NAME:', process.env.DB_NAME || 'No configurada');
console.log('DB_USER:', process.env.DB_USER || 'No configurada');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Configurada ✅' : 'No configurada ❌');

// Configuración REMOTA
console.log('\n📋 Variables remotas (sistema):');
console.log('REMOTE_DB_HOST:', process.env.REMOTE_DB_HOST || 'No configurada');
console.log('REMOTE_DB_PORT:', process.env.REMOTE_DB_PORT || 'No configurada');
console.log('REMOTE_DB_NAME:', process.env.REMOTE_DB_NAME || 'No configurada');
console.log('REMOTE_DB_USER:', process.env.REMOTE_DB_USER || 'No configurada');
console.log('REMOTE_DB_PASSWORD:', process.env.REMOTE_DB_PASSWORD ? 'Configurada ✅' : 'No configurada ❌');

// Probar conexión LOCAL
if (process.env.DB_PASSWORD) {
  console.log('\n🔗 Probando conexión LOCAL...');
  try {
    const sequelizeLocal = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false
      }
    );
    
    await sequelizeLocal.authenticate();
    console.log('✅ Conexión LOCAL exitosa');
    
    // Contar tablas
    const [result] = await sequelizeLocal.query(`
      SELECT COUNT(*) as total 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    console.log(`📊 Tablas encontradas: ${result[0].total}`);
    
    await sequelizeLocal.close();
  } catch (error) {
    console.log('❌ Error conexión LOCAL:', error.message);
  }
} else {
  console.log('\n⚠️  No se puede probar conexión LOCAL - falta DB_PASSWORD');
}

// Probar conexión REMOTA
if (process.env.REMOTE_DB_PASSWORD) {
  console.log('\n🔗 Probando conexión REMOTA...');
  try {
    const sequelizeRemote = new Sequelize(
      process.env.REMOTE_DB_NAME || 'parroquia_db',
      process.env.REMOTE_DB_USER || 'parroquia_user',
      process.env.REMOTE_DB_PASSWORD,
      {
        host: process.env.REMOTE_DB_HOST || '206.62.139.100',
        port: process.env.REMOTE_DB_PORT || 5432,
        dialect: 'postgres',
        logging: false
      }
    );
    
    await sequelizeRemote.authenticate();
    console.log('✅ Conexión REMOTA exitosa');
    
    // Contar tablas
    const [result] = await sequelizeRemote.query(`
      SELECT COUNT(*) as total 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    console.log(`📊 Tablas encontradas: ${result[0].total}`);
    
    await sequelizeRemote.close();
  } catch (error) {
    console.log('❌ Error conexión REMOTA:', error.message);
  }
} else {
  console.log('\n⚠️  No se puede probar conexión REMOTA - falta REMOTE_DB_PASSWORD');
}
