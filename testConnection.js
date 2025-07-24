import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'parroquia_user', 
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Verificar que existan las tablas
    const [results] = await sequelize.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('tipo_identificacion', 'estado_civil', 'sexo')
      ORDER BY tablename;
    `);
    
    console.log('📋 Tablas encontradas:', results.map(r => r.tablename));
    
    // Verificar si ya hay datos
    const [count] = await sequelize.query(`
      SELECT COUNT(*) as count FROM tipo_identificacion;
    `);
    
    console.log('📊 Registros en tipo_identificacion:', count[0]?.count || 0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
