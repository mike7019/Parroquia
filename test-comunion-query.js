import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'postgres', 
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function testQuery() {
  try {
    await sequelize.authenticate();
    console.log('✅ Probando query simple...');
    
    const [results] = await sequelize.query('SELECT id_familia, apellido_familiar, "comunionEnCasa" FROM familias LIMIT 1;');
    console.log('✅ Query exitosa:', results);
    
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    console.error('❌ Detalles:', error.original?.message);
  } finally {
    await sequelize.close();
  }
}

testQuery();
