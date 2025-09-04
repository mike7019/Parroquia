import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT, 
  dialect: 'postgres', 
  logging: false
});

try {
  await sequelize.authenticate();
  
  const [tables] = await sequelize.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%disposicion%'
  `);
  
  console.log('🗑️ TABLAS DE DISPOSICIÓN:');
  if (tables.length > 0) {
    tables.forEach(t => console.log(`   ${t.table_name}`));
  } else {
    console.log('❌ No se encontraron tablas de disposición');
  }
  
  await sequelize.close();
} catch(e) { 
  console.error('Error:', e.message); 
}
